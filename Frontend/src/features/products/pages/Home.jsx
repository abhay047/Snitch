import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct'
import { useAuth } from '../../auth/hook/useAuth'
import { Link, useNavigate } from 'react-router'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

const CATEGORIES = ['ALL', 'TSHIRTS', 'SHIRTS', 'JEANS', 'HOODIES', 'OVERSIZED', 'OTHER']

// Smart Category Matcher: checks product.category, variant attributes, and semantic clothing patterns
const matchesCategory = (product, selectedCategory) => {
  if (!selectedCategory) return true
  const sel = selectedCategory.trim().toUpperCase()
  if (sel === 'ALL') return true

  const prodCategory = (product?.category || '').trim().toUpperCase()

  // 1. Direct match with product.category
  if (prodCategory) {
    if (prodCategory === sel) return true
    if (sel === 'TSHIRTS' && ['TSHIRTS', 'TSHIRT', 'T-SHIRT', 'T-SHIRTS', 'TEES', 'TEE', 'POLO'].includes(prodCategory)) return true
    if (sel === 'SHIRTS' && ['SHIRTS', 'SHIRT', 'OVERSHIRT', 'FLANNEL'].includes(prodCategory)) return true
    if (sel === 'JEANS' && ['JEANS', 'JEAN', 'DENIM', 'BOTTOMS', 'BOTTOM', 'PANTS', 'PANT', 'TROUSERS', 'TROUSER'].includes(prodCategory)) return true
    if (sel === 'HOODIES' && ['HOODIES', 'HOODIE', 'SWEATSHIRT', 'SWEATSHIRTS'].includes(prodCategory)) return true
    if ((sel === 'OVERSIZED' || sel === 'OVERSIZZED') && ['OVERSIZED', 'OVERSIZE', 'OVERSIZZED', 'OVERSIZZE'].includes(prodCategory)) return true
  }

  // 2. Check variant attributes (category, type, fit, style)
  if (product?.variants && Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (v?.attributes) {
        let attrs = {}
        try {
          if (v.attributes instanceof Map) {
            attrs = Object.fromEntries(v.attributes.entries())
          } else if (typeof v.attributes === 'object') {
            attrs = v.attributes
          }
        } catch {
          attrs = {}
        }
        for (const [, val] of Object.entries(attrs)) {
          if (!val) continue
          const valUpper = String(val).trim().toUpperCase()
          if (valUpper === sel) return true
          if (sel === 'TSHIRTS' && /\b(TEE|TEES|T-SHIRT|TSHIRT|TSHIRTS|POLO)\b/i.test(valUpper)) return true
          if (sel === 'SHIRTS' && /(?<!\b(T|TEE)\s*-?\s*)\b(SHIRT|SHIRTS|OVERSHIRT|FLANNEL)\b/i.test(valUpper)) return true
          if (sel === 'JEANS' && /JEAN|JEANS|DENIM|BOTTOM|PANT|TROUSER|CARGO|JOGGER/i.test(valUpper)) return true
          if (sel === 'HOODIES' && /HOODIE|SWEATSHIRT|PULLOVER/i.test(valUpper)) return true
          if ((sel === 'OVERSIZED' || sel === 'OVERSIZZED') && /OVERSIZE|OVERSIZED|OVERSIZZED|BAGGY|RELAXED/i.test(valUpper)) return true
        }
      }
    }
  }

  // 3. Keyword / Semantic matching on Title & Description
  const text = `${product?.title || ''} ${product?.description || ''}`.toLowerCase()

  switch (sel) {
    case 'TSHIRTS':
      return /\b(tee|tees|t-shirt|t-shirts|tshirt|tshirts|polo|polos|tank|tanks|crewneck)\b/i.test(text)

    case 'SHIRTS':
      return (
        /\b(overshirt|overshirts|flannel|flannels|oxford|oxfords|button-down|button down|cuban collar|mandarin collar|popover|resort collar)\b/i.test(text) ||
        /(?<!\b(t|tee)\s*-?\s*)\b(shirt|shirts)\b/i.test(text)
      )

    case 'JEANS':
      return /\b(jean|jeans|denim|denims|pant|pants|trouser|trousers|cargo|cargos|jogger|joggers|bottom|bottoms|chino|chinos|sweatpant|sweatpants|trackpant|trackpants)\b/i.test(text)

    case 'HOODIES':
      return /\b(hoodie|hoodies|hooded|sweatshirt|sweatshirts|pullover|pullovers|zip-up|fleece|sweater|sweaters)\b/i.test(text)

    case 'OVERSIZED':
    case 'OVERSIZZED':
      return /\b(oversize|oversized|oversizze|oversizzed|baggy|relaxed|drop shoulder|loose fit|boxy|box fit)\b/i.test(text)

    case 'OTHER': {
      if (['OTHER', 'STREETWEAR', 'LUXURY', 'ACCESSORIES', 'FOOTWEAR', 'CAP', 'CAPS', 'JACKET', 'JACKETS'].includes(prodCategory)) {
        return true
      }
      const isSpecific =
        /\b(tee|tees|t-shirt|t-shirts|tshirt|tshirts|polo)\b/i.test(text) ||
        /(?<!\b(t|tee)\s*-?\s*)\b(shirt|shirts|overshirt|flannel)\b/i.test(text) ||
        /\b(jean|jeans|denim|pant|pants|trouser|cargo|jogger)\b/i.test(text) ||
        /\b(hoodie|hoodies|sweatshirt|pullover)\b/i.test(text) ||
        /\b(oversize|oversized|oversizzed|baggy)\b/i.test(text)
      return !isSpecific
    }

    default:
      return text.includes(sel.toLowerCase())
  }
}

const Home = () => {
  const products = useSelector((state) => state.product.products) || []
  const user = useSelector((state) => state.auth?.user)
  const authLoading = useSelector((state) => state.auth?.loading)
  const { handleGetAllProducts } = useProduct()
  const { handleGetMe, handleBecomeSeller } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts = {}
    CATEGORIES.forEach((cat) => {
      counts[cat] = products.filter((p) => matchesCategory(p, cat)).length
    })
    return counts
  }, [products])

  // Become a seller modal state
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false)
  const [upgradingToSeller, setUpgradingToSeller] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  // User profile dropdown state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const catalogRef = useRef(null)

  const handleBecomeSellerConfirm = async () => {
    setUpgradingToSeller(true)
    setUpgradeError(null)
    try {
      await handleBecomeSeller()
      setShowBecomeSellerModal(false)
      navigate('/seller/dashboard')
    } catch (err) {
      setUpgradeError(err?.response?.data?.message || 'Failed to upgrade account to seller')
    } finally {
      setUpgradingToSeller(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([
          handleGetAllProducts(),
          handleGetMe(),
        ])
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load products')
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

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products]

    // Category filter using smart matching
    if (selectedCategory && selectedCategory.toUpperCase() !== 'ALL') {
      list = list.filter((p) => matchesCategory(p, selectedCategory))
    }

    // Sorting
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0))
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return list
  }, [products, selectedCategory, sortBy])

  const formatPrice = (priceObj) => {
    if (!priceObj) return '—'
    const symbol = CURRENCY_SYMBOLS[priceObj.currency] || priceObj.currency || '₹'
    const amount = Number(priceObj.amount || 0).toLocaleString()
    return `${symbol}${amount}`
  }

  const getProductImage = (product, index = 0) => {
    if (!product?.images || product.images.length === 0) return null
    const item = product.images[index]
    if (typeof item === 'string') return item
    return item?.url || null
  }

  const getProductStock = (product) => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.reduce((acc, v) => acc + Math.max(0, Number(v.stock) || 0), 0)
    }
    return Math.max(0, Number(product?.stock) || 0)
  }

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative font-sans selection:bg-yellow-400 selection:text-zinc-950">

      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.04)_0%,transparent_70%)]" />
        <div className="absolute top-[40%] left-[-100px] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_70%)]" />
      </div>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-yellow-400 text-zinc-950 px-4 py-2 text-center text-[11px] font-black tracking-[0.25em] uppercase select-none relative z-10">
        <span>Snitch Store • Complimentary Express Shipping On All Orders</span>
      </div>

      {/* ── MAIN NAVBAR (STICKY WITH FROSTED GLASS EFFECT) ── */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">

          {/* Left: Brand Identity & Studio Badge */}
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

            {user?.role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className="hidden sm:flex items-center gap-2 group transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-zinc-400 group-hover:text-white text-[10px] tracking-[0.25em] uppercase font-medium">
                  Seller Studio
                </span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-zinc-400 text-[10px] tracking-[0.25em] uppercase font-medium">
                  Snitch Store
                </span>
              </div>
            )}
          </div>

          {/* Center Navigation: Explore Drops Link */}
          <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-semibold">
            <button
              type="button"
              onClick={scrollToCatalog}
              className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors py-1 cursor-pointer select-none"
            >
              <span>Explore Drops</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </button>
          </div>

          {/* Right Navigation / User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {authLoading ? (
              <div className="h-8 w-24 bg-zinc-900/60 animate-pulse rounded-sm" />
            ) : user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {user.role === 'seller' && (
                  <>
                    <Link
                      to="/seller/dashboard"
                      className="text-zinc-400 hover:text-white text-xs tracking-wider uppercase font-semibold hidden md:flex items-center gap-1.5 transition-colors px-3 py-2 border border-zinc-800/80 hover:border-zinc-700 rounded-sm bg-zinc-900/40"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                      </svg>
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/seller/create-product"
                      className="group bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-3.5 sm:px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-all duration-200 rounded-sm hidden lg:flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-sm leading-none font-bold">+</span>
                      <span>New Drop</span>
                    </Link>
                  </>
                )}

                {/* User Profile Dropdown Trigger */}
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
                    <svg
                      className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                        isUserDropdownOpen ? 'rotate-180 text-white' : ''
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
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-zinc-900">
                        <p className="text-white text-xs font-bold truncate">{user.fullname || 'Member'}</p>
                        <p className="text-zinc-500 text-[11px] truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-sm bg-zinc-900 text-zinc-400 border border-zinc-800 font-bold">
                          {user.role}
                        </span>
                      </div>

                      {/* Dropdown Action Items */}
                      <div className="p-1 space-y-0.5">
                        {/* If user is buyer: Become a Seller button */}
                        {user.role === 'buyer' && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserDropdownOpen(false)
                              setShowBecomeSellerModal(true)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors text-left font-medium cursor-pointer"
                          >
                            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.614A2.993 2.993 0 009 9.35c.828 0 1.579-.336 2.122-.88a3.001 3.001 0 004.256 0 2.993 2.993 0 002.122.88 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l2.19 2.19a3.004 3.004 0 01-.62 4.72" />
                            </svg>
                            <span>Become a Seller</span>
                          </button>
                        )}

                        {/* If user is seller: Seller Studio & Create Drop links */}
                        {user.role === 'seller' && (
                          <>
                            <Link
                              to="/seller/dashboard"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors text-left font-medium"
                            >
                              <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                              </svg>
                              <span>Seller Studio</span>
                            </Link>

                            <Link
                              to="/seller/create-product"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors text-left font-medium"
                            >
                              <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              <span>Create New Drop</span>
                            </Link>
                          </>
                        )}

                        <div className="h-px bg-zinc-900 my-1" />

                        {/* Pure Log Out Button */}
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
                    className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors"
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
                  className="bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-4 py-2.5 text-[11px] tracking-[0.2em] uppercase rounded-sm transition-all shadow-sm"
                >
                  Join Club
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO EDITORIAL BANNER ── */}
      <section className="relative border-b border-zinc-900 py-16 sm:py-24 lg:py-32 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 mb-6 border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 rounded-sm">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400 text-[10px] tracking-[0.35em] uppercase font-bold">
                Drop 2026 Edition
              </span>
            </div>

            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase">
              WEAR WHAT<br />
              <span className="text-zinc-600">DEFINES</span><br />
              <span className="text-yellow-400">YOU.</span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base mt-6 max-w-xl leading-relaxed">
              Engineered silhouettes, heavyweight fabrics, and contemporary aesthetics designed for those who command presence.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-10">
              <button
                onClick={scrollToCatalog}
                className="bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-8 py-4 text-xs tracking-[0.3em] uppercase rounded-sm transition-all cursor-pointer flex items-center gap-3 group shadow-lg"
              >
                <span>Shop The Collection</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Decorative Watermark */}
        <div className="absolute right-0 bottom-0 pointer-events-none select-none text-right hidden lg:block opacity-5">
          <span className="text-[200px] font-black tracking-tighter leading-none text-white block">
            SNITCH
          </span>
        </div>
      </section>

      {/* ── BRAND HIGHLIGHTS STRIP ── */}
      <section className="border-b border-zinc-900 bg-zinc-950/40 py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          {[
            { title: '100% Authentic', desc: 'Crafted with premium cotton & fabrics' },
            { title: 'Free Express Shipping', desc: 'On all orders above ₹999' },
            { title: 'Easy Exchanges', desc: 'Hassle-free 7-day return policy' },
            { title: 'Secure Checkout', desc: 'Encrypted multi-currency payments' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-white font-bold text-xs tracking-wider uppercase">{item.title}</p>
              <p className="text-zinc-500 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT CATALOG SECTION ── */}
      <section ref={catalogRef} className="max-w-7xl mx-auto px-6 lg:px-12 py-16">

        {/* Section Heading & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                Live Drops
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight uppercase">
              Curated Catalog
            </h2>
          </div>

          {/* Right Controls: Sort & Count */}
          <div className="flex items-center gap-4 self-end md:self-auto">
            <span className="text-zinc-500 text-xs tracking-wider">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Garment' : 'Garments'}
            </span>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-xs py-2 pl-3 pr-8 rounded-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
              >
                <option value="newest" className="bg-[#0a0a0a]">Latest Drops</option>
                <option value="price-low" className="bg-[#0a0a0a]">Price: Low to High</option>
                <option value="price-high" className="bg-[#0a0a0a]">Price: High to Low</option>
                <option value="title" className="bg-[#0a0a0a]">Name (A - Z)</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[10px]">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0
            const isSelected = selectedCategory === cat

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-sm text-xs tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-yellow-400 text-zinc-950 font-black shadow-md shadow-yellow-400/10 scale-[1.02]'
                    : 'border border-zinc-800/80 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-zinc-700 font-medium'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full leading-none ${
                    isSelected
                      ? 'bg-zinc-950/20 text-zinc-950 font-black'
                      : 'bg-zinc-900 text-zinc-500 font-semibold'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* State 1: Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="border border-zinc-900 rounded-sm bg-zinc-950/40 p-4 animate-pulse space-y-4"
              >
                <div className="aspect-[3/4] bg-zinc-900/80 rounded-sm" />
                <div className="h-4 bg-zinc-900 rounded w-3/4" />
                <div className="h-3 bg-zinc-900/60 rounded w-1/2" />
                <div className="h-5 bg-zinc-900/80 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error */}
        {!loading && error && (
          <div className="border border-red-900/40 bg-red-950/10 rounded-sm p-8 text-center my-8">
            <p className="text-red-400 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={() => handleGetAllProducts()}
              className="text-xs uppercase tracking-wider text-yellow-400 underline hover:text-yellow-300 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* State 3: Empty Collection */}
        {!loading && !error && products.length === 0 && (
          <div className="border border-dashed border-zinc-800 rounded-sm p-16 text-center my-8 bg-zinc-950/20 max-w-xl mx-auto">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-zinc-800 flex items-center justify-center text-yellow-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold tracking-tight mb-2">No Products Available</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
              Our shelves are currently being restocked for the upcoming drop. Check back shortly!
            </p>
          </div>
        )}

        {/* State 4: No Search / Filter Match */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <div className="border border-zinc-900 rounded-sm p-12 text-center my-8 bg-zinc-950/20 max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-zinc-800 flex items-center justify-center text-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-white font-bold text-sm mb-1.5 uppercase tracking-wider">
              {selectedCategory !== 'ALL' ? `No ${selectedCategory} Available` : 'No matching garments found'}
            </p>
            <p className="text-zinc-500 text-xs mb-5">
              {selectedCategory !== 'ALL'
                ? `Currently there are no products listed under ${selectedCategory}.`
                : 'Our shelves are currently being updated.'}
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold px-5 py-2.5 text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer shadow-sm"
            >
              <span>View All Garments</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* State 5: Product Grid Display */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const primaryImg = getProductImage(product, 0)
              const imageCount = product.images?.length || 0
              const totalStock = getProductStock(product)
              const isSoldOut = totalStock <= 0

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group flex flex-col bg-zinc-950/40 border border-zinc-900 hover:border-zinc-700/80 rounded-sm overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1.5"
                >
                  {/* Image Frame (Fashion standard 3:4 aspect ratio) */}
                  <div className="relative aspect-[3/4] bg-zinc-900/60 overflow-hidden">
                    {/* Sold Out Badge */}
                    {isSoldOut && (
                      <div className="absolute top-2.5 left-2.5 bg-red-600/90 backdrop-blur-sm border border-red-500/50 px-2.5 py-0.5 rounded-sm text-[9px] tracking-widest text-white font-black uppercase flex items-center gap-1.5 z-10 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Sold Out</span>
                      </div>
                    )}

                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={product.title}
                        className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                          isSoldOut ? 'opacity-70 grayscale-[25%]' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                        <svg className="w-10 h-10 mb-2 stroke-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="text-[10px] tracking-widest uppercase">No Image</span>
                      </div>
                    )}

                    {/* Image count pill */}
                    {imageCount > 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-sm text-[10px] tracking-wider text-zinc-300 font-medium">
                        {imageCount} photos
                      </div>
                    )}

                    {/* View Product Button on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <span className={`font-black text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded-sm transform translate-y-2 group-hover:translate-y-0 transition-transform shadow-lg ${
                        isSoldOut
                          ? 'bg-zinc-950 border border-red-500/60 text-red-400'
                          : 'bg-white text-zinc-950'
                      }`}>
                        {isSoldOut ? 'Sold Out — View Item' : 'View Product'}
                      </span>
                    </div>
                  </div>

                  {/* Card Metadata */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-wide line-clamp-1 group-hover:text-yellow-400 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-yellow-400 font-bold text-sm">
                        {formatPrice(product.price)}
                      </span>
                      {isSoldOut ? (
                        <span className="text-red-400 font-bold text-[10px] tracking-widest uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>Sold Out</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[10px] tracking-widest uppercase group-hover:text-zinc-300 transition-colors">
                          View Item →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-16 px-6 lg:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/Logo.png" alt="Snitch" className="w-7 h-7 object-contain" />
              <span className="text-white font-bold text-lg tracking-[0.2em] uppercase">Snitch</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
              A modern online luxury streetwear and fashion collective. Redefining style standards.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs tracking-wider uppercase text-zinc-400">
            <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/register" className="hover:text-yellow-400 transition-colors">Register</Link>
            <Link to="/login" className="hover:text-yellow-400 transition-colors">Sign In</Link>
            {user?.role === 'seller' && (
              <Link to="/seller/dashboard" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                Seller Studio
              </Link>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600 tracking-wider">
          <p>© {new Date().getFullYear()} Snitch. All rights reserved.</p>
          <p className="uppercase tracking-widest text-zinc-500">Wear What You Are</p>
        </div>
      </footer>





      {/* ── BECOME A SELLER CONFIRMATION POPUP ── */}
      {showBecomeSellerModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => !upgradingToSeller && setShowBecomeSellerModal(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!upgradingToSeller && (
              <button
                onClick={() => setShowBecomeSellerModal(false)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-zinc-400 text-[10px] tracking-[0.3em] uppercase font-bold">
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

            {/* Actions */}
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
                className="flex-1 py-3 px-4 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 text-xs tracking-wider uppercase font-bold rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

export default Home