import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useProduct } from '../hook/useProduct.js'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

const Dashboard = () => {
  const { handleGetSellerProduct } = useProduct()
  const sellerProducts = useSelector((state) => state.product.sellerProducts) || []
  const user = useSelector((state) => state.auth?.user)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0)
  const thumbnailContainerRef = useRef(null)

  // Automatically smooth-scroll thumbnail into view when image changes
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[activeModalImageIndex]
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }
  }, [activeModalImageIndex])

  useEffect(() => {
    let isMounted = true
    const loadProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        await handleGetSellerProduct()
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load products')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProducts()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let list = [...sellerProducts]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0))
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0))
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return list
  }, [sellerProducts, searchQuery, sortBy])

  // Analytics
  const stats = useMemo(() => {
    const totalCount = sellerProducts.length
    const totalValue = sellerProducts.reduce(
      (sum, p) => sum + (Number(p.price?.amount) || 0),
      0
    )
    const avgPrice = totalCount > 0 ? Math.round(totalValue / totalCount) : 0
    const primaryCurrency = sellerProducts[0]?.price?.currency || 'INR'

    return { totalCount, totalValue, avgPrice, primaryCurrency }
  }, [sellerProducts])

  const formatPrice = (priceObj) => {
    if (!priceObj) return '—'
    const symbol = CURRENCY_SYMBOLS[priceObj.currency] || priceObj.currency || '₹'
    const amount = Number(priceObj.amount || 0).toLocaleString()
    return `${symbol}${amount}`
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent'
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'Recent'
    }
  }

  const getProductImage = (product, index = 0) => {
    if (!product?.images || product.images.length === 0) return null
    const item = product.images[index]
    if (typeof item === 'string') return item
    return item?.url || null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="border-b border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo & Section Title */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="Snitch" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold text-xl tracking-[0.2em] uppercase">
                Snitch
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase font-medium">
                Seller Studio
              </span>
            </div>
          </div>

          {/* Action CTA & User Info */}
          <div className="flex items-center gap-4">
            {user?.fullname && (
              <span className="text-zinc-500 text-xs hidden md:inline tracking-wider">
                Logged in as <span className="text-zinc-300 font-medium">{user.fullname}</span>
              </span>
            )}
            <Link
              to="/seller/create-product"
              className="group bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase transition-all duration-200 rounded-sm flex items-center gap-2 shadow-sm"
            >
              <span className="text-sm leading-none font-bold">+</span>
              <span>New Product</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">

        {/* ── HERO BANNER & STATS ── */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-yellow-400 text-xs tracking-[0.3em] uppercase mb-2">Overview</p>
              <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none">
                PRODUCT CATALOG
              </h1>
              <p className="text-zinc-500 text-sm mt-3 max-w-xl leading-relaxed">
                Manage, track, and curate all your products listed on the Snitch fashion marketplace.
              </p>
            </div>

            {/* Quick Refresh Button */}
            <button
              onClick={() => handleGetSellerProduct()}
              disabled={loading}
              className="self-start md:self-auto text-zinc-500 hover:text-zinc-300 text-xs tracking-wider uppercase flex items-center gap-2 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-400' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Products */}
            <div className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-sm p-6 transition-colors">
              <span className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase font-medium">
                Active Listings
              </span>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black text-white tracking-tight">
                  {stats.totalCount}
                </span>
                <span className="text-zinc-600 text-xs tracking-wider">products</span>
              </div>
            </div>

            {/* Card 2: Catalog Value */}
            <div className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-sm p-6 transition-colors">
              <span className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase font-medium">
                Catalog Value
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-yellow-400 tracking-tight">
                  {CURRENCY_SYMBOLS[stats.primaryCurrency] || '₹'}
                  {stats.totalValue.toLocaleString()}
                </span>
                <span className="text-zinc-600 text-xs tracking-wider">total</span>
              </div>
            </div>

            {/* Card 3: Avg Price */}
            <div className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-sm p-6 transition-colors">
              <span className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase font-medium">
                Average Listing Price
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-200 tracking-tight">
                  {CURRENCY_SYMBOLS[stats.primaryCurrency] || '₹'}
                  {stats.avgPrice.toLocaleString()}
                </span>
                <span className="text-zinc-600 text-xs tracking-wider">/ item</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TOOLBAR: SEARCH, SORT, VIEW ── */}
        <section className="mb-8 pt-4 border-t border-zinc-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full bg-zinc-950/70 border border-zinc-800/90 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Layout Toggle */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-zinc-950/70 border border-zinc-800 text-zinc-300 text-xs py-2.5 pl-3.5 pr-8 rounded-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
              >
                <option value="newest" className="bg-[#0a0a0a]">Newest First</option>
                <option value="oldest" className="bg-[#0a0a0a]">Oldest First</option>
                <option value="price-high" className="bg-[#0a0a0a]">Price: High to Low</option>
                <option value="price-low" className="bg-[#0a0a0a]">Price: Low to High</option>
                <option value="title" className="bg-[#0a0a0a]">Title (A - Z)</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[10px]">
                ▼
              </span>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center border border-zinc-800 rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-yellow-400 text-zinc-950'
                    : 'bg-zinc-950/70 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-yellow-400 text-zinc-950'
                    : 'bg-zinc-950/70 text-zinc-500 hover:text-zinc-300'
                }`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS LISTING / STATES ── */}

        {/* State 1: Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="border border-zinc-900 rounded-sm bg-zinc-950/40 p-4 animate-pulse flex flex-col space-y-4"
              >
                <div className="aspect-[3/4] bg-zinc-900/80 rounded-sm" />
                <div className="h-4 bg-zinc-900 rounded w-3/4" />
                <div className="h-3 bg-zinc-900/60 rounded w-1/2" />
                <div className="h-5 bg-zinc-900/80 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error */}
        {!loading && error && (
          <div className="border border-red-900/40 bg-red-950/10 rounded-sm p-8 text-center my-12">
            <p className="text-red-400 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={() => handleGetSellerProduct()}
              className="text-xs uppercase tracking-wider text-yellow-400 underline hover:text-yellow-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* State 3: Empty Catalog */}
        {!loading && !error && sellerProducts.length === 0 && (
          <div className="border border-dashed border-zinc-800 rounded-sm p-16 text-center my-8 bg-zinc-950/20 max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600">
              <svg className="w-6 h-6 text-yellow-400/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold tracking-tight mb-2">No Products in Catalog</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-8 leading-relaxed">
              Your collection is empty right now. Start building your brand footprint by publishing your very first drop.
            </p>
            <Link
              to="/seller/create-product"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-6 py-3.5 text-xs tracking-[0.2em] uppercase rounded-sm transition-all"
            >
              <span>+ Add Your First Product</span>
            </Link>
          </div>
        )}

        {/* State 4: No Search Results */}
        {!loading && !error && sellerProducts.length > 0 && filteredProducts.length === 0 && (
          <div className="border border-zinc-900 rounded-sm p-12 text-center my-8 bg-zinc-950/20">
            <p className="text-zinc-400 text-sm mb-2">No matching products found</p>
            <p className="text-zinc-600 text-xs mb-4">No garments matched &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-yellow-400 text-xs tracking-wider uppercase underline hover:text-yellow-300"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* State 5: Render Products (GRID VIEW) */}
        {!loading && !error && filteredProducts.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const primaryImg = getProductImage(product, 0)
              const imageCount = product.images?.length || 0

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProduct(product)
                    setActiveModalImageIndex(0)
                  }}
                  className="group relative bg-zinc-950/50 border border-zinc-900 hover:border-zinc-700/80 rounded-sm overflow-hidden flex flex-col transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  {/* Image container */}
                  <div className="relative aspect-[3/4] bg-zinc-900/60 overflow-hidden">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={product.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
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

                    {/* Currency & Price Badge on Image overlay */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-sm">
                      <span className="text-yellow-400 font-bold text-xs tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-zinc-600 text-[9px] tracking-[0.2em] uppercase">
                          {formatDate(product.createdAt)}
                        </span>
                        <span className="text-zinc-600 text-[10px]">ID: {product._id?.slice(-5)}</span>
                      </div>
                      <h3 className="text-white font-bold text-sm tracking-wide line-clamp-1 group-hover:text-yellow-400 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 text-[10px] tracking-[0.15em] uppercase font-semibold group-hover:text-yellow-400 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* State 6: Render Products (LIST VIEW) */}
        {!loading && !error && filteredProducts.length > 0 && viewMode === 'list' && (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const primaryImg = getProductImage(product, 0)
              const imageCount = product.images?.length || 0

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProduct(product)
                    setActiveModalImageIndex(0)
                  }}
                  className="group bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-900 hover:border-zinc-700/80 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 bg-zinc-900/60 rounded-sm shrink-0 overflow-hidden relative border border-zinc-800">
                      {primaryImg ? (
                        <img
                          src={primaryImg}
                          alt={product.title}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">
                          N/A
                        </div>
                      )}
                      {imageCount > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] px-1 text-zinc-300">
                          +{imageCount - 1}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold text-sm tracking-wide truncate group-hover:text-yellow-400 transition-colors">
                          {product.title}
                        </h3>
                        <span className="text-zinc-600 text-[10px] shrink-0">
                          #{product._id?.slice(-6)}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-1 truncate max-w-xl">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-zinc-600 text-[10px] tracking-wider uppercase">
                        <span>Listed: {formatDate(product.createdAt)}</span>
                        <span>•</span>
                        <span>{imageCount} photo{imageCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center gap-6 sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-900 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-zinc-600 text-[9px] tracking-widest uppercase block">Price</span>
                      <span className="text-yellow-400 font-bold text-base tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button className="text-zinc-400 group-hover:text-yellow-400 text-xs uppercase tracking-wider font-semibold">
                      Details →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image Gallery */}
              <div>
                <div className="aspect-[3/4] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800 relative group">
                  {getProductImage(selectedProduct, activeModalImageIndex) ? (
                    <img
                      src={getProductImage(selectedProduct, activeModalImageIndex)}
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      No Image Available
                    </div>
                  )}

                  {/* Navigation Arrows on Main Photo */}
                  {selectedProduct.images?.length > 1 && (
                    <>
                      {/* Left Arrow */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveModalImageIndex((prev) =>
                            prev > 0 ? prev - 1 : selectedProduct.images.length - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm hover:scale-105 active:scale-95"
                        title="Previous Photo"
                      >
                        ‹
                      </button>

                      {/* Right Arrow */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveModalImageIndex((prev) =>
                            prev < selectedProduct.images.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm hover:scale-105 active:scale-95"
                        title="Next Photo"
                      >
                        ›
                      </button>

                      {/* Counter Badge */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 text-zinc-300 text-[10px] tracking-wider px-2 py-0.5 rounded-sm font-medium">
                        {activeModalImageIndex + 1} / {selectedProduct.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Side-by-side Thumbnails with Left & Right Nav Buttons */}
                {selectedProduct.images?.length > 1 && (
                  <div className="flex items-center gap-2 mt-3">
                    {/* Left Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModalImageIndex((prev) =>
                          prev > 0 ? prev - 1 : selectedProduct.images.length - 1
                        )
                      }
                      className="w-7 h-14 sm:h-16 rounded-sm border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-yellow-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer text-base font-bold select-none"
                      title="Previous photo"
                    >
                      ‹
                    </button>

                    {/* Side-by-side Thumbnails Container (Auto-scrolls, No Scrollbar) */}
                    <div
                      ref={thumbnailContainerRef}
                      className="flex-1 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 scroll-smooth"
                    >
                      {selectedProduct.images.map((img, i) => {
                        const url = typeof img === 'string' ? img : img?.url
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveModalImageIndex(i)}
                            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-sm overflow-hidden border shrink-0 transition-all cursor-pointer ${
                              activeModalImageIndex === i
                                ? 'border-yellow-400 ring-1 ring-yellow-400 opacity-100 scale-102'
                                : 'border-zinc-800 opacity-50 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover object-top" />
                          </button>
                        )
                      })}
                    </div>

                    {/* Right Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModalImageIndex((prev) =>
                          prev < selectedProduct.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="w-7 h-14 sm:h-16 rounded-sm border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-yellow-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer text-base font-bold select-none"
                      title="Next photo"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                    <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-medium">
                      Product Details
                    </span>
                  </div>

                  <h2 className="text-white text-2xl font-black tracking-tight leading-tight">
                    {selectedProduct.title}
                  </h2>

                  {/* Price */}
                  <div className="mt-4 pb-4 border-b border-zinc-900">
                    <span className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase block mb-1">
                      Price
                    </span>
                    <span className="text-yellow-400 text-3xl font-black tracking-tight">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <span className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase block mb-2">
                      Description
                    </span>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>

                {/* Meta details */}
                <div className="pt-4 border-t border-zinc-900 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Product ID</span>
                    <span className="text-zinc-300 font-mono text-[11px]">{selectedProduct._id}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Listed Date</span>
                    <span className="text-zinc-300">{formatDate(selectedProduct.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Images Uploaded</span>
                    <span className="text-zinc-300">{selectedProduct.images?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard