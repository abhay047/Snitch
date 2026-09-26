import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { useCart } from '../hook/useCart'
import { useAuth } from '../../auth/hook/useAuth'
import LogoutConfirmModal from '../../auth/components/LogoutConfirmModal.jsx'
import ClearBagConfirmModal from '../components/ClearBagConfirmModal.jsx'
import { setItems } from '../state/cart.slice'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

// Convert variant attributes (Map or plain Object) to standard key-value object
const getAttributesObject = (attrs) => {
  if (!attrs) return {}
  try {
    if (attrs instanceof Map) {
      return Object.fromEntries(attrs.entries())
    }
    if (typeof attrs === 'object') {
      return { ...attrs }
    }
  } catch {
    return {}
  }
  return {}
}

const formatPrice = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹'
  const numeric = Math.max(0, Number(amount) || 0)
  return `${symbol}${numeric.toLocaleString('en-IN')}`
}

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart?.items) || []
  const user = useSelector((state) => state.auth?.user)
  const authLoading = useSelector((state) => state.auth?.loading)
  const { handleGetCart, handleUpdateQuantity: updateQuantityInCart, handleRemoveItem: removeItemFromCart, handleClearCart: clearAllInCart } = useCart()
  const { handleGetMe, handleLogout } = useAuth()

  // Logout Confirmation Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Clear Bag Confirmation Modal State
  const [isClearBagModalOpen, setIsClearBagModalOpen] = useState(false)
  const [isClearingBag, setIsClearingBag] = useState(false)

  const handleUserLogout = () => {
    setIsUserDropdownOpen(false)
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await handleLogout()
      setIsLogoutModalOpen(false)
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  // User Profile Dropdown state in Header
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    fullname: user?.fullname || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'upi',
  })

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show auto-dismissing toast
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Load cart data from backend on mount
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        setLoading(true)
        setFetchError(null)
        if (!user && handleGetMe) {
          try {
            await handleGetMe()
          } catch {
            // Ignore auth check error
          }
        }
        await handleGetCart()
      } catch (err) {
        if (isMounted) {
          setFetchError(err?.response?.data?.message || 'Unable to load your shopping bag.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Update checkout form when user data loads
  useEffect(() => {
    if (user?.fullname && !checkoutForm.fullname) {
      setCheckoutForm((prev) => ({ ...prev, fullname: user.fullname }))
    }
  }, [user])

  // Helper to resolve product image from item
  const getItemImage = (item) => {
    const product = typeof item.product === 'object' ? item.product : null
    const variantId = item.variant ? String(item.variant) : null
    const matchedVariant = variantId && product?.variants
      ? product.variants.find((v) => String(v._id) === variantId)
      : null

    // 1. Check variant images
    if (matchedVariant?.images && matchedVariant.images.length > 0) {
      const vImg = matchedVariant.images[0]
      if (typeof vImg === 'string') return vImg
      if (vImg?.url) return vImg.url
    }

    // 2. Check product images
    if (product?.images && product.images.length > 0) {
      const pImg = product.images[0]
      if (typeof pImg === 'string') return pImg
      if (pImg?.url) return pImg.url
    }

    return null
  }

  // Helper to extract variant attributes for display
  const getItemVariantDetails = (item) => {
    const product = typeof item.product === 'object' ? item.product : null
    const variantId = item.variant
      ? String(typeof item.variant === 'object' ? item.variant._id || item.variant : item.variant)
      : null
    const matchedVariant = variantId && product?.variants
      ? product.variants.find((v) => String(v._id) === variantId)
      : null

    if (!matchedVariant) {
      const fallbackStock = product?.stock != null
        ? Math.max(0, Number(product.stock))
        : product?.variants && product.variants.length > 0
        ? Math.max(0, Number(product.variants[0]?.stock) || 0)
        : 10

      return {
        variant: null,
        size: null,
        color: product?.color || null,
        stock: fallbackStock,
        otherAttrs: [],
      }
    }

    const attrs = getAttributesObject(matchedVariant.attributes)
    const size = attrs.size || attrs.Size || attrs.SIZE || null
    const color = attrs.color || attrs.Color || attrs.colour || attrs.Colour || product?.color || null
    const otherAttrs = Object.entries(attrs).filter(
      ([k]) => !['size', 'color', 'colour'].includes(k.toLowerCase())
    )

    return {
      variant: matchedVariant,
      size,
      color,
      stock: matchedVariant.stock != null ? Math.max(0, Number(matchedVariant.stock)) : 0,
      otherAttrs,
    }
  }

  // Helper to extract unit price for an item
  const getItemUnitPrice = (item) => {
    if (item.price?.amount != null) return Number(item.price.amount)
    const product = typeof item.product === 'object' ? item.product : null
    const variantId = item.variant ? String(item.variant) : null
    const matchedVariant = variantId && product?.variants
      ? product.variants.find((v) => String(v._id) === variantId)
      : null

    if (matchedVariant?.price?.amount != null) return Number(matchedVariant.price.amount)
    if (product?.price?.amount != null) return Number(product.price.amount)
    return 0
  }

  const getItemCurrency = (item) => {
    return item.price?.currency || item.product?.price?.currency || 'INR'
  }

  // Handle quantity change with backend persistence and stock check
  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return
    const { stock } = getItemVariantDetails(item)
    if (newQty > stock) {
      showToast(`Only ${stock} unit${stock > 1 ? 's' : ''} available in stock`)
      return
    }

    const itemId = item._id
    if (!itemId) return

    try {
      setUpdatingItemId(itemId)
      await updateQuantityInCart({ itemId, quantity: newQty })
      showToast('Bag quantity updated')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update quantity')
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Handle item removal with backend persistence
  const handleRemoveItem = async (item) => {
    const itemId = item._id
    if (!itemId) return
    const prodTitle = item?.product?.title || 'Garment'

    try {
      setUpdatingItemId(itemId)
      await removeItemFromCart({ itemId })
      showToast(`Removed "${prodTitle}" from your bag`)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to remove garment from bag')
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Open custom modal to clear entire bag (no browser window.confirm popup)
  const handleOpenClearBagModal = () => {
    if (cartItems.length > 0) {
      setIsClearBagModalOpen(true)
    }
  }

  // Confirm clear all items from bag with backend persistence
  const handleConfirmClearBag = async () => {
    try {
      setIsClearingBag(true)
      await clearAllInCart()
      setIsClearBagModalOpen(false)
      showToast('All garments removed from bag')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to empty shopping bag')
    } finally {
      setIsClearingBag(false)
    }
  }

  // Calculate Order Totals
  const { subtotal, totalQuantity, primaryCurrency } = useMemo(() => {
    let sum = 0
    let totalQty = 0
    let currency = 'INR'

    cartItems.forEach((item) => {
      const unit = getItemUnitPrice(item)
      const qty = Math.max(1, Number(item.quantity) || 1)
      sum += unit * qty
      totalQty += qty
      currency = getItemCurrency(item)
    })

    return {
      subtotal: sum,
      totalQuantity: totalQty,
      primaryCurrency: currency,
    }
  }, [cartItems])

  // Calculate 18% GST and 5% Handling Fee (Shipping remains FREE)
  const gstAmount = useMemo(() => {
    return Math.round(subtotal * 0.18)
  }, [subtotal])

  const handlingFee = useMemo(() => {
    return Math.round(subtotal * 0.05)
  }, [subtotal])

  const finalTotal = useMemo(() => {
    if (subtotal <= 0) return 0
    return subtotal + gstAmount + handlingFee
  }, [subtotal, gstAmount, handlingFee])

  // Handle Checkout Order Submission
  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (!checkoutForm.fullname || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.pincode) {
      alert('Please fill out all required shipping address fields.')
      return
    }

    setIsSubmittingOrder(true)
    setTimeout(() => {
      const generatedId = `SN-${Math.floor(100000 + Math.random() * 900000)}`
      setPlacedOrderId(generatedId)
      setOrderPlaced(true)
      setIsSubmittingOrder(false)
      dispatch(setItems([]))
      showToast('Order confirmed successfully!')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative font-sans selection:bg-yellow-400 selection:text-zinc-950 flex flex-col">
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.035)_0%,transparent_70%)]" />
        <div className="absolute top-[45%] left-[-80px] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_70%)]" />
      </div>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-yellow-400 text-zinc-950 px-4 py-2 text-center text-[11px] font-black tracking-[0.25em] uppercase select-none relative z-10">
        <span>Snitch Store • Complimentary Express Shipping On All Orders</span>
      </div>

      {/* ── STICKY FROSTED NAVBAR ── */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Badge */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/Logo.png"
                alt="Snitch Logo"
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-white font-bold text-xl tracking-[0.2em] uppercase">
                Snitch
              </span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-zinc-400 text-[10px] tracking-[0.25em] uppercase font-medium">
                Shopping Bag
              </span>
            </div>
          </div>

          {/* Center Navigation: Link to Catalog */}
          <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-semibold">
            <Link
              to="/"
              className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors py-1 select-none"
            >
              <span>Explore Drops</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Right Navigation / User Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            {authLoading ? (
              <div className="h-8 w-24 bg-zinc-900/60 animate-pulse rounded-sm" />
            ) : user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {user.role === 'seller' && (
                  <Link
                    to="/seller/dashboard"
                    className="text-zinc-400 hover:text-white text-xs tracking-wider uppercase font-semibold hidden md:flex items-center gap-1.5 transition-colors px-3 py-2 border border-zinc-800/80 hover:border-zinc-700 rounded-sm bg-zinc-900/40"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* User Dropdown Trigger */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 -m-1 rounded-sm hover:bg-zinc-900/60 transition-colors cursor-pointer group select-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-zinc-500 flex items-center justify-center text-zinc-200 font-bold text-xs uppercase transition-colors">
                      {user.fullname ? user.fullname[0] : 'U'}
                    </div>
                    <span className="text-zinc-300 group-hover:text-white text-xs hidden sm:inline font-medium transition-colors">
                      {user.fullname || user.email}
                    </span>
                    <svg className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-sm bg-[#0e0e0e] border border-zinc-800 shadow-2xl py-2 z-50 text-xs">
                      <div className="px-4 py-3 border-b border-zinc-900">
                        <p className="text-white font-bold truncate">{user.fullname || 'Authenticated Buyer'}</p>
                        <p className="text-zinc-500 text-[11px] truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-sm bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[9px] font-mono uppercase tracking-wider font-bold">
                          {user.role === 'seller' ? 'Seller Account' : 'Snitch Club Member'}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                        >
                          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                          </svg>
                          <span>Store Home</span>
                        </Link>
                        {user.role === 'seller' && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                          >
                            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            <span>Seller Studio</span>
                          </Link>
                        )}

                        <div className="h-px bg-zinc-900 my-1" />

                        {/* Functional Log Out Button */}
                        <button
                          type="button"
                          onClick={handleUserLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-sm transition-colors text-left font-medium cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bag Indicator */}
                <div
                  title="Items in your bag"
                  className="relative p-2 text-white bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center select-none"
                >
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="ml-1.5 text-xs font-mono font-bold text-white">
                    {totalQuantity}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-zinc-300 hover:text-white text-xs tracking-wider uppercase font-semibold transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-4 py-2.5 text-[11px] tracking-[0.2em] uppercase rounded-sm transition-all shadow-sm"
                >
                  Join Club
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 relative z-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-900">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors group cursor-pointer"
          >
            <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Continue Shopping</span>
          </Link>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={handleOpenClearBagModal}
              className="text-[11px] uppercase tracking-wider text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear Entire Bag
            </button>
          )}
        </div>

        {/* Page Title & Count Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                Order Review
              </span>
            </div>
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none">
              Your Shopping Bag
            </h1>
          </div>
          <div className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
            {cartItems.length === 0
              ? '0 Items'
              : `${cartItems.length} Garment${cartItems.length > 1 ? 's' : ''} • ${totalQuantity} Total Unit${totalQuantity > 1 ? 's' : ''}`}
          </div>
        </div>

        {/* ── STATE 1: LOADING SKELETON ── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
            <div className="lg:col-span-8 space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="p-4 sm:p-6 bg-zinc-950/40 border border-zinc-900 rounded-sm flex gap-4 sm:gap-6">
                  <div className="w-24 sm:w-28 aspect-[3/4] bg-zinc-900 rounded-sm shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-zinc-900 rounded w-1/3" />
                    <div className="h-6 bg-zinc-900 rounded w-2/3" />
                    <div className="h-3 bg-zinc-900 rounded w-1/4" />
                    <div className="h-8 bg-zinc-900 rounded w-28 mt-4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-sm space-y-4">
                <div className="h-5 bg-zinc-900 rounded w-1/2" />
                <div className="h-4 bg-zinc-900 rounded w-full" />
                <div className="h-4 bg-zinc-900 rounded w-full" />
                <div className="h-10 bg-zinc-900 rounded w-full mt-6" />
              </div>
            </div>
          </div>
        )}

        {/* ── STATE 2: ERROR ALERT ── */}
        {!loading && fetchError && (
          <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-sm max-w-xl mx-auto my-12 text-center">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h3 className="text-white text-base font-bold uppercase tracking-wider mb-1">
              Failed to load bag
            </h3>
            <p className="text-zinc-400 text-xs mb-5">{fetchError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                handleGetCart()
                  .catch((e) => setFetchError(e.message))
                  .finally(() => setLoading(false))
              }}
              className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-6 py-2.5 text-xs uppercase tracking-widest rounded-sm cursor-pointer shadow-md"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── STATE 3: EMPTY BAG VIEW ── */}
        {!loading && !fetchError && cartItems.length === 0 && (
          <div className="py-16 sm:py-24 text-center max-w-xl mx-auto">
            {/* Empty Bag Graphic */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full border border-zinc-800 bg-zinc-950/60 flex items-center justify-center text-zinc-600 relative group">
              <div className="absolute inset-0 rounded-full bg-yellow-400/5 blur-xl pointer-events-none" />
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>

            <span className="inline-block px-3 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono uppercase tracking-[0.25em] mb-3">
              0 Garments In Bag
            </span>

            <h2 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3">
              Your Bag Is Currently Empty
            </h2>

            <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-8">
              You haven't reserved any garments from our limited streetwear releases yet. Explore our latest drops to elevate your modern wardrobe.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-8 py-4 text-xs tracking-[0.25em] uppercase rounded-sm transition-all duration-200 shadow-xl shadow-yellow-400/10 cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>Explore Latest Drops</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {/* Shopping Perks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-12 border-t border-zinc-900/80 text-left">
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-sm">
                <div className="text-yellow-400 font-mono text-sm mb-1">01</div>
                <p className="text-white text-xs font-bold uppercase">Express Delivery</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Dispatched within 24h</p>
              </div>
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-sm">
                <div className="text-yellow-400 font-mono text-sm mb-1">02</div>
                <p className="text-white text-xs font-bold uppercase">Complimentary</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Free shipping on all drops</p>
              </div>
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-sm">
                <div className="text-yellow-400 font-mono text-sm mb-1">03</div>
                <p className="text-white text-xs font-bold uppercase">7-Day Returns</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Hassle-free exchanges</p>
              </div>
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-sm">
                <div className="text-yellow-400 font-mono text-sm mb-1">04</div>
                <p className="text-white text-xs font-bold uppercase">Authentic Drop</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">100% verified luxury</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STATE 4: POPULATED SHOPPING BAG ── */}
        {!loading && !fetchError && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ── LEFT COLUMN: ITEMS LIST (8 COLS) ── */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Garments in Bag ({cartItems.length})
                </span>
                <span className="text-zinc-500 text-[11px] font-mono">
                  Inventory reserved for limited window
                </span>
              </div>

              {cartItems.map((item, index) => {
                const product = typeof item.product === 'object' ? item.product : null
                const productId = product?._id || item.product
                const title = product?.title || 'Garment Piece'
                const category = product?.category ? `${product.category} Collection` : 'Limited Drop'
                const itemImg = getItemImage(item)
                const { size, color, stock, otherAttrs } = getItemVariantDetails(item)
                const unitPrice = getItemUnitPrice(item)
                const currency = getItemCurrency(item)
                const qty = Math.max(1, Number(item.quantity) || 1)
                const itemTotal = unitPrice * qty
                const isItemSoldOut = stock <= 0

                return (
                  <div
                    key={item._id || `${productId}-${item.variant || index}`}
                    className="p-4 sm:p-6 bg-zinc-950/60 border border-zinc-900/90 hover:border-zinc-800 transition-colors rounded-sm flex flex-col sm:flex-row gap-5 sm:gap-6 relative group"
                  >
                    {/* Garment Image Thumbnail */}
                    <Link
                      to={productId ? `/product/${productId}` : '#'}
                      className="w-full sm:w-28 md:w-32 aspect-[3/4] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800/80 shrink-0 relative block group-hover:border-zinc-700 transition-colors"
                    >
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={title}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900">
                          <svg className="w-8 h-8 mb-1 stroke-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                          <span className="text-[9px] uppercase tracking-widest text-zinc-600">No Image</span>
                        </div>
                      )}

                      {isItemSoldOut && (
                        <div className="absolute top-1.5 left-1.5 bg-red-600/90 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                          Sold Out
                        </div>
                      )}
                    </Link>

                    {/* Garment Details & Controls */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Category & Remove action button */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.25em]">
                            {category}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            disabled={updatingItemId === item._id}
                            aria-label={`Remove ${title} from bag`}
                            className="text-zinc-500 hover:text-red-400 p-1 -m-1 transition-colors cursor-pointer text-xs flex items-center gap-1 group/btn disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Remove from bag"
                          >
                            {updatingItemId === item._id ? (
                              <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-red-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            )}
                            <span className="hidden sm:inline text-[11px] font-medium">Remove</span>
                          </button>
                        </div>

                        {/* Title */}
                        <Link
                          to={productId ? `/product/${productId}` : '#'}
                          className="text-white hover:text-yellow-400 font-black text-base sm:text-lg tracking-tight uppercase transition-colors line-clamp-1 block"
                        >
                          {title}
                        </Link>

                        {/* Variant Badges (Color, Size, Custom) */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {color && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-zinc-500">Color:</span>
                              <span className="text-white">{color}</span>
                            </span>
                          )}

                          {size && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                              <span className="text-zinc-500 font-sans">Size:</span>
                              <span className="text-yellow-400">{size}</span>
                            </span>
                          )}

                          {otherAttrs.map(([k, v]) => (
                            <span key={k} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-[10px] uppercase font-mono">
                              <span className="text-zinc-600">{k}:</span>
                              <span>{String(v)}</span>
                            </span>
                          ))}

                          {/* Inventory status pill */}
                          {isItemSoldOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 text-[9px] font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              <span>Sold Out</span>
                            </span>
                          ) : stock <= 5 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              <span>Only {stock} Left</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>In Stock</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Controls: Quantity + Price breakdown */}
                      <div className="flex flex-wrap items-end justify-between gap-4 mt-5 pt-4 border-t border-zinc-900/80">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                            Qty:
                          </span>
                          <div className="flex items-center border border-zinc-800 rounded-sm bg-zinc-950">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, qty - 1)}
                              disabled={qty <= 1 || updatingItemId === item._id}
                              aria-label="Decrease quantity"
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="w-9 text-center text-white font-mono font-bold text-xs flex items-center justify-center">
                              {updatingItemId === item._id ? (
                                <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                qty
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, qty + 1)}
                              disabled={qty >= stock || updatingItemId === item._id}
                              aria-label="Increase quantity"
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          {unitPrice > 0 && qty > 1 && (
                            <span className="text-zinc-500 text-[11px] font-mono">
                              ({formatPrice(unitPrice, currency)} each)
                            </span>
                          )}
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
                            Subtotal
                          </span>
                          <span className="text-white text-lg sm:text-xl font-black font-mono tracking-tight">
                            {formatPrice(itemTotal, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Complimentary Delivery Perks Banner */}
              <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-sm flex items-center justify-between text-xs text-zinc-400 mt-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Complimentary Express Delivery activated for this drop.</span>
                </div>
                <span className="text-yellow-400 font-bold uppercase tracking-wider text-[11px] hidden sm:inline">
                  Free Shipping
                </span>
              </div>
            </div>

            {/* ── RIGHT COLUMN: ORDER SUMMARY (4 COLS - STICKY) ── */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-5">
                  <h2 className="text-white text-base font-black uppercase tracking-[0.2em]">
                    Order Summary
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {totalQuantity} Units
                  </span>
                </div>

                {/* Line Items */}
                <div className="space-y-3.5 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Garments Subtotal</span>
                    <span className="text-white font-mono font-bold">
                      {formatPrice(subtotal, primaryCurrency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Express Shipping</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">(Complimentary)</span>
                    </span>
                    <span className="text-emerald-400 font-bold uppercase font-mono">
                      FREE
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>GST (18%)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">(Govt. Tax)</span>
                    </span>
                    <span className="text-white font-mono font-bold">
                      +{formatPrice(gstAmount, primaryCurrency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Handling Charge (5%)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">(Care & Packaging)</span>
                    </span>
                    <span className="text-white font-mono font-bold">
                      +{formatPrice(handlingFee, primaryCurrency)}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="mt-6 pt-5 border-t border-zinc-900">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-zinc-400 text-xs uppercase font-bold tracking-[0.2em] block">
                        Estimated Total
                      </span>
                      <span className="text-zinc-500 text-[10px] mt-0.5 block">
                        Inclusive of 18% GST & 5% Handling Charge
                      </span>
                    </div>
                    <span className="text-yellow-400 text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {formatPrice(finalTotal, primaryCurrency)}
                    </span>
                  </div>

                  {/* Main Checkout Button */}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full mt-6 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-4 px-6 text-xs sm:text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-200 cursor-pointer shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2.5 active:scale-[0.99] group"
                  >
                    <svg className="w-4 h-4 text-zinc-950 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <span>Proceed To Checkout</span>
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-zinc-500 text-[11px]">
                    <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    <span>Guaranteed Safe & 256-Bit SSL Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Pill Strip */}
              <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-sm text-center">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                  Accepted Payment Methods
                </span>
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 font-mono">
                  <span className="px-2 py-1 bg-zinc-900 rounded-sm border border-zinc-800">UPI</span>
                  <span className="px-2 py-1 bg-zinc-900 rounded-sm border border-zinc-800">VISA / MC</span>
                  <span className="px-2 py-1 bg-zinc-900 rounded-sm border border-zinc-800">NET BANKING</span>
                  <span className="px-2 py-1 bg-zinc-900 rounded-sm border border-zinc-800">COD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── CHECKOUT MODAL ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-zinc-800 rounded-sm max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => {
                setIsCheckoutOpen(false)
                setOrderPlaced(false)
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!orderPlaced ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                    Fast Checkout
                  </span>
                </div>
                <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-tight mb-6">
                  Complete Your Order
                </h3>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.fullname}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, fullname: e.target.value })}
                      placeholder="Receiver's full name"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                      Shipping Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      placeholder="House/Flat number, Street, Landmark"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.pincode}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                        placeholder="6-digit PIN"
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <label className="block text-zinc-400 text-[10px] uppercase tracking-wider font-bold mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'upi', label: 'UPI / QR' },
                        { id: 'card', label: 'Card Payment' },
                        { id: 'cod', label: 'Cash on Delivery' },
                        { id: 'netbanking', label: 'Net Banking' },
                      ].map((pm) => (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-2 p-2.5 rounded-sm border cursor-pointer transition-all ${
                            checkoutForm.paymentMethod === pm.id
                              ? 'border-yellow-400 bg-yellow-400/10 text-white font-bold'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={pm.id}
                            checked={checkoutForm.paymentMethod === pm.id}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                            className="text-yellow-400 focus:ring-yellow-400"
                          />
                          <span>{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Order Total Review */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-sm flex items-center justify-between text-xs mt-4">
                    <div>
                      <span className="text-zinc-400 uppercase tracking-wider font-bold block">
                        Payable Amount:
                      </span>
                      <span className="text-zinc-500 text-[10px] block mt-0.5">
                        Incl. 18% GST & 5% Handling • Free Delivery
                      </span>
                    </div>
                    <span className="text-yellow-400 font-mono font-black text-base">
                      {formatPrice(finalTotal, primaryCurrency)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full mt-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-3.5 px-6 text-xs sm:text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-200 cursor-pointer shadow-lg shadow-yellow-400/10 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>Securing Drop...</span>
                      </>
                    ) : (
                      <span>Confirm & Place Drop Order</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success confirmation view */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase block mb-1">
                  Order Confirmed
                </span>
                <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
                  Drop Secured!
                </h3>
                <p className="text-zinc-400 text-xs max-w-xs mx-auto mb-4">
                  Thank you, <span className="text-white font-bold">{checkoutForm.fullname}</span>. Your garment order has been booked and will be dispatched via Express Courier.
                </p>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm font-mono text-xs text-zinc-400 max-w-xs mx-auto mb-6">
                  Order ID: <span className="text-yellow-400 font-bold">{placedOrderId}</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false)
                      setOrderPlaced(false)
                      navigate('/')
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-6 py-3 text-xs tracking-widest uppercase rounded-sm cursor-pointer shadow-md"
                  >
                    Back to Catalog
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FLOATING TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 border border-zinc-800 text-white text-xs px-4 py-3 rounded-sm shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-12 px-4 sm:px-6 lg:px-12 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/Logo.png" alt="Snitch" className="w-6 h-6 object-contain" />
              <span className="text-white font-black text-base tracking-[0.2em] uppercase">Snitch</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
              Curated luxury streetwear & high fashion garments for the modern wardrobe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 tracking-wider uppercase">
            <Link to="/" className="hover:text-yellow-400 transition-colors">Catalog</Link>
            <Link to="/register" className="hover:text-yellow-400 transition-colors">Join Club</Link>
            <Link to="/login" className="hover:text-yellow-400 transition-colors">Sign In</Link>
            <Link to="/seller/dashboard" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Seller Studio
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-4">
          <p>© {new Date().getFullYear()} Snitch Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Shipping & Returns</span>
          </div>
        </div>
      </footer>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
        user={user}
      />

      {/* ── CLEAR BAG CONFIRMATION MODAL ── */}
      <ClearBagConfirmModal
        isOpen={isClearBagModalOpen}
        onClose={() => !isClearingBag && setIsClearBagModalOpen(false)}
        onConfirm={handleConfirmClearBag}
        isClearing={isClearingBag}
        cartItems={cartItems}
        getItemImage={getItemImage}
        getItemVariantDetails={getItemVariantDetails}
        getItemUnitPrice={getItemUnitPrice}
        getItemCurrency={getItemCurrency}
        formatPrice={formatPrice}
        subtotal={subtotal}
        totalQuantity={totalQuantity}
        primaryCurrency={primaryCurrency}
      />
    </div>
  )
}

export default Cart