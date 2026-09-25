import React, { useEffect, useState, useRef, useMemo } from 'react'
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

  // ── VARIANT, SIZE & STOCK SELECTION STATES ──
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false)
  const [sizeGuideUnit, setSizeGuideUnit] = useState('in')
  const [bagToast, setBagToast] = useState(null)

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

            if (data.variants && data.variants.length > 0) {
              const inStock = data.variants.find((v) => Number(v.stock) > 0) || data.variants[0]
              if (inStock) {
                setSelectedVariantId(inStock._id)
                const sz = inStock.attributes instanceof Map 
                  ? inStock.attributes.get('size') 
                  : (inStock.attributes?.size || inStock.attributes?.Size)
                const clr = inStock.attributes instanceof Map
                  ? inStock.attributes.get('color')
                  : (inStock.attributes?.color || inStock.attributes?.Color)

                if (sz) setSelectedSize(String(sz).trim().toUpperCase())
                if (clr) setSelectedColor(clr)

                // Initialize dynamic attributes (e.g. storage, ram, material)
                const rawAttrs = inStock.attributes instanceof Map
                  ? Object.fromEntries(inStock.attributes.entries())
                  : (typeof inStock.attributes === 'object' && inStock.attributes !== null ? inStock.attributes : {})
                const initCustomAttrs = {}
                Object.entries(rawAttrs).forEach(([k, val]) => {
                  const lk = k.toLowerCase()
                  if (lk !== 'size' && lk !== 'color' && val) {
                    initCustomAttrs[lk] = String(val)
                  }
                })
                setSelectedAttributes(initCustomAttrs)
              }
            } else {
              setSelectedSize('M')
              setSelectedVariantId(null)
              setSelectedAttributes({})
            }
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

  // Helper to extract attribute object from variant (handles Map and plain Object)
  const getAttributesObject = (attributes) => {
    if (!attributes) return {}
    try {
      if (attributes instanceof Map) {
        return Object.fromEntries(attributes.entries())
      }
      if (typeof attributes === 'object') {
        return attributes
      }
    } catch {
      return {}
    }
    return {}
  }

  const getVariantAttribute = (variant, key) => {
    if (!variant || !variant.attributes) return null
    const attrs = getAttributesObject(variant.attributes)
    const matchKey = Object.keys(attrs).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    )
    return matchKey ? attrs[matchKey] : null
  }

  // Derive variants info, dynamic attributes, stock, active variant
  const {
    availableSizes,
    availableColors,
    otherAttributeGroups,
    hasSizeAttribute,
    selectedVariant,
    currentStock,
    totalStock,
    hasRealVariants,
  } = useMemo(() => {
    const variants = product?.variants || []
    const hasVars = variants.length > 0
    const total = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

    const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

    if (!hasVars) {
      // Default fallback sizes for products without variants
      const fallbackSizes = STANDARD_SIZES.map((size) => ({
        size,
        stock: 50,
        hasVariant: false,
        variant: null,
      }))

      return {
        availableSizes: fallbackSizes,
        availableColors: [],
        otherAttributeGroups: [],
        hasSizeAttribute: true,
        selectedVariant: null,
        currentStock: 50,
        totalStock: 50,
        hasRealVariants: false,
      }
    }

    // Collect all dynamic attribute keys & values across variants
    const allAttrKeys = new Set()
    const allAttrValuesMap = {} // lowerKey -> Set of original values

    variants.forEach((v) => {
      const attrs = getAttributesObject(v.attributes)
      Object.entries(attrs).forEach(([k, val]) => {
        const lowerKey = k.toLowerCase()
        allAttrKeys.add(lowerKey)
        if (!allAttrValuesMap[lowerKey]) {
          allAttrValuesMap[lowerKey] = new Set()
        }
        if (val) allAttrValuesMap[lowerKey].add(String(val))
      })
    })

    const hasSize = allAttrKeys.has('size')
    const hasColor = allAttrKeys.has('color')

    // Dynamic attribute groups other than size & color (e.g. storage, ram, material)
    const otherGroups = Array.from(allAttrKeys)
      .filter((k) => k !== 'size' && k !== 'color')
      .map((k) => ({
        key: k,
        label: k.toUpperCase(),
        values: Array.from(allAttrValuesMap[k] || []),
      }))

    // Build size list from variants if size attribute exists
    const sizeMap = new Map()
    const colorSet = new Set()

    variants.forEach((v) => {
      const sizeVal = getVariantAttribute(v, 'size')
      const colorVal = getVariantAttribute(v, 'color')
      if (colorVal) colorSet.add(colorVal)

      if (hasSize) {
        const normalizedSize = sizeVal ? String(sizeVal).trim().toUpperCase() : 'FREE SIZE'
        const variantStock = Math.max(0, Number(v.stock) || 0)

        if (!sizeMap.has(normalizedSize)) {
          sizeMap.set(normalizedSize, {
            size: normalizedSize,
            stock: variantStock,
            hasVariant: true,
            variant: v,
          })
        } else {
          const item = sizeMap.get(normalizedSize)
          item.stock += variantStock
          if (item.stock === 0 && variantStock > 0) {
            item.variant = v
          }
        }
      }
    })

    const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'FREE SIZE']
    const sortedSizes = Array.from(sizeMap.values()).sort((a, b) => {
      const idxA = SIZE_ORDER.indexOf(a.size)
      const idxB = SIZE_ORDER.indexOf(b.size)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.size.localeCompare(b.size)
    })

    // Active variant matching
    let activeVar = null
    if (selectedVariantId) {
      activeVar = variants.find((v) => v._id === selectedVariantId)
    }
    if (!activeVar) {
      activeVar = variants.find((v) => {
        if (hasSize && selectedSize) {
          const s = getVariantAttribute(v, 'size')
          if (s && String(s).trim().toUpperCase() !== selectedSize.toUpperCase()) return false
        }
        if (hasColor && selectedColor) {
          const c = getVariantAttribute(v, 'color')
          if (c && c !== selectedColor) return false
        }
        for (const grp of otherGroups) {
          const selVal = selectedAttributes[grp.key]
          if (selVal) {
            const vVal = getVariantAttribute(v, grp.key)
            if (vVal && String(vVal).toLowerCase() !== String(selVal).toLowerCase()) return false
          }
        }
        return true
      })
    }
    if (!activeVar && sortedSizes.length > 0) {
      activeVar = sortedSizes[0].variant
    }
    if (!activeVar && variants.length > 0) {
      activeVar = variants[0]
    }

    const curStock = activeVar ? Math.max(0, Number(activeVar.stock) || 0) : total

    return {
      availableSizes: sortedSizes,
      availableColors: Array.from(colorSet),
      otherAttributeGroups: otherGroups,
      hasSizeAttribute: hasSize,
      selectedVariant: activeVar,
      currentStock: curStock,
      totalStock: total,
      hasRealVariants: true,
    }
  }, [product, selectedVariantId, selectedSize, selectedColor, selectedAttributes])

  const handleSelectSize = (sizeItem) => {
    setSelectedSize(sizeItem.size)
    const matched =
      product?.variants?.find((v) => {
        const s = getVariantAttribute(v, 'size')
        if (s && String(s).trim().toUpperCase() !== sizeItem.size.toUpperCase()) return false
        if (selectedColor) {
          const c = getVariantAttribute(v, 'color')
          if (c && c !== selectedColor) return false
        }
        for (const [k, val] of Object.entries(selectedAttributes)) {
          if (val) {
            const vVal = getVariantAttribute(v, k)
            if (vVal && String(vVal).toLowerCase() !== String(val).toLowerCase()) return false
          }
        }
        return true
      }) || sizeItem.variant

    if (matched) {
      setSelectedVariantId(matched._id)
      const varStock = Math.max(0, Number(matched.stock) || 0)
      if (varStock > 0 && quantity > varStock) {
        setQuantity(1)
      }
    }
  }

  const handleSelectColor = (color) => {
    setSelectedColor(color)
    const matched =
      product?.variants?.find((v) => {
        const c = getVariantAttribute(v, 'color')
        if (c && c !== color) return false
        if (selectedSize) {
          const s = getVariantAttribute(v, 'size')
          if (s && String(s).trim().toUpperCase() !== selectedSize.toUpperCase()) return false
        }
        for (const [k, val] of Object.entries(selectedAttributes)) {
          if (val) {
            const vVal = getVariantAttribute(v, k)
            if (vVal && String(vVal).toLowerCase() !== String(val).toLowerCase()) return false
          }
        }
        return true
      }) ||
      product?.variants?.find((v) => {
        const c = getVariantAttribute(v, 'color')
        return c === color
      })

    if (matched) {
      setSelectedVariantId(matched._id)
      const varStock = Math.max(0, Number(matched.stock) || 0)
      if (varStock > 0 && quantity > varStock) {
        setQuantity(1)
      }
    }
  }

  const handleSelectCustomAttribute = (attrKey, val) => {
    const nextAttrs = { ...selectedAttributes, [attrKey]: val }
    setSelectedAttributes(nextAttrs)
    const matched =
      product?.variants?.find((v) => {
        const vVal = getVariantAttribute(v, attrKey)
        if (!vVal || String(vVal).toLowerCase() !== String(val).toLowerCase()) return false
        if (selectedSize) {
          const s = getVariantAttribute(v, 'size')
          if (s && String(s).trim().toUpperCase() !== selectedSize.toUpperCase()) return false
        }
        if (selectedColor) {
          const c = getVariantAttribute(v, 'color')
          if (c && c !== selectedColor) return false
        }
        for (const [k, customVal] of Object.entries(nextAttrs)) {
          if (customVal) {
            const checkVal = getVariantAttribute(v, k)
            if (checkVal && String(checkVal).toLowerCase() !== String(customVal).toLowerCase()) return false
          }
        }
        return true
      }) ||
      product?.variants?.find((v) => {
        const vVal = getVariantAttribute(v, attrKey)
        return vVal && String(vVal).toLowerCase() === String(val).toLowerCase()
      })

    if (matched) {
      setSelectedVariantId(matched._id)
      const varStock = Math.max(0, Number(matched.stock) || 0)
      if (varStock > 0 && quantity > varStock) {
        setQuantity(1)
      }
    }
  }

  // Display label for active variant in buttons & notifications
  const variantDisplayLabel = useMemo(() => {
    if (!selectedVariant) {
      return selectedSize ? `Size ${selectedSize}` : 'Default'
    }
    const attrs = getAttributesObject(selectedVariant.attributes)
    const entries = Object.entries(attrs)
    if (entries.length === 0) {
      return selectedSize ? `Size ${selectedSize}` : 'Default'
    }
    return entries.map(([k, v]) => `${v}`).join(' / ')
  }, [selectedVariant, selectedSize])

  const showBagToast = (msg) => {
    setBagToast(msg)
    setTimeout(() => setBagToast(null), 3500)
  }

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

  const activePriceObj = selectedVariant?.price?.amount
    ? selectedVariant.price
    : product?.price

  // Dynamic gallery images: show selected variant's images if available, otherwise fallback to drop images
  const activeImages = useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images
    }
    return product?.images || []
  }, [selectedVariant, product])

  // Reset gallery active index to 0 whenever selected variant changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedVariantId])

  const getDisplayImageUrl = (img) => {
    if (!img) return null
    if (typeof img === 'string') return img
    return img?.url || null
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
              {activeImages.length > 0 && (
                <div className="w-14 sm:w-20 md:w-22 shrink-0 flex flex-col items-center gap-2 select-none">
                  {/* Up / Previous Photo Button - Only when multiple images */}
                  {activeImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev > 0 ? prev - 1 : activeImages.length - 1
                        )
                      }
                      className="w-full h-7 sm:h-8 rounded-sm border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-yellow-400 flex items-center justify-center transition-colors cursor-pointer select-none"
                      title="Previous photo"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                  )}

                  {/* Vertical Scrollable Thumbnails Container */}
                  <div
                    ref={thumbnailContainerRef}
                    className="w-full flex flex-col gap-2.5 overflow-y-auto max-h-[380px] sm:max-h-[500px] lg:max-h-[620px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 scroll-smooth"
                  >
                    {activeImages.map((img, i) => {
                      const url = getDisplayImageUrl(img)
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
                          style={{ aspectRatio: '4 / 5' }}
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

                  {/* Down / Next Photo Button - Only when multiple images */}
                  {activeImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev < activeImages.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="w-full h-7 sm:h-8 rounded-sm border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-yellow-400 flex items-center justify-center transition-colors cursor-pointer select-none"
                      title="Next photo"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Main Image Frame (Fashion 4:5 Aspect Ratio) */}
              <div 
                className="relative flex-1 min-w-0 aspect-[4/5] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-900 select-none group"
                style={{ aspectRatio: '4 / 5' }}
              >
                {getDisplayImageUrl(activeImages[activeImageIndex]) ? (
                  <img
                    src={getDisplayImageUrl(activeImages[activeImageIndex])}
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
                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous Photo"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev > 0 ? prev - 1 : activeImages.length - 1
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
                          prev < activeImages.length - 1 ? prev + 1 : 0
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
                      {activeImageIndex + 1} / {activeImages.length}
                    </div>
                  </>
                )}

                {/* Badge Tag on bottom left */}
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-yellow-400/20 px-3 py-1.5 rounded-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 text-[10px] font-black tracking-[0.25em] uppercase">
                    {selectedVariant?.images?.length > 0 ? `Variant Gallery (${selectedVariant.images.length})` : 'Authentic Release'}
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
                      {formatPrice(activePriceObj)}
                    </span>
                    <span className="text-zinc-500 text-xs tracking-wider uppercase">
                      Inclusive of all taxes
                    </span>
                  </div>

                  {/* Stock & Delivery Status */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {currentStock > 10 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>In Stock ({currentStock} Units • {variantDisplayLabel})</span>
                      </span>
                    ) : currentStock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                        <span>Low Stock: Only {currentStock} Left for {variantDisplayLabel}!</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>Out of Stock • {variantDisplayLabel}</span>
                      </span>
                    )}

                    {totalStock > 0 && hasRealVariants && (
                      <span className="text-zinc-500 text-xs flex items-center gap-1">
                        <span>•</span> {totalStock} Total Drop Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* ── VARIANT & SIZE SELECTION SECTION ── */}
                <div className="mt-6">
                  {(hasSizeAttribute || !hasRealVariants) && (
                    <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-bold">
                        Select Size
                      </span>
                      {selectedSize && (
                        <span className="text-yellow-400 text-xs font-black tracking-widest uppercase">
                          — {selectedSize}
                        </span>
                      )}
                    </div>

                    {/* Size Guide Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowSizeGuideModal(true)}
                      className="text-zinc-400 hover:text-yellow-400 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer group select-none"
                    >
                      <svg className="w-4 h-4 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                      <span className="underline underline-offset-4 decoration-zinc-700 group-hover:decoration-yellow-400">
                        Size Guide
                      </span>
                    </button>
                  </div>

                  {/* Size Chips */}
                  <div className="flex flex-wrap gap-2.5">
                    {availableSizes.map((item) => {
                      const isSelected = selectedSize === item.size
                      const isSoldOut = item.hasVariant && item.stock <= 0
                      const isFewLeft = item.hasVariant && item.stock > 0 && item.stock <= 5

                      return (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => handleSelectSize(item)}
                          className={`min-w-[56px] h-12 px-3.5 rounded-sm border text-xs uppercase font-black transition-all flex flex-col items-center justify-center relative cursor-pointer select-none ${
                            isSelected
                              ? 'bg-yellow-400 text-zinc-950 border-yellow-400 shadow-lg shadow-yellow-400/20 scale-[1.03] z-10'
                              : isSoldOut
                              ? 'bg-zinc-950/40 text-zinc-600 border-zinc-900 opacity-60 hover:opacity-80'
                              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <span className={isSoldOut ? 'line-through' : ''}>{item.size}</span>
                          {isFewLeft && (
                            <span
                              className={`text-[8px] font-bold tracking-tight leading-none mt-0.5 ${
                                isSelected ? 'text-zinc-950' : 'text-yellow-400'
                              }`}
                            >
                              {item.stock} left
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="text-[7.5px] text-zinc-500 font-semibold tracking-tighter leading-none mt-0.5">
                              Sold out
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

                  {/* Color Selection if available */}
                  {availableColors.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-zinc-900/60">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-bold">
                          Color:
                        </span>
                        <span className="text-zinc-200 text-xs font-semibold">
                          {selectedColor || availableColors[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                          const isColorActive = (selectedColor || availableColors[0]) === color
                          const colorVar = product?.variants?.find((v) => {
                            const c = getVariantAttribute(v, 'color')
                            return c === color && v.images && v.images.length > 0
                          })
                          const colorThumb = colorVar ? getDisplayImageUrl(colorVar.images[0]) : null

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleSelectColor(color)}
                              className={`px-3 py-1.5 rounded-sm border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                                isColorActive
                                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white'
                              }`}
                            >
                              {colorThumb && (
                                <img
                                  src={colorThumb}
                                  alt={color}
                                  className="w-4 h-4 rounded-full object-cover border border-white/20"
                                />
                              )}
                              <span>{color}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Custom Attribute Selectors (Storage, RAM, Material, etc.) */}
                  {otherAttributeGroups && otherAttributeGroups.length > 0 && (
                    <div className="space-y-4">
                      {otherAttributeGroups.map((group) => {
                        const activeVal = selectedAttributes[group.key] || group.values[0]
                        return (
                          <div key={group.key} className="mt-4 pt-3.5 border-t border-zinc-900/60">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-bold">
                                {group.label}:
                              </span>
                              <span className="text-yellow-400 text-xs font-mono font-bold">
                                {activeVal}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.values.map((val) => {
                                const isAttrActive = activeVal === val
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSelectCustomAttribute(group.key, val)}
                                    className={`px-3 py-1.5 rounded-sm border text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                      isAttrActive
                                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-bold'
                                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Stock Card / Urgency Info */}
                  <div className="mt-4 p-3.5 rounded-sm bg-zinc-950/60 border border-zinc-900">
                    {currentStock > 10 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">
                            Available in Warehouse
                          </span>
                        </div>
                        <span className="text-zinc-400 text-xs font-mono">
                          <span className="text-white font-bold">{currentStock}</span> units in stock
                        </span>
                      </div>
                    ) : currentStock > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                            </span>
                            <span className="text-yellow-400 text-xs font-black tracking-wider uppercase">
                              Low Stock Alert
                            </span>
                          </div>
                          <span className="text-yellow-400 text-xs font-mono font-bold">
                            Only {currentStock} unit{currentStock > 1 ? 's' : ''} left for {variantDisplayLabel}!
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (currentStock / 10) * 100)}%` }}
                          />
                        </div>
                        <p className="text-zinc-500 text-[11px] mt-1.5">
                          High demand item — complete order before stock runs out.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-red-400 text-xs font-bold tracking-wider uppercase">
                            {variantDisplayLabel} is Out of Stock
                          </span>
                        </div>
                        <span className="text-zinc-500 text-[11px]">
                          Select another option or sign up for drop alerts
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-bold">
                      Quantity
                    </span>
                    {currentStock > 0 && currentStock <= 10 && (
                      <span className="text-yellow-400/80 text-[10px] mt-0.5">
                        (Max {Math.min(currentStock, 10)} per customer)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center border border-zinc-800 rounded-sm bg-zinc-950/80">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || currentStock <= 0}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-base font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-white font-bold text-sm">
                      {currentStock <= 0 ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(Math.min(currentStock, 10), q + 1))}
                      disabled={quantity >= Math.min(currentStock, 10) || currentStock <= 0}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-base font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ── ACTION BUTTONS: ADD TO BAG & BUY NOW ── */}
                <div className="mt-8 space-y-3">
                  {currentStock > 0 ? (
                    <>
                      {/* Buy Now Button (High Priority CTA) */}
                      <button
                        type="button"
                        onClick={() => showBagToast(`Proceeding to checkout for ${variantDisplayLabel} (${quantity} unit${quantity > 1 ? 's' : ''})...`)}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-zinc-950 font-black py-4 px-6 text-xs sm:text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-200 cursor-pointer shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2.5"
                      >
                        <svg className="w-4 h-4 text-zinc-950 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        <span>Buy Now • {variantDisplayLabel}</span>
                      </button>

                      {/* Add To Bag Button (Secondary Luxury Border CTA) */}
                      <button
                        type="button"
                        onClick={() => showBagToast(`Added ${quantity} × ${variantDisplayLabel} to your bag!`)}
                        className="w-full border-2 border-zinc-700 hover:border-yellow-400/80 bg-zinc-900/60 hover:bg-zinc-900 text-white font-bold py-4 px-6 text-xs sm:text-sm tracking-[0.2em] uppercase rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span>Add To Bag</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Out of Stock State */}
                      <button
                        type="button"
                        disabled
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-black py-4 px-6 text-xs sm:text-sm tracking-[0.25em] uppercase rounded-sm cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                      >
                        <span>{variantDisplayLabel} Out of Stock</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => showBagToast(`We will notify you when ${variantDisplayLabel} is restocked!`)}
                        className="w-full border border-zinc-800 hover:border-yellow-400/50 bg-zinc-900/40 text-yellow-400 font-bold py-4 px-6 text-xs sm:text-sm tracking-[0.2em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        <span>Notify Me When Restocked</span>
                      </button>
                    </>
                  )}
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

      {/* ── SIZE GUIDE MODAL ── */}
      {showSizeGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowSizeGuideModal(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-lg w-full p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSizeGuideModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white text-base w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                Snitch Fit Guide
              </span>
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-tight">Garment Measurements</h3>
            <p className="text-zinc-400 text-xs mt-1 mb-5 leading-relaxed">
              Tailored for an oversized modern streetwear drape. All measurements are taken with the garment laid flat.
            </p>

            {/* Units Toggle */}
            <div className="flex items-center gap-2 mb-4 bg-zinc-900/60 p-1 rounded-sm border border-zinc-800 w-fit">
              <button
                type="button"
                onClick={() => setSizeGuideUnit('in')}
                className={`px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider transition-colors cursor-pointer ${
                  sizeGuideUnit === 'in' ? 'bg-yellow-400 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setSizeGuideUnit('cm')}
                className={`px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider transition-colors cursor-pointer ${
                  sizeGuideUnit === 'cm' ? 'bg-yellow-400 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>

            {/* Measurement Chart */}
            <div className="border border-zinc-800 rounded-sm overflow-hidden text-xs">
              <div className="grid grid-cols-4 bg-zinc-900/80 px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <div>Size</div>
                <div>Chest</div>
                <div>Length</div>
                <div>Shoulder</div>
              </div>
              <div className="divide-y divide-zinc-900">
                {[
                  { size: 'XS', in: ['36', '27', '16.5'], cm: ['91', '69', '42'] },
                  { size: 'S', in: ['38', '28', '17.5'], cm: ['96', '71', '44'] },
                  { size: 'M', in: ['40', '29', '18.5'], cm: ['102', '74', '47'] },
                  { size: 'L', in: ['42', '30', '19.5'], cm: ['107', '76', '50'] },
                  { size: 'XL', in: ['44', '31', '20.5'], cm: ['112', '79', '52'] },
                  { size: 'XXL', in: ['46', '32', '21.5'], cm: ['117', '81', '55'] },
                ].map((row) => {
                  const vals = sizeGuideUnit === 'in' ? row.in : row.cm
                  const isRowSelected = selectedSize === row.size
                  return (
                    <div
                      key={row.size}
                      className={`grid grid-cols-4 px-4 py-2.5 transition-colors ${
                        isRowSelected ? 'bg-yellow-400/10 text-yellow-400 font-bold' : 'text-zinc-300 hover:bg-zinc-900/30'
                      }`}
                    >
                      <div className="font-black flex items-center gap-1.5">
                        <span>{row.size}</span>
                        {isRowSelected && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                      </div>
                      <div>{vals[0]} {sizeGuideUnit}</div>
                      <div>{vals[1]} {sizeGuideUnit}</div>
                      <div>{vals[2]} {sizeGuideUnit}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-sm flex items-start gap-2.5 text-[11px] text-zinc-400">
              <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <span>
                Drop fits true to oversized size. Choose regular size for drop-shoulder silhouette, or size down for standard fit.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── BAG / ACTION TOAST NOTIFICATION ── */}
      {bagToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-yellow-400/40 text-white px-5 py-3.5 rounded-sm shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span className="text-xs font-bold tracking-wide">{bagToast}</span>
        </div>
      )}
    </div>
  )
}

export default ProductDetail