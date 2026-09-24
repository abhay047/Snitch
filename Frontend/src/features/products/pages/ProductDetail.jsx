import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct'
import { useAuth } from '../../auth/hook/useAuth'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

const ProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductById } = useProduct()
  const { handleGetMe, handleBecomeSeller } = useAuth()

  const user = useSelector((state) => state.auth?.user)
  const authLoading = useSelector((state) => state.auth?.loading)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false)
  const [upgradingToSeller, setUpgradingToSeller] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  const userDropdownRef = useRef(null)
  const thumbnailContainerRef = useRef(null)

  // Scroll to top on mount or productId change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [productId])

  // Fetch auth session on mount if needed
  useEffect(() => {
    if (!user) {
      handleGetMe?.().catch(() => {})
    }
  }, [])

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

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[activeImageIndex]
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }
  }, [activeImageIndex])

  // Fetch product data
  useEffect(() => {
    let isMounted = true

    const fetchProduct = async () => {
      if (!productId) {
        setError('Invalid Product ID')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await handleGetProductById(productId)
        if (isMounted) {
          if (data) {
            setProduct(data)
            setActiveImageIndex(0)
          } else {
            setError('Product not found in catalogue.')
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load product details. Please try again.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  const handleBecomeSellerConfirm = async () => {
    setUpgradingToSeller(true)
    setUpgradeError(null)
    try {
      await handleBecomeSeller()
      setShowBecomeSellerModal(false)
      navigate('/seller/dashboard')
    } catch (err) {
      setUpgradeError(err.response?.data?.message || 'Failed to convert account to seller.')
    } finally {
      setUpgradingToSeller(false)
    }
  }

  const formatPrice = (priceObj) => {
    if (!priceObj) return '₹0'
    const symbol = CURRENCY_SYMBOLS[priceObj.currency] || '₹'
    const amount = Number(priceObj.amount || 0).toLocaleString()
    return `${symbol}${amount}`
  }

  const getProductImage = (prod, index = 0) => {
    if (!prod || !prod.images || prod.images.length === 0) return null
    const img = prod.images[index]
    if (!img) return null
    return typeof img === 'string' ? img : img.url || null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-yellow-400 text-zinc-950 px-4 py-2 text-center text-[11px] font-black tracking-[0.25em] uppercase select-none">
        <span>Complimentary Express Shipping On All Premium Drops</span>
      </div>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-zinc-900 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo.png"
              alt="Snitch Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:rotate-6 transition-transform duration-300"
            />
            <span className="text-white text-xl sm:text-2xl font-black tracking-[0.25em] uppercase group-hover:text-yellow-400 transition-colors">
              Snitch
            </span>
          </Link>

          {/* Center Navigation: Back to Collection Link */}
          <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-semibold">
            <Link
              to="/"
              className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors py-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span>Back To Collection</span>
            </Link>
          </div>

          {/* Right Navigation: User Profile, Bag Icon & Auth Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {authLoading ? (
              <div className="h-8 w-24 bg-zinc-900/60 animate-pulse rounded-sm" />
            ) : user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {user.role === 'seller' && (
                  <Link
                    to="/seller/dashboard"
                    className="text-xs tracking-wider uppercase text-yellow-400 hover:text-yellow-300 font-semibold hidden sm:flex items-center gap-1.5 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <span>Seller Studio</span>
                  </Link>
                )}

                {/* User Dropdown Trigger */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 -m-1 rounded-sm hover:bg-zinc-900/60 transition-colors cursor-pointer group select-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/30 group-hover:border-yellow-400/60 flex items-center justify-center text-yellow-400 font-bold text-xs uppercase transition-colors">
                      {user.fullname ? user.fullname[0] : 'U'}
                    </div>
                    <span className="text-zinc-300 group-hover:text-white text-xs hidden sm:inline font-medium transition-colors">
                      {user.fullname || user.email}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                        isUserDropdownOpen ? 'rotate-180 text-yellow-400' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-[#0a0a0a] border border-zinc-800 rounded-sm shadow-2xl py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-zinc-900">
                        <p className="text-white text-xs font-bold truncate">{user.fullname || 'Member'}</p>
                        <p className="text-zinc-500 text-[11px] truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-zinc-900 text-yellow-400 border border-yellow-400/20 font-bold">
                          {user.role}
                        </span>
                      </div>

                      <div className="p-1 space-y-0.5">
                        {user.role === 'buyer' && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserDropdownOpen(false)
                              setShowBecomeSellerModal(true)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-sm transition-colors text-left font-medium cursor-pointer"
                          >
                            <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.614A2.993 2.993 0 009 9.35c.828 0 1.579-.336 2.122-.88a3.001 3.001 0 004.256 0 2.993 2.993 0 002.122.88 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l2.19 2.19a3.004 3.004 0 01-.62 4.72" />
                            </svg>
                            <span>Become a Seller</span>
                          </button>
                        )}

                        {user.role === 'seller' && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-sm transition-colors text-left font-medium"
                          >
                            <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            <span>Seller Studio</span>
                          </Link>
                        )}

                        <div className="h-px bg-zinc-900 my-1" />

                        {/* Pure Log Out Button (without functionality as per specification) */}
                        <button
                          type="button"
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-sm transition-colors text-left font-medium cursor-pointer"
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

                {/* Bag Icon (Visual only) */}
                <button
                  type="button"
                  title="Bag"
                  aria-label="Shopping Bag"
                  className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-full transition-colors cursor-pointer group flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-zinc-300 group-hover:text-yellow-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-zinc-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-sm">
                    0
                  </span>
                </button>
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
                  className="bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-4 py-2 text-xs tracking-[0.2em] uppercase rounded-sm transition-all shadow-sm"
                >
                  Join Club
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 sm:mb-8 tracking-wider uppercase">
          <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/" className="hover:text-yellow-400 transition-colors">Garments</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
            {product?.title || 'Product Details'}
          </span>
        </nav>

        {/* ── STATE 1: LOADING SKELETON ── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 animate-pulse">
            {/* Gallery Skeleton */}
            <div className="lg:col-span-7 flex flex-row gap-3 sm:gap-4 items-start">
              <div className="w-14 sm:w-20 md:w-22 flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full aspect-[4/5] bg-zinc-900/60 rounded-sm border border-zinc-800 shrink-0" />
                ))}
              </div>
              <div className="flex-1 aspect-[4/5] bg-zinc-900/60 rounded-sm border border-zinc-800" />
            </div>

            {/* Info Skeleton */}
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-28 bg-zinc-900 rounded-sm" />
              <div className="h-10 w-3/4 bg-zinc-900 rounded-sm" />
              <div className="h-8 w-32 bg-zinc-900 rounded-sm" />
              <div className="h-24 w-full bg-zinc-900/60 rounded-sm" />
              <div className="h-14 w-full bg-zinc-900 rounded-sm" />
              <div className="h-14 w-full bg-zinc-900 rounded-sm" />
            </div>
          </div>
        )}

        {/* ── STATE 2: ERROR / NOT FOUND ── */}
        {!loading && error && (
          <div className="border border-zinc-800 bg-zinc-950/40 rounded-sm p-12 sm:p-20 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-2">Item Unavailable</h2>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-8">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-6 py-3.5 text-xs uppercase tracking-[0.2em] rounded-sm transition-all"
              >
                Browse All Drops
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-white font-semibold px-6 py-3.5 text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: PRODUCT LOADED ── */}
        {!loading && !error && product && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            {/* ── LEFT COLUMN: EDITORIAL GALLERY (7 Cols) ── */}
            <div className="lg:col-span-7 flex flex-row gap-3 sm:gap-4 items-start">
              {/* Vertical Multi-Image Thumbnails Rail (Left Side) */}
              {product.images?.length > 1 && (
                <div className="w-14 sm:w-20 md:w-22 shrink-0 flex flex-col items-center gap-2 select-none">
                  {/* Up / Previous Photo Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev > 0 ? prev - 1 : product.images.length - 1
                      )
                    }
                    className="w-full h-7 sm:h-8 rounded-sm border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-yellow-400 flex items-center justify-center transition-colors cursor-pointer select-none"
                    title="Previous photo"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>

                  {/* Vertical Scrollable Thumbnails Container */}
                  <div
                    ref={thumbnailContainerRef}
                    className="w-full flex flex-col gap-2.5 overflow-y-auto max-h-[380px] sm:max-h-[500px] lg:max-h-[620px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 scroll-smooth"
                  >
                    {product.images.map((img, i) => {
                      const url = typeof img === 'string' ? img : img?.url
                      return (
                        <button
                          key={img._id || i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className={`relative w-full aspect-[4/5] rounded-sm overflow-hidden border shrink-0 transition-all cursor-pointer ${
                            activeImageIndex === i
                              ? 'border-yellow-400 ring-2 ring-yellow-400/50 opacity-100'
                              : 'border-zinc-800 opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${product.title} view ${i + 1}`}
                            className="w-full h-full object-cover object-top"
                          />
                        </button>
                      )
                    })}
                  </div>

                  {/* Down / Next Photo Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev < product.images.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="w-full h-7 sm:h-8 rounded-sm border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-yellow-400 flex items-center justify-center transition-colors cursor-pointer select-none"
                    title="Next photo"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Main Image Frame (Fashion 4:5 Aspect Ratio) */}
              <div className="relative flex-1 min-w-0 aspect-[4/5] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-900 select-none group">
                {getProductImage(product, activeImageIndex) ? (
                  <img
                    src={getProductImage(product, activeImageIndex)}
                    alt={product.title}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                    <svg className="w-12 h-12 mb-2 stroke-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="text-xs uppercase tracking-widest">No Image Provided</span>
                  </div>
                )}

                {/* Floating Arrows if multiple images - Only visible on image hover */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous Photo"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev > 0 ? prev - 1 : product.images.length - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black border border-white/10 text-white flex items-center justify-center transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 shadow-xl backdrop-blur-sm select-none"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-label="Next Photo"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev < product.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black border border-white/10 text-white flex items-center justify-center transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 shadow-xl backdrop-blur-sm select-none"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 text-zinc-300 text-[11px] font-bold tracking-widest px-3 py-1 rounded-sm shadow-md">
                      {activeImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}

                {/* Badge Tag on bottom left */}
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-yellow-400/20 px-3 py-1.5 rounded-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 text-[10px] font-black tracking-[0.25em] uppercase">
                    Authentic Release
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: PRODUCT INFO & PURCHASE CONTROLS (5 Cols) ── */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div>
                {/* Release Category */}
                <div className="mb-3">
                  <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">
                    Snitch Limited Drop
                  </span>
                </div>

                {/* Garment Title */}
                <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase">
                  {product.title}
                </h1>

                {/* Price Display */}
                <div className="mt-5 pb-6 border-b border-zinc-900">
                  <div className="flex items-baseline gap-3">
                    <span className="text-yellow-400 text-4xl sm:text-5xl font-black tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-zinc-500 text-xs tracking-wider uppercase">
                      Inclusive of all taxes
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>In Stock & Ready To Ship Worldwide</span>
                  </p>
                </div>



                {/* Quantity Selector */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-bold">
                    Quantity
                  </span>
                  <div className="flex items-center border border-zinc-800 rounded-sm bg-zinc-950/80">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-base font-bold disabled:opacity-30"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-white font-bold text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-base font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ── MANDATORY BUTTONS: ADD TO BAG & BUY NOW (No functionality for now) ── */}
                <div className="mt-8 space-y-3">
                  {/* Buy Now Button (High Priority CTA) */}
                  <button
                    type="button"
                    className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-zinc-950 font-black py-4 px-6 text-xs sm:text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-200 cursor-pointer shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-4 h-4 text-zinc-950 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    <span>Buy Now</span>
                  </button>

                  {/* Add To Bag Button (Secondary Luxury Border CTA) */}
                  <button
                    type="button"
                    className="w-full border-2 border-zinc-700 hover:border-yellow-400/80 bg-zinc-900/60 hover:bg-zinc-900 text-white font-bold py-4 px-6 text-xs sm:text-sm tracking-[0.2em] uppercase rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span>Add To Bag</span>
                  </button>
                </div>

                {/* Trust Highlights Grid */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-zinc-900 text-zinc-400 text-xs">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.948c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V14.25" />
                    </svg>
                    <div>
                      <p className="text-white font-bold">Express Shipping</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Delivered within 2-4 days</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <div>
                      <p className="text-white font-bold">7-Day Return Policy</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Hassle-free easy exchanges</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="border-t border-zinc-900 pt-6">
                <span className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase font-bold block mb-3">
                  Product Description
                </span>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-normal">
                  {product.description || 'No detailed description provided for this drop.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-12 px-4 sm:px-6 lg:px-12 mt-16">
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

          <div className="flex flex-wrap gap-8 text-xs tracking-wider uppercase text-zinc-400">
            <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/register" className="hover:text-yellow-400 transition-colors">Join Club</Link>
            <Link to="/login" className="hover:text-yellow-400 transition-colors">Sign In</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600 tracking-wider">
          <p>© {new Date().getFullYear()} Snitch. All rights reserved.</p>
          <p className="uppercase tracking-widest text-zinc-500">Wear What You Are</p>
        </div>
      </footer>

      {/* ── BECOME A SELLER CONFIRMATION MODAL ── */}
      {showBecomeSellerModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => !upgradingToSeller && setShowBecomeSellerModal(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!upgradingToSeller && (
              <button
                onClick={() => setShowBecomeSellerModal(false)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                  Seller Studio
                </span>
              </div>
              <h3 className="text-white text-xl font-bold tracking-tight">Become a Snitch Seller</h3>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                Convert your buyer account to a verified seller account to create drops and list garments.
              </p>
            </div>

            {upgradeError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-400 text-xs">
                {upgradeError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={upgradingToSeller}
                onClick={() => setShowBecomeSellerModal(false)}
                className="flex-1 py-3 px-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-300 text-xs tracking-wider uppercase font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={upgradingToSeller}
                onClick={handleBecomeSellerConfirm}
                className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 text-xs tracking-wider uppercase font-bold rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {upgradingToSeller ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Upgrading...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail