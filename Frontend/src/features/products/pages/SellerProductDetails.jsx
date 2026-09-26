import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct.js'
import { useAuth } from '../../auth/hook/useAuth.js'
import LogoutConfirmModal from '../../auth/components/LogoutConfirmModal.jsx'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

const ATTRIBUTE_PRESETS = [
  {
    key: 'size',
    label: 'Size',
    suggestions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', 'Free Size'],
  },
  {
    key: 'color',
    label: 'Color',
    suggestions: ['Onyx Black', 'Off-White', 'Slate Grey', 'Beige', 'Vintage Navy', 'Olive Green', 'Crimson'],
  },
  {
    key: 'storage',
    label: 'Storage',
    suggestions: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
  },
  {
    key: 'ram',
    label: 'RAM',
    suggestions: ['4GB', '8GB', '16GB', '32GB', '64GB'],
  },
  {
    key: 'material',
    label: 'Material',
    suggestions: ['100% Cotton', 'Heavy Fleece', 'Genuine Leather', 'Denim', 'Silk', 'Linen', 'Nylon'],
  },
  {
    key: 'fit',
    label: 'Fit',
    suggestions: ['Oversized', 'Boxy Fit', 'Regular Fit', 'Slim Fit', 'Relaxed'],
  },
]

const SellerProductDetails = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const {
    handleGetProductById,
    handleUpdateProduct,
    handleDeleteProduct,
    handleCreateVariant,
    handleUpdateVariantStock,
    handleDeleteVariant,
    handleAddVariantImages,
  } = useProduct()
  const { handleGetMe, handleLogout } = useAuth()

  const user = useSelector((state) => state.auth?.user)

  // Logout Confirmation Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleUserLogout = () => {
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

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [copyToast, setCopyToast] = useState(null)

  // ── EDIT PRODUCT INFO & IMAGES MODAL STATE ──
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: 'TSHIRTS',
    color: '',
    priceAmount: '',
    priceCurrency: 'INR',
  })
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editExistingImages, setEditExistingImages] = useState([])
  const [editNewFiles, setEditNewFiles] = useState([])
  const [editNewPreviews, setEditNewPreviews] = useState([])
  const editFileInputRef = useRef(null)

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      editNewPreviews.forEach((p) => {
        if (p?.url) URL.revokeObjectURL(p.url)
      })
    }
  }, [editNewPreviews])

  // ── DELETE DROP CONFIRMATION MODAL STATE ──
  const [isDeleteDropModalOpen, setIsDeleteDropModalOpen] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)

  // ── VARIANT & STOCK MANAGEMENT STATE ──
  const [isCreatingVariant, setIsCreatingVariant] = useState(false)
  const [variantActionLoading, setVariantActionLoading] = useState(null)
  const [stockInputs, setStockInputs] = useState({})

  // Dynamic attributes list: [ { id: 'attr_1', key: 'size', value: 'M' }, ... ]
  const [dynamicAttributes, setDynamicAttributes] = useState([
    { id: 'attr_1', key: 'size', value: 'M' },
    { id: 'attr_2', key: 'color', value: '' },
  ])
  const [variantStock, setVariantStock] = useState(25)
  const [variantPriceAmount, setVariantPriceAmount] = useState('')

  // ── VARIANT IMAGE STATE ──
  const [variantImageFiles, setVariantImageFiles] = useState([])
  const [variantImagePreviews, setVariantImagePreviews] = useState([])
  const [variantSelectedDropImages, setVariantSelectedDropImages] = useState([])

  // ── MODAL TO UPLOAD IMAGES TO EXISTING VARIANT ──
  const [activeImageModalVariant, setActiveImageModalVariant] = useState(null)
  const [modalUploadFiles, setModalUploadFiles] = useState([])
  const [modalUploadPreviews, setModalUploadPreviews] = useState([])
  const [modalUploadLoading, setModalUploadLoading] = useState(false)

  // ── MODAL TO CONFIRM VARIANT DELETION ──
  const [deleteModalVariant, setDeleteModalVariant] = useState(null)

  const thumbnailContainerRef = useRef(null)

  // Fetch auth session if not available
  useEffect(() => {
    if (!user) {
      handleGetMe?.().catch(() => {})
    }
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [productId])

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

  // Sync stockInputs with product variants
  useEffect(() => {
    if (product?.variants) {
      const map = {}
      product.variants.forEach((v) => {
        map[v._id] = v.stock ?? 0
      })
      setStockInputs(map)
    }
    if (product && !variantPriceAmount) {
      setVariantPriceAmount(product.price?.amount || '')
    }
  }, [product])

  // Fetch product details
  useEffect(() => {
    let isMounted = true

    const fetchDetails = async () => {
      if (!productId) {
        setError('Invalid Product Identifier')
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
            setError('Product not found in your seller catalogue.')
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to fetch seller product details.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDetails()

    return () => {
      isMounted = false
    }
  }, [productId])

  const formatPrice = (priceObj) => {
    if (!priceObj) return '—'
    const symbol = CURRENCY_SYMBOLS[priceObj.currency] || priceObj.currency || '₹'
    const amount = Number(priceObj.amount || 0).toLocaleString()
    return `${symbol}${amount}`
  }

  const formatDate = (isoString) => {
    if (!isoString) return '—'
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const getProductImage = (prod, index = 0) => {
    if (!prod?.images || prod.images.length === 0) return null
    const item = prod.images[index]
    if (typeof item === 'string') return item
    return item?.url || null
  }

  const handleCopy = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`)
    })
  }

  const showToast = (msg) => {
    setCopyToast(msg)
    setTimeout(() => setCopyToast(null), 3500)
  }

  // ── EDIT DROP INFO & DELETE DROP HANDLERS ──

  const handleOpenEditModal = () => {
    if (!product) return
    setEditFormData({
      title: product.title || '',
      description: product.description || '',
      category: product.category || 'TSHIRTS',
      color: product.color || '',
      priceAmount: product.price?.amount != null ? product.price.amount : '',
      priceCurrency: product.price?.currency || 'INR',
    })

    // Extract current existing image URLs
    const existing = (product.images || [])
      .map((img) => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean)
    setEditExistingImages(existing)

    // Revoke previous previews if any
    editNewPreviews.forEach((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
    })
    setEditNewFiles([])
    setEditNewPreviews([])
    setEditError(null)
    setIsEditInfoModalOpen(true)
  }

  const handleCloseEditModal = () => {
    if (isUpdatingProduct) return
    editNewPreviews.forEach((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
    })
    setEditNewFiles([])
    setEditNewPreviews([])
    setEditError(null)
    setIsEditInfoModalOpen(false)
  }

  const handleRemoveExistingImage = (idxToRemove) => {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== idxToRemove))
  }

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const currentTotal = editExistingImages.length + editNewFiles.length
    const maxAllowed = 7 - currentTotal

    if (maxAllowed <= 0) {
      setEditError('Maximum limit of 7 drop images reached.')
      e.target.value = ''
      return
    }

    const filesToAdd = files.slice(0, maxAllowed)
    if (files.length > maxAllowed) {
      showToast(`Only ${maxAllowed} more photo(s) could be added (max 7 total).`)
    }

    setEditNewFiles((prev) => [...prev, ...filesToAdd])
    const newPreviews = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setEditNewPreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const handleRemoveNewFile = (idxToRemove) => {
    setEditNewFiles((prev) => prev.filter((_, i) => i !== idxToRemove))
    setEditNewPreviews((prev) => {
      const removed = prev[idxToRemove]
      if (removed?.url) URL.revokeObjectURL(removed.url)
      return prev.filter((_, i) => i !== idxToRemove)
    })
  }

  const handleSaveEditProduct = async (e) => {
    e.preventDefault()
    if (!editFormData.title.trim()) {
      setEditError('Drop title is required')
      return
    }
    if (isNaN(Number(editFormData.priceAmount)) || Number(editFormData.priceAmount) < 0) {
      setEditError('Please enter a valid price amount')
      return
    }

    const totalImages = editExistingImages.length + editNewFiles.length
    if (totalImages === 0) {
      setEditError('Drop must contain at least 1 image. Please keep an existing image or upload a new photo.')
      return
    }

    try {
      setIsUpdatingProduct(true)
      setEditError(null)

      const formData = new FormData()
      formData.append('title', editFormData.title.trim())
      formData.append('description', editFormData.description.trim())
      formData.append('category', editFormData.category)
      formData.append('color', editFormData.color.trim())
      formData.append('priceAmount', Number(editFormData.priceAmount))
      formData.append('priceCurrency', editFormData.priceCurrency)

      // Send retained existing image URLs as a JSON string
      formData.append('existingImages', JSON.stringify(editExistingImages))

      // Append newly chosen image files under "images"
      editNewFiles.forEach((file) => {
        formData.append('images', file)
      })

      const updated = await handleUpdateProduct(productId, formData)
      if (updated) {
        setProduct((prev) => ({
          ...prev,
          ...updated,
        }))
        setActiveImageIndex(0)
      }

      // Cleanup preview URLs
      editNewPreviews.forEach((p) => {
        if (p?.url) URL.revokeObjectURL(p.url)
      })
      setEditNewFiles([])
      setEditNewPreviews([])

      setIsEditInfoModalOpen(false)
      showToast('Drop information and imagery updated successfully!')
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update drop info')
    } finally {
      setIsUpdatingProduct(false)
    }
  }

  const handleConfirmDeleteDrop = async () => {
    try {
      setIsDeletingProduct(true)
      await handleDeleteProduct(productId)
      setIsDeleteDropModalOpen(false)
      navigate('/seller/dashboard')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete drop')
      setIsDeletingProduct(false)
    }
  }

  // ── VARIANT & STOCK HANDLERS ──

  // ── DYNAMIC ATTRIBUTES & VARIANT HANDLERS ──

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

  const handleAddDynamicAttribute = (key = '', value = '') => {
    const newId = 'attr_' + Date.now() + Math.random().toString(36).substr(2, 4)
    setDynamicAttributes((prev) => [...prev, { id: newId, key, value }])
  }

  const handleRemoveDynamicAttribute = (id) => {
    setDynamicAttributes((prev) => {
      const filtered = prev.filter((a) => a.id !== id)
      if (filtered.length === 0) {
        return [{ id: 'attr_' + Date.now(), key: '', value: '' }]
      }
      return filtered
    })
  }

  const handleUpdateDynamicAttribute = (id, field, val) => {
    setDynamicAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    )
  }

  const handleApplyPreset = (presetKey, presetValue = '') => {
    setDynamicAttributes((prev) => {
      const existing = prev.find((a) => a.key.toLowerCase() === presetKey.toLowerCase())
      if (existing) {
        return prev.map((a) =>
          a.id === existing.id
            ? { ...a, value: presetValue || a.value }
            : a
        )
      }
      const newId = 'attr_' + Date.now() + Math.random().toString(36).substr(2, 4)
      return [...prev, { id: newId, key: presetKey, value: presetValue }]
    })
  }

  const handleCloneVariant = (variant) => {
    const attrs = getAttributesObject(variant.attributes)
    const entries = Object.entries(attrs)
    if (entries.length > 0) {
      setDynamicAttributes(
        entries.map(([k, v], idx) => ({
          id: `attr_clone_${idx}_${Date.now()}`,
          key: k,
          value: String(v),
        }))
      )
    } else {
      setDynamicAttributes([{ id: 'attr_1', key: 'size', value: 'M' }])
    }
    setVariantStock(variant.stock ?? 25)
    setVariantPriceAmount(variant.price?.amount || product.price?.amount || '')
    setIsCreatingVariant(true)
    showToast(`Loaded attributes from variant. Edit specifications and save!`)
  }

  const handleVariantFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setVariantImageFiles((prev) => [...prev, ...files])
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setVariantImagePreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removeVariantFile = (idx) => {
    setVariantImageFiles((prev) => prev.filter((_, i) => i !== idx))
    setVariantImagePreviews((prev) => {
      const removed = prev[idx]
      if (removed?.url) URL.revokeObjectURL(removed.url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const toggleDropImageForVariant = (url) => {
    setVariantSelectedDropImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    )
  }

  const handleCreateVariantSubmit = async (e) => {
    e.preventDefault()

    // Build attributes object from dynamicAttributes
    const attributes = {}
    dynamicAttributes.forEach((attr) => {
      const k = attr.key?.trim().toLowerCase()
      const v = attr.value?.trim()
      if (k && v) {
        attributes[k] = v
      }
    })

    if (Object.keys(attributes).length === 0) {
      showToast('Please specify at least one attribute (e.g. colour, size, storage).')
      return
    }

    setVariantActionLoading('creating')

    try {
      const formData = new FormData()
      formData.append('stock', Math.max(0, Number(variantStock) || 0))
      formData.append('attributes', JSON.stringify(attributes))
      formData.append(
        'price',
        JSON.stringify({
          amount: Number(variantPriceAmount) || product.price.amount,
          currency: product.price?.currency || 'INR',
        })
      )

      // Add selected drop image URLs
      if (variantSelectedDropImages.length > 0) {
        formData.append('images', JSON.stringify(variantSelectedDropImages))
      }

      // Add uploaded file binaries
      variantImageFiles.forEach((file) => {
        formData.append('images', file)
      })

      const updatedProduct = await handleCreateVariant(product._id, formData)
      if (updatedProduct) {
        setProduct(updatedProduct)
      } else {
        // Fallback optimistic update
        const mockNewVariant = {
          _id: 'var_' + Date.now(),
          attributes,
          stock: Math.max(0, Number(variantStock) || 0),
          price: {
            amount: Number(variantPriceAmount) || product.price.amount,
            currency: product.price?.currency || 'INR',
          },
          images: variantSelectedDropImages.map((u) => ({ url: u })),
        }
        setProduct((prev) => ({
          ...prev,
          variants: [...(prev.variants || []), mockNewVariant],
        }))
      }

      const summaryText = Object.entries(attributes)
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join(' • ')
      showToast(`Variant [${summaryText}] created successfully!`)
      setIsCreatingVariant(false)
      variantImagePreviews.forEach((p) => URL.revokeObjectURL(p.url))
      setVariantImageFiles([])
      setVariantImagePreviews([])
      setVariantSelectedDropImages([])
      // Keep keys so adding the next variant variation is fast
      setDynamicAttributes((prev) => prev.map((a) => ({ ...a, value: '' })))
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create variant.')
    } finally {
      setVariantActionLoading(null)
    }
  }

  // ── MODAL UPLOAD HANDLERS FOR EXISTING VARIANT ──
  const handleModalFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setModalUploadFiles((prev) => [...prev, ...files])
    const previews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }))
    setModalUploadPreviews((prev) => [...prev, ...previews])
    e.target.value = ''
  }

  const removeModalFile = (idx) => {
    setModalUploadFiles((prev) => prev.filter((_, i) => i !== idx))
    setModalUploadPreviews((prev) => {
      const removed = prev[idx]
      if (removed?.url) URL.revokeObjectURL(removed.url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleModalUploadSubmit = async (e) => {
    e.preventDefault()
    if (!activeImageModalVariant) return
    if (modalUploadFiles.length === 0) {
      showToast('Please select at least one photo to upload.')
      return
    }

    setModalUploadLoading(true)
    try {
      const formData = new FormData()
      modalUploadFiles.forEach((f) => formData.append('images', f))

      const updatedProduct = await handleAddVariantImages(
        product._id,
        activeImageModalVariant._id,
        formData
      )
      if (updatedProduct) {
        setProduct(updatedProduct)
      }
      showToast('Variant images uploaded successfully!')
      setActiveImageModalVariant(null)
      modalUploadPreviews.forEach((p) => URL.revokeObjectURL(p.url))
      setModalUploadFiles([])
      setModalUploadPreviews([])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload variant images.')
    } finally {
      setModalUploadLoading(false)
    }
  }

  const handleStockDelta = async (variantId, delta) => {
    const currentVariant = product?.variants?.find((v) => v._id === variantId)
    if (!currentVariant) return

    const currentStock = Number(currentVariant.stock) || 0
    const newStock = Math.max(0, currentStock + delta)

    setVariantActionLoading(variantId)
    try {
      const updatedProduct = await handleUpdateVariantStock(product._id, variantId, newStock)
      if (updatedProduct) {
        setProduct(updatedProduct)
      } else {
        // Optimistic fallback
        setProduct((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v._id === variantId ? { ...v, stock: newStock } : v
          ),
        }))
      }
      setStockInputs((prev) => ({ ...prev, [variantId]: newStock }))
      showToast(`Stock updated to ${newStock} units`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock.')
    } finally {
      setVariantActionLoading(null)
    }
  }

  const handleSaveDirectStock = async (variantId) => {
    const rawVal = stockInputs[variantId]
    const targetStock = Math.max(0, Number(rawVal) || 0)

    setVariantActionLoading(variantId)
    try {
      const updatedProduct = await handleUpdateVariantStock(product._id, variantId, targetStock)
      if (updatedProduct) {
        setProduct(updatedProduct)
      } else {
        // Optimistic fallback
        setProduct((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v._id === variantId ? { ...v, stock: targetStock } : v
          ),
        }))
      }
      setStockInputs((prev) => ({ ...prev, [variantId]: targetStock }))
      showToast(`Stock saved: ${targetStock} units`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save stock.')
    } finally {
      setVariantActionLoading(null)
    }
  }

  const handleOpenDeleteVariantModal = (variant, variantLabel) => {
    setDeleteModalVariant({
      id: variant._id,
      label: variantLabel,
      variant,
    })
  }

  const handleConfirmDeleteVariant = async () => {
    if (!deleteModalVariant) return
    const { id: variantId, label: variantLabel } = deleteModalVariant

    setVariantActionLoading(variantId)
    try {
      const updatedProduct = await handleDeleteVariant(product._id, variantId)
      if (updatedProduct) {
        setProduct(updatedProduct)
      } else {
        // Optimistic fallback
        setProduct((prev) => ({
          ...prev,
          variants: prev.variants.filter((v) => v._id !== variantId),
        }))
      }
      showToast(`Variant "${variantLabel}" removed from catalogue`)
      setDeleteModalVariant(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete variant.')
    } finally {
      setVariantActionLoading(null)
    }
  }

  // Format variant attributes (e.g. SIZE: M • COLOR: BLACK • STORAGE: 256GB)
  const formatVariantAttributes = (attributes) => {
    const obj = getAttributesObject(attributes)
    const entries = Object.entries(obj)
    if (entries.length === 0) return 'Standard Variant'
    return entries.map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' • ')
  }

  const getVariantPrimaryBadge = (variant, index = 0) => {
    const attrs = getAttributesObject(variant?.attributes)
    if (attrs.size) return String(attrs.size).slice(0, 3).toUpperCase()
    if (attrs.storage) return String(attrs.storage).slice(0, 4).toUpperCase()
    if (attrs.color) return String(attrs.color).slice(0, 3).toUpperCase()
    const firstVal = Object.values(attrs)[0]
    if (firstVal) return String(firstVal).slice(0, 3).toUpperCase()
    return `#${index + 1}`
  }

  // Financial calculations
  const priceAmount = Number(product?.price?.amount || 0)
  const currencySymbol = CURRENCY_SYMBOLS[product?.price?.currency] || '₹'
  const estPlatformFee = Math.round(priceAmount * 0.1) // 10% marketplace fee
  const estNetPayout = priceAmount - estPlatformFee

  // Variants metrics
  const variants = product?.variants || []
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
  const lowStockCount = variants.filter((v) => Number(v.stock) > 0 && Number(v.stock) <= 10).length
  const outOfStockCount = variants.filter((v) => Number(v.stock) === 0).length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black relative">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-yellow-400 text-zinc-950 px-4 py-2 text-center text-[11px] font-black tracking-[0.25em] uppercase select-none relative z-10">
        <span>Snitch Seller Studio • Catalogue Management</span>
      </div>

      {/* ── TOP NAVIGATION BAR (STICKY WITH FROSTED GLASS EFFECT) ── */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Studio Badge */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/Logo.png" alt="Snitch" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
              <span className="text-white font-bold text-xl tracking-[0.2em] uppercase">
                Snitch
              </span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <Link
              to="/seller/dashboard"
              className="hidden sm:flex items-center gap-2 group transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-zinc-400 group-hover:text-white text-[10px] tracking-[0.25em] uppercase font-medium">
                Seller Studio
              </span>
            </Link>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-4">
            <Link
              to="/seller/dashboard"
              className="text-zinc-400 hover:text-white text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-colors px-3 py-2 border border-zinc-800/80 hover:border-zinc-700 rounded-sm bg-zinc-900/40"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {user?.fullname && (
              <span className="text-zinc-500 text-xs hidden md:inline tracking-wider">
                Logged in as <span className="text-zinc-300 font-medium">{user.fullname}</span>
              </span>
            )}

            <Link
              to="/seller/create-product"
              className="group bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-4 sm:px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase transition-all duration-200 rounded-sm flex items-center gap-2 shadow-sm"
            >
              <span className="text-sm leading-none font-bold">+</span>
              <span className="hidden sm:inline">New Product</span>
            </Link>

            {/* Functional Log out button */}
            <button
              type="button"
              onClick={handleUserLogout}
              className="border border-zinc-800 hover:border-red-500/40 bg-zinc-900/60 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 font-semibold px-3 py-2.5 text-[11px] tracking-[0.15em] uppercase transition-all duration-200 rounded-sm flex items-center gap-2 cursor-pointer"
              title="Log out"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BREADCRUMB & CONTEXT TOOLBAR ── */}
      <div className="border-b border-zinc-900/80 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-zinc-500 tracking-wider">
            <Link to="/seller/dashboard" className="hover:text-yellow-400 transition-colors uppercase text-[10px]">
              Seller Studio
            </Link>
            <span>/</span>
            <Link to="/seller/dashboard" className="hover:text-yellow-400 transition-colors uppercase text-[10px]">
              Products
            </Link>
            <span>/</span>
            <span className="text-zinc-300 font-medium uppercase text-[10px] truncate max-w-[200px] sm:max-w-xs">
              {product ? product.title : 'Details'}
            </span>
          </div>

          {/* Quick Actions in Bar */}
          {product && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live in Snitch Store
              </span>

              <a
                href="#variants-inventory-section"
                className="text-zinc-400 hover:text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm border border-zinc-800 bg-zinc-900/40 transition-colors"
              >
                {variants.length} Variants ({totalStock} Stock) ↓
              </a>

              <Link
                to={`/product/${product._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 underline underline-offset-4 decoration-yellow-400/40 hover:decoration-yellow-300"
              >
                <span>Buyer View</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING TOAST NOTIFICATION ── */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-zinc-950 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>{copyToast}</span>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
        {/* ── STATE 1: LOADING SKELETON ── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 animate-pulse">
            {/* Gallery Skeleton */}
            <div className="lg:col-span-7 flex flex-row gap-3 sm:gap-4 items-start">
              <div className="w-14 sm:w-20 md:w-22 flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full aspect-[4/5] bg-zinc-900/60 rounded-sm border border-zinc-800 shrink-0" style={{ aspectRatio: '4 / 5' }} />
                ))}
              </div>
              <div className="flex-1 aspect-[4/5] bg-zinc-900/60 rounded-sm border border-zinc-800" style={{ aspectRatio: '4 / 5' }} />
            </div>

            {/* Info Skeleton */}
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-32 bg-zinc-900 rounded-sm" />
              <div className="h-10 w-3/4 bg-zinc-900 rounded-sm" />
              <div className="h-8 w-40 bg-zinc-900 rounded-sm" />
              <div className="h-28 w-full bg-zinc-900/60 rounded-sm" />
              <div className="h-20 w-full bg-zinc-900 rounded-sm" />
              <div className="h-32 w-full bg-zinc-900 rounded-sm" />
            </div>
          </div>
        )}

        {/* ── STATE 2: ERROR / NOT FOUND ── */}
        {!loading && error && (
          <div className="border border-zinc-800 bg-zinc-950/40 rounded-sm p-12 sm:p-20 text-center max-w-xl mx-auto my-12 shadow-xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-2">Item Unavailable</h2>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-8">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/seller/dashboard"
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold px-6 py-3.5 text-xs uppercase tracking-wider rounded-sm transition-all"
              >
                Back To Dashboard
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
          <>
            {/* ── UPPER SECTION: PRODUCT GALLERY & COMMERCIAL SPECS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
              {/* ── LEFT COLUMN: EDITORIAL GALLERY (7 Cols) ── */}
              <div className="lg:col-span-7 flex flex-row gap-3 sm:gap-4 items-start">
                {/* Vertical Multi-Image Thumbnails Rail (Left Side) */}
                {product.images?.length > 0 && (
                  <div className="w-14 sm:w-20 md:w-22 shrink-0 flex flex-col items-center gap-2 select-none">
                    {/* Up / Previous Photo Button - Only when multiple images */}
                    {product.images.length > 1 && (
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
                    )}

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
                    {product.images.length > 1 && (
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
                    )}
                  </div>
                )}

                {/* Main Image Frame (Fashion 4:5 Aspect Ratio) */}
                <div
                  className="relative flex-1 min-w-0 aspect-[4/5] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-900 select-none group"
                  style={{ aspectRatio: '4 / 5' }}
                >
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
                      Seller Verified Asset
                    </span>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: COMMERCIAL SPECS & SELLER CONTROLS (5 Cols) ── */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  {/* Release Category & Status */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">
                      Seller Studio Catalogue
                    </span>
                    <span className="text-zinc-500 text-[10px] tracking-wider uppercase">
                      Drop #{product._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Garment Title */}
                  <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
                    {product.title}
                  </h1>

                  {/* Product ID Pill with Copy */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-zinc-500 text-xs font-mono">
                      ID: {product._id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(product._id, 'Product ID')}
                      className="text-zinc-500 hover:text-yellow-400 transition-colors cursor-pointer"
                      title="Copy full product ID"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                      </svg>
                    </button>
                  </div>

                  {/* Price Display */}
                  <div className="mt-5 pb-5 border-b border-zinc-900">
                    <div className="flex items-baseline gap-3">
                      <span className="text-yellow-400 text-4xl sm:text-5xl font-black tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-zinc-500 text-xs tracking-wider uppercase font-semibold">
                        {product.price?.currency || 'INR'}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1.5">
                      Customer retail price inclusive of all applicable taxes
                    </p>
                  </div>

                  {/* ── FINANCIAL & PAYOUT ESTIMATE CARD ── */}
                  <div className="mt-6 bg-zinc-950/60 border border-zinc-900 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-zinc-400 text-[10px] tracking-[0.25em] uppercase font-bold">
                        Payout Economics (Per Unit)
                      </span>
                      <span className="text-emerald-400 text-[10px] tracking-wider uppercase font-semibold">
                        Standard Tier
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Listing Gross Price</span>
                        <span className="text-white font-mono">{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Marketplace & Fulfillment Fee (10%)</span>
                        <span className="text-red-400/80 font-mono">
                          -{currencySymbol}{estPlatformFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-sm font-bold">
                        <span className="text-white">Est. Net Payout Per Order</span>
                        <span className="text-yellow-400 font-mono">
                          {currencySymbol}{estNetPayout.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── LISTING METRICS GRID ── */}
                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-950/40 border border-zinc-900 p-3.5 rounded-sm">
                      <span className="text-zinc-500 text-[9px] tracking-widest uppercase block mb-1">
                        Total Inventory
                      </span>
                      <p className="text-white font-bold text-base">
                        {totalStock} <span className="text-xs font-normal text-zinc-400">units</span>
                      </p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">
                        Across {variants.length} variant{variants.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="bg-zinc-950/40 border border-zinc-900 p-3.5 rounded-sm">
                      <span className="text-zinc-500 text-[9px] tracking-widest uppercase block mb-1">
                        Media Gallery
                      </span>
                      <p className="text-white font-semibold">
                        {product.images?.length || 0} Assets Uploaded
                      </p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">
                        4:5 Fashion Editorial
                      </p>
                    </div>
                  </div>

                  {/* ── ACTION BUTTONS ── */}
                  <div className="mt-6 space-y-3">
                    {/* Primary CTA: View Public Customer Page */}
                    <Link
                      to={`/product/${product._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-zinc-950 font-black py-4 px-6 text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Preview Snitch Store Listing</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </Link>

                    {/* Secondary Buttons Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${window.location.origin}/product/${product._id}`,
                            'Product share link'
                          )
                        }
                        className="w-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold py-3.5 px-4 text-xs uppercase tracking-[0.15em] rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                        <span>Share Link</span>
                      </button>

                      {/* Functional Edit Info Button */}
                      <button
                        type="button"
                        onClick={handleOpenEditModal}
                        className="w-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold py-3.5 px-4 text-xs uppercase tracking-[0.15em] rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        <span>Edit Info</span>
                      </button>
                    </div>

                    {/* Functional Delete Drop Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsDeleteDropModalOpen(true)}
                        className="w-full border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 font-semibold py-2.5 px-4 text-[11px] uppercase tracking-[0.15em] rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span>Delete Drop</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Description Section */}
                <div className="border-t border-zinc-900 pt-6">
                  <span className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase font-bold block mb-3">
                    Description
                  </span>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {product.description || 'No detailed description provided for this garment drop.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: PRODUCT VARIANTS & INVENTORY MANAGEMENT (SAME FILE) ── */}
            <section
              id="variants-inventory-section"
              className="mt-16 pt-12 border-t border-zinc-900"
            >
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                      Inventory & SKU Management
                    </span>
                  </div>
                  <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight uppercase">
                    Product Variants & Stock Control
                  </h2>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    Create size and color variations, set custom pricing, and manage real-time inventory counts for this garment.
                  </p>
                </div>

                {/* Header Metrics & CTA */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-zinc-950/60 border border-zinc-900 px-4 py-2 rounded-sm text-xs">
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                      Total Variants
                    </span>
                    <span className="text-white font-bold text-sm">
                      {variants.length}
                    </span>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-900 px-4 py-2 rounded-sm text-xs">
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                      Available Units
                    </span>
                    <span className={`font-bold text-sm ${totalStock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalStock}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingVariant((prev) => !prev)}
                    className="bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black px-5 py-3 text-xs uppercase tracking-[0.15em] rounded-sm transition-all flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span className="text-base leading-none font-bold">
                      {isCreatingVariant ? '✕' : '+'}
                    </span>
                    <span>{isCreatingVariant ? 'Close Form' : 'Add Variant'}</span>
                  </button>
                </div>
              </div>

              {/* ── CREATE VARIANT COLLAPSIBLE FORM ── */}
              {isCreatingVariant && (
                <div className="mb-10 bg-zinc-950/80 border border-yellow-400/30 rounded-sm p-6 sm:p-8 relative shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900">
                    <div>
                      <h3 className="text-white text-lg font-black uppercase tracking-tight">
                        Create New Garment Variant
                      </h3>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Add a size or color variation with its initial stock and optional price override.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingVariant(false)}
                      className="text-zinc-500 hover:text-white text-xs uppercase tracking-wider p-2"
                    >
                      Cancel ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateVariantSubmit} className="space-y-6">
                    {/* 1. Dynamic Attributes Specification Section */}
                    <div className="lg:col-span-4 bg-zinc-950/60 border border-zinc-900 rounded-sm p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-900">
                        <div>
                          <label className="block text-zinc-300 text-xs tracking-[0.2em] uppercase font-black">
                            Dynamic Variant Attributes *
                          </label>
                          <span className="text-[11px] text-zinc-500 block mt-0.5">
                            Create customizable specifications (e.g. Size, Colour, Storage, RAM, Material).
                          </span>
                        </div>

                        {/* Quick Presets / Templates Toolbar */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold mr-1">
                            Quick Add:
                          </span>
                          {ATTRIBUTE_PRESETS.map((preset) => (
                            <button
                              key={preset.key}
                              type="button"
                              onClick={() => handleApplyPreset(preset.key, '')}
                              className="text-[9px] px-2 py-1 rounded-sm border border-zinc-800 hover:border-yellow-400/60 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-yellow-400 uppercase font-semibold transition-colors cursor-pointer"
                            >
                              + {preset.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddDynamicAttribute('', '')}
                            className="text-[9px] px-2 py-1 rounded-sm border border-dashed border-zinc-700 hover:border-white bg-zinc-900/40 text-zinc-300 hover:text-white uppercase font-bold transition-colors cursor-pointer"
                          >
                            + Custom
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Attribute Rows List */}
                      <div className="space-y-3.5">
                        {dynamicAttributes.map((attr, idx) => {
                          const matchedPreset = ATTRIBUTE_PRESETS.find(
                            (p) => p.key.toLowerCase() === (attr.key || '').trim().toLowerCase()
                          )

                          return (
                            <div
                              key={attr.id || idx}
                              className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-sm hover:border-zinc-700 transition-colors"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                {/* Attribute Name / Key */}
                                <div className="sm:col-span-5">
                                  <label className="block text-zinc-500 text-[9px] uppercase tracking-widest font-bold mb-1">
                                    Attribute Name
                                  </label>
                                  <input
                                    type="text"
                                    value={attr.key}
                                    onChange={(e) =>
                                      handleUpdateDynamicAttribute(attr.id, 'key', e.target.value)
                                    }
                                    placeholder="e.g. storage, colour, size, ram"
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 px-3 py-2 text-white text-xs uppercase tracking-wider rounded-sm focus:outline-none transition-colors"
                                  />
                                </div>

                                {/* Attribute Value */}
                                <div className="sm:col-span-6">
                                  <label className="block text-zinc-500 text-[9px] uppercase tracking-widest font-bold mb-1">
                                    Attribute Value
                                  </label>
                                  <input
                                    type="text"
                                    value={attr.value}
                                    onChange={(e) =>
                                      handleUpdateDynamicAttribute(attr.id, 'value', e.target.value)
                                    }
                                    placeholder="e.g. 256GB, Onyx Black, XL"
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 px-3 py-2 text-white text-xs uppercase tracking-wider rounded-sm focus:outline-none transition-colors"
                                  />
                                </div>

                                {/* Remove Row Button */}
                                <div className="sm:col-span-1 flex items-end sm:justify-center pt-2 sm:pt-0">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDynamicAttribute(attr.id)}
                                    className="w-8 h-8 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-red-500/50 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Remove this attribute"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              {/* Suggestion Chips (if matching preset) */}
                              {matchedPreset && (
                                <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-zinc-900/60">
                                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">
                                    Suggestions:
                                  </span>
                                  {matchedPreset.suggestions.map((sug) => (
                                    <button
                                      key={sug}
                                      type="button"
                                      onClick={() => handleUpdateDynamicAttribute(attr.id, 'value', sug)}
                                      className={`text-[9px] px-2 py-0.5 rounded-sm border uppercase transition-colors cursor-pointer ${
                                        attr.value === sug
                                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-bold'
                                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                      }`}
                                    >
                                      {sug}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Add Attribute Button + Live Specification Preview */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => handleAddDynamicAttribute('', '')}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-yellow-400 hover:text-yellow-300 py-1 cursor-pointer"
                        >
                          <span>+ Add Another Attribute</span>
                        </button>

                        {/* Live Preview Pill */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                            Live Preview:
                          </span>
                          {dynamicAttributes.filter((a) => a.key?.trim() && a.value?.trim()).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {dynamicAttributes
                                .filter((a) => a.key?.trim() && a.value?.trim())
                                .map((a, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-2 py-0.5 rounded-sm bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold uppercase tracking-wider"
                                  >
                                    {a.key}: {a.value}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-xs italic">
                              Add attributes above
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2 & 3: Initial Stock & Variant Price Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Initial Stock */}
                      <div>
                        <label className="block text-zinc-400 text-[10px] tracking-[0.2em] uppercase font-bold mb-2">
                          Initial Stock Units *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          min="0"
                          value={variantStock}
                          onChange={(e) => setVariantStock(e.target.value)}
                          placeholder="e.g. 50"
                          className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-yellow-400 px-3.5 py-2.5 text-white font-mono text-xs rounded-sm focus:outline-none transition-colors"
                          required
                        />
                        {/* Quick Stock Presets */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {[10, 25, 50, 100].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setVariantStock(preset)}
                              className={`text-[9px] px-2 py-0.5 rounded-sm border transition-colors cursor-pointer ${
                                Number(variantStock) === preset
                                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-bold'
                                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              +{preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Variant Price Amount */}
                      <div>
                        <label className="block text-zinc-400 text-[10px] tracking-[0.2em] uppercase font-bold mb-2">
                          Variant Price ({currencySymbol})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            name="priceAmount"
                            min="0"
                            value={variantPriceAmount}
                            onChange={(e) => setVariantPriceAmount(e.target.value)}
                            placeholder={product.price?.amount || 'Base price'}
                            className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-yellow-400 pl-8 pr-3.5 py-2.5 text-white font-mono text-xs rounded-sm focus:outline-none transition-colors"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-600 block mt-1.5">
                          Leave blank to use default drop price ({formatPrice(product.price)})
                        </span>
                      </div>
                    </div>

                    {/* 4. Variant Images / Photos */}
                    <div className="pt-4 border-t border-zinc-900">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="block text-zinc-300 text-xs tracking-[0.15em] uppercase font-black">
                              Variant Images & Photos (Optional)
                            </label>
                            <span className="text-[11px] text-zinc-500 block mt-0.5">
                              Upload photos specific to this size/color variant or link existing drop photos
                            </span>
                          </div>
                          <span className="text-zinc-500 text-[10px] font-mono">
                            {variantImageFiles.length + variantSelectedDropImages.length} selected
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Upload New Files */}
                          <div className="border border-dashed border-zinc-800 hover:border-yellow-400/50 rounded-sm p-4 bg-zinc-900/30 transition-colors">
                            <input
                              type="file"
                              id="variantFileInput"
                              multiple
                              accept="image/*"
                              onChange={handleVariantFileChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="variantFileInput"
                              className="flex flex-col items-center justify-center cursor-pointer text-center py-2.5"
                            >
                              <svg className="w-6 h-6 text-yellow-400 mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                Upload Variant Photos
                              </span>
                              <span className="text-[10px] text-zinc-500 mt-0.5">
                                Select PNG, JPG, or WEBP
                              </span>
                            </label>
                          </div>

                          {/* Reuse Existing Drop Photos */}
                          {product.images?.length > 0 && (
                            <div className="border border-zinc-800 rounded-sm p-3.5 bg-zinc-900/30">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                Or Link From Drop Photos:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {product.images.map((img, i) => {
                                  const url = typeof img === 'string' ? img : img.url
                                  const isSelected = variantSelectedDropImages.includes(url)
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => toggleDropImageForVariant(url)}
                                      className={`relative w-12 h-14 rounded-sm overflow-hidden border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'border-yellow-400 ring-2 ring-yellow-400/60 opacity-100 scale-105'
                                          : 'border-zinc-800 opacity-50 hover:opacity-100'
                                      }`}
                                    >
                                      <img src={url} alt={`Drop photo ${i + 1}`} className="w-full h-full object-cover object-top" />
                                      {isSelected && (
                                        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-yellow-400 text-zinc-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-sm">
                                          ✓
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Previews of all attached photos for this new variant */}
                        {(variantImagePreviews.length > 0 || variantSelectedDropImages.length > 0) && (
                          <div className="mt-3.5 pt-3 border-t border-zinc-900">
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-yellow-400 mb-2">
                              Attached Photos ({variantImagePreviews.length + variantSelectedDropImages.length}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {/* Uploaded Files Previews */}
                              {variantImagePreviews.map((prev, idx) => (
                                <div key={`file-${idx}`} className="relative group w-14 h-16 rounded-sm overflow-hidden border border-yellow-400/50">
                                  <img src={prev.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover object-top" />
                                  <button
                                    type="button"
                                    onClick={() => removeVariantFile(idx)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                    title="Remove image"
                                  >
                                    ✕
                                  </button>
                                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-zinc-300 text-center font-mono py-0.5">
                                    NEW
                                  </span>
                                </div>
                              ))}

                              {/* Selected Drop Images Previews */}
                              {variantSelectedDropImages.map((url, idx) => (
                                <div key={`drop-${idx}`} className="relative group w-14 h-16 rounded-sm overflow-hidden border border-zinc-700">
                                  <img src={url} alt={`Drop selected ${idx + 1}`} className="w-full h-full object-cover object-top" />
                                  <button
                                    type="button"
                                    onClick={() => toggleDropImageForVariant(url)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                    title="Remove image"
                                  >
                                    ✕
                                  </button>
                                  <span className="absolute bottom-0 inset-x-0 bg-yellow-400/90 text-zinc-950 font-black text-[8px] text-center uppercase py-0.5">
                                    DROP
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                      <button
                        type="button"
                        onClick={() => setIsCreatingVariant(false)}
                        className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-white text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={variantActionLoading === 'creating'}
                        className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-6 py-2.5 text-xs uppercase tracking-[0.15em] rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {variantActionLoading === 'creating' ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            <span>Adding Variant...</span>
                          </>
                        ) : (
                          <span>Save & Publish Variant</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── VARIANTS LIST & INVENTORY MATRIX ── */}
              {variants.length === 0 ? (
                /* Empty Variants State */
                <div className="border border-dashed border-zinc-800 rounded-sm p-12 text-center bg-zinc-950/20">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600">
                    <svg className="w-6 h-6 text-yellow-400/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386a30.434 30.434 0 0 0 6.134-5.321c.54-.622.44-1.57-.143-2.153L12.257 4.072A2.25 2.25 0 0 0 10.665 3.42z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <h4 className="text-white text-base font-bold tracking-tight mb-1">
                    No Variants Configured
                  </h4>
                  <p className="text-zinc-500 text-xs max-w-md mx-auto mb-6 leading-relaxed">
                    This drop is currently sold as a single default product. Add size variations (S, M, L, XL) or colors to track inventory per variant.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingVariant(true)}
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black px-5 py-3 text-xs uppercase tracking-[0.15em] rounded-sm transition-all"
                  >
                    <span>+ Add Your First Variant</span>
                  </button>
                </div>
              ) : (
                /* Variants Data Cards / Table */
                <div className="space-y-3">
                  {/* Table Header Row (Desktop) */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-950/60 border border-zinc-900 rounded-sm text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                    <div className="col-span-3">Variant Specification</div>
                    <div className="col-span-2">Variant Photos</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Stock Level</div>
                    <div className="col-span-2 text-center">Manage Stock</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>

                  {/* Variant Rows */}
                  {variants.map((v, idx) => {
                    const isRowBusy = variantActionLoading === v._id
                    const currentStock = Number(v.stock) || 0
                    const inputVal = stockInputs[v._id] ?? currentStock
                    const hasUnsavedInput = Number(inputVal) !== currentStock
                    const variantLabel = formatVariantAttributes(v.attributes)

                    return (
                      <div
                        key={v._id || idx}
                        className="bg-zinc-950/40 hover:bg-zinc-950/70 border border-zinc-900 hover:border-zinc-800 rounded-sm p-4 lg:p-5 transition-all"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* 1. Variant Attributes Pill */}
                          <div className="lg:col-span-3 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 text-yellow-400 font-black text-xs flex items-center justify-center shrink-0 uppercase">
                              {getVariantPrimaryBadge(v, idx)}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-white font-bold text-sm tracking-wide uppercase truncate">
                                {variantLabel}
                              </h4>
                              {/* Dynamic Attribute Tag Badges */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(getAttributesObject(v.attributes)).map(([key, val]) => {
                                  const isStorage = key.toLowerCase() === 'storage'
                                  const isSize = key.toLowerCase() === 'size'
                                  const isColor = key.toLowerCase() === 'color'
                                  return (
                                    <span
                                      key={key}
                                      className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-sm border uppercase font-medium ${
                                        isStorage
                                          ? 'bg-blue-950/40 border-blue-800/60 text-blue-400'
                                          : isSize
                                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-400'
                                          : isColor
                                          ? 'bg-purple-950/40 border-purple-800/60 text-purple-400'
                                          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                                      }`}
                                    >
                                      <span className="text-zinc-500 font-mono text-[8px]">{key}:</span>
                                      <span className="font-bold">{String(val)}</span>
                                    </span>
                                  )
                                })}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(v._id, 'Variant ID')}
                                className="text-zinc-500 hover:text-yellow-400 text-[10px] font-mono transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                                title="Click to copy variant ID"
                              >
                                <span>#{v._id ? v._id.slice(-6).toUpperCase() : `V-${idx + 1}`}</span>
                                <svg className="w-2.5 h-2.5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* 2. Variant Photos */}
                          <div className="lg:col-span-2 flex items-center gap-1.5">
                            {v.images && v.images.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                {v.images.slice(0, 2).map((img, i) => {
                                  const url = typeof img === 'string' ? img : img.url
                                  return (
                                    <img
                                      key={i}
                                      src={url}
                                      alt="Variant photo"
                                      className="w-8 h-10 object-cover object-top rounded-sm border border-zinc-800"
                                    />
                                  )
                                })}
                                {v.images.length > 2 && (
                                  <span className="text-[10px] text-zinc-500 font-mono font-bold">
                                    +{v.images.length - 2}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveImageModalVariant(v)
                                    setModalUploadFiles([])
                                    setModalUploadPreviews([])
                                  }}
                                  className="text-[10px] text-zinc-400 hover:text-yellow-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-1.5 py-1 rounded-sm transition-colors cursor-pointer"
                                  title="Add / Upload more photos"
                                >
                                  +📷
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveImageModalVariant(v)
                                  setModalUploadFiles([])
                                  setModalUploadPreviews([])
                                }}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-sm border border-dashed border-zinc-800 hover:border-yellow-400/60 bg-zinc-900/40 text-zinc-400 hover:text-yellow-400 uppercase tracking-wider transition-colors cursor-pointer"
                                title="Upload photos for this variant"
                              >
                                <span>+ Add Photos</span>
                              </button>
                            )}
                          </div>

                          {/* 3. Price */}
                          <div className="lg:col-span-2 text-sm font-bold text-white tracking-tight">
                            {formatPrice(v.price || product.price)}
                          </div>

                          {/* 4. Stock Level Indicator */}
                          <div className="lg:col-span-2 flex items-center gap-2">
                            {currentStock > 10 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {currentStock} in stock
                              </span>
                            ) : currentStock > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold tracking-wider uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                Low ({currentStock} left)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wider uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Out of stock
                              </span>
                            )}
                          </div>

                          {/* 5. Interactive Stock Management Controls */}
                          <div className="lg:col-span-2 flex items-center justify-start lg:justify-center gap-2">
                            {/* Decrement Button */}
                            <button
                              type="button"
                              disabled={isRowBusy || currentStock <= 0}
                              onClick={() => handleStockDelta(v._id, -1)}
                              className="w-8 h-8 rounded-sm border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm"
                              title="Decrease stock by 1"
                            >
                              −
                            </button>

                            {/* Direct Numeric Input */}
                            <div className="relative w-16">
                              <input
                                type="number"
                                min="0"
                                value={inputVal}
                                onChange={(e) =>
                                  setStockInputs((prev) => ({
                                    ...prev,
                                    [v._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveDirectStock(v._id)
                                  }
                                }}
                                className="w-full h-8 text-center bg-zinc-900 border border-zinc-800 focus:border-yellow-400 text-white font-mono text-xs rounded-sm focus:outline-none transition-colors"
                              />
                            </div>

                            {/* Increment Button */}
                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleStockDelta(v._id, 1)}
                              className="w-8 h-8 rounded-sm border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 font-bold text-sm"
                              title="Increase stock by 1"
                            >
                              +
                            </button>

                            {/* Save Button (when direct input modified) */}
                            {hasUnsavedInput && (
                              <button
                                type="button"
                                disabled={isRowBusy}
                                onClick={() => handleSaveDirectStock(v._id)}
                                className="h-8 px-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-[10px] uppercase rounded-sm transition-all cursor-pointer shadow-sm animate-pulse"
                                title="Save stock changes"
                              >
                                Save
                              </button>
                            )}

                            {/* Quick Restock Buttons */}
                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleStockDelta(v._id, 10)}
                              className="hidden sm:inline-flex h-8 px-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-[9px] text-zinc-400 hover:text-yellow-400 items-center rounded-sm transition-colors cursor-pointer"
                              title="Quick restock +10 units"
                            >
                              +10
                            </button>
                          </div>

                          {/* 6. Clone & Delete Actions */}
                          <div className="lg:col-span-1 flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleCloneVariant(v)}
                              className="text-zinc-600 hover:text-yellow-400 p-2 transition-colors cursor-pointer disabled:opacity-30"
                              title={`Clone ${variantLabel} attributes to create new variation`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleOpenDeleteVariantModal(v, variantLabel)}
                              className="text-zinc-600 hover:text-red-400 p-2 transition-colors cursor-pointer disabled:opacity-30"
                              title={`Delete ${variantLabel}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-10 px-4 sm:px-6 lg:px-12 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/Logo.png" alt="Snitch" className="w-6 h-6 object-contain" />
              <span className="text-white font-black text-base tracking-[0.2em] uppercase">Snitch</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
              Curated luxury streetwear & high fashion garments for the modern wardrobe.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs tracking-wider uppercase text-zinc-400">
            <Link to="/seller/dashboard" className="hover:text-yellow-400 transition-colors">Seller Dashboard</Link>
            <Link to="/seller/create-product" className="hover:text-yellow-400 transition-colors">New Drop</Link>
            <Link to="/" className="hover:text-yellow-400 transition-colors">Snitch Store</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600 tracking-wider">
          <p>© {new Date().getFullYear()} Snitch Seller Studio. All rights reserved.</p>
          <p className="uppercase tracking-widest text-zinc-500">Wear What You Are</p>
        </div>
      </footer>

      {/* ── MODAL: UPLOAD IMAGES TO EXISTING VARIANT ── */}
      {activeImageModalVariant && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => !modalUploadLoading && setActiveImageModalVariant(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-lg w-full p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!modalUploadLoading && (
              <button
                type="button"
                onClick={() => setActiveImageModalVariant(null)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white text-base w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                Variant Media Manager
              </span>
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-tight">
              Upload Photos for Variant
            </h3>
            <p className="text-zinc-400 text-xs mt-1 mb-5">
              Target: <span className="text-white font-bold">{formatVariantAttributes(activeImageModalVariant.attributes)}</span>
            </p>

            {/* Current Photos if any */}
            {activeImageModalVariant.images?.length > 0 && (
              <div className="mb-5 p-3 bg-zinc-950/60 rounded-sm border border-zinc-900">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Existing Variant Photos ({activeImageModalVariant.images.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeImageModalVariant.images.map((img, i) => {
                    const url = typeof img === 'string' ? img : img.url
                    return (
                      <img
                        key={i}
                        src={url}
                        alt="Current photo"
                        className="w-12 h-14 object-cover object-top rounded-sm border border-zinc-800"
                      />
                    )
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleModalUploadSubmit} className="space-y-4">
              <div className="border border-dashed border-zinc-800 hover:border-yellow-400/50 rounded-sm p-4 bg-zinc-900/30 transition-colors">
                <input
                  type="file"
                  id="modalFileInput"
                  multiple
                  accept="image/*"
                  onChange={handleModalFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="modalFileInput"
                  className="flex flex-col items-center justify-center cursor-pointer text-center py-3"
                >
                  <svg className="w-6 h-6 text-yellow-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Choose New Photos To Upload
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1">
                    Select PNG, JPG, or WEBP files
                  </span>
                </label>
              </div>

              {/* Previews of newly selected files */}
              {modalUploadPreviews.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block mb-2">
                    Photos Ready to Upload ({modalUploadPreviews.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {modalUploadPreviews.map((p, idx) => (
                      <div key={idx} className="relative group w-14 h-16 rounded-sm overflow-hidden border border-yellow-400/50">
                        <img src={p.url} alt="Upload preview" className="w-full h-full object-cover object-top" />
                        <button
                          type="button"
                          onClick={() => removeModalFile(idx)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  disabled={modalUploadLoading}
                  onClick={() => setActiveImageModalVariant(null)}
                  className="flex-1 py-3 px-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-300 text-xs tracking-wider uppercase font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalUploadLoading || modalUploadFiles.length === 0}
                  className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 text-xs tracking-wider uppercase font-bold rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {modalUploadLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading to ImageKit...</span>
                    </>
                  ) : (
                    <span>Upload & Save Photos</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE VARIANT CONFIRMATION MODAL ── */}
      {deleteModalVariant && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => !variantActionLoading && setDeleteModalVariant(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-red-500/30 rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top red accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            {/* Close Button */}
            {!variantActionLoading && (
              <button
                type="button"
                onClick={() => setDeleteModalVariant(null)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Cancel"
              >
                ✕
              </button>
            )}

            {/* Header Icon + Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-[10px] tracking-[0.25em] uppercase font-bold">
                    Variant Inventory
                  </span>
                </div>
                <h3 className="text-white text-xl font-black tracking-tight uppercase">
                  Delete Variant?
                </h3>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed mb-5">
              Are you sure you want to permanently delete this variant? This item will be removed from your active drop and customers won't be able to purchase it.
            </p>

            {/* Variant Summary Card */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-sm p-4 mb-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Variant Details</span>
                <span className="text-white font-bold tracking-wider text-xs">
                  {deleteModalVariant.label}
                </span>
              </div>
              <div className="h-px bg-zinc-900" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Stock Level</span>
                <span className={`font-mono text-xs font-bold ${
                  (deleteModalVariant.variant?.stock || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {deleteModalVariant.variant?.stock || 0} units
                </span>
              </div>
              {deleteModalVariant.variant?.price?.amount && (
                <>
                  <div className="h-px bg-zinc-900" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Unit Price</span>
                    <span className="text-zinc-300 font-mono text-xs">
                      {formatPrice(deleteModalVariant.variant.price)}
                    </span>
                  </div>
                </>
              )}
              {deleteModalVariant.variant?.images?.length > 0 && (
                <>
                  <div className="h-px bg-zinc-900" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Attached Images</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {deleteModalVariant.variant.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={typeof img === 'string' ? img : img.url}
                            alt=""
                            className="inline-block w-5 h-5 rounded-full object-cover border border-zinc-800"
                          />
                        ))}
                      </div>
                      <span className="text-yellow-400 text-[11px] font-bold">
                        {deleteModalVariant.variant.images.length} {deleteModalVariant.variant.images.length === 1 ? 'photo' : 'photos'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={variantActionLoading === deleteModalVariant.id}
                onClick={() => setDeleteModalVariant(null)}
                className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400 hover:text-white py-3 text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer font-bold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={variantActionLoading === deleteModalVariant.id}
                onClick={handleConfirmDeleteVariant}
                className="flex-1 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black py-3 text-xs tracking-[0.15em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 disabled:opacity-50"
              >
                {variantActionLoading === deleteModalVariant.id ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Variant</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT DROP INFO & IMAGES MODAL ── */}
      {isEditInfoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => !isUpdatingProduct && handleCloseEditModal()}
        >
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600" />

            {/* Close Button */}
            {!isUpdatingProduct && (
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer z-10"
                title="Cancel"
              >
                ✕
              </button>
            )}

            {/* Header Icon + Title */}
            <div className="flex items-center gap-3.5 mb-5 shrink-0">
              <div className="w-11 h-11 rounded-sm bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400 text-[10px] tracking-[0.25em] uppercase font-bold">
                    Seller Studio
                  </span>
                </div>
                <h3 className="text-white text-xl font-black tracking-tight uppercase">
                  Edit Drop Information & Images
                </h3>
              </div>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 text-red-400 text-xs rounded-sm shrink-0">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEditProduct} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Drop Title */}
              <div>
                <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                  Drop Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g. Heavyweight Boxy Flannel Shirt"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors uppercase font-medium"
                />
              </div>

              {/* Category & Base Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 transition-colors uppercase font-bold cursor-pointer"
                  >
                    <option value="TSHIRTS">TSHIRTS</option>
                    <option value="SHIRTS">SHIRTS</option>
                    <option value="JEANS">JEANS</option>
                    <option value="HOODIES">HOODIES</option>
                    <option value="OVERSIZED">OVERSIZED</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                    Garment Base Color
                  </label>
                  <input
                    type="text"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    placeholder="e.g. Onyx Black"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors capitalize font-medium"
                  />
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                    Base Drop Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                      {CURRENCY_SYMBOLS[editFormData.priceCurrency] || '₹'}
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editFormData.priceAmount}
                      onChange={(e) => setEditFormData({ ...editFormData, priceAmount: e.target.value })}
                      placeholder="e.g. 2499"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm pl-8 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={editFormData.priceCurrency}
                    onChange={(e) => setEditFormData({ ...editFormData, priceCurrency: e.target.value })}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 transition-colors uppercase font-mono font-bold cursor-pointer"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                  Drop Story & Description
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Describe garment composition, silhouette, GSM fabric quality, wash care instructions..."
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors leading-relaxed"
                />
              </div>

              {/* ── DROP EDITORIAL IMAGERY (ADD / REMOVE / EDIT) ── */}
              <div className="border-t border-zinc-800/80 pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <label className="block text-zinc-300 text-[11px] uppercase font-bold tracking-wider">
                      Drop Editorial Imagery
                    </label>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Retain current photos, remove obsolete shots, or upload new high-res assets (Max 7 photos).
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider ${
                    editExistingImages.length + editNewFiles.length >= 7
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {editExistingImages.length + editNewFiles.length} / 7 IMAGES
                  </span>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                  {/* Current Saved Images */}
                  {editExistingImages.map((imgUrl, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="group relative aspect-[3/4] rounded-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-600 overflow-hidden transition-all shadow-sm"
                    >
                      <img
                        src={imgUrl}
                        alt={`Drop asset ${idx + 1}`}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-zinc-400 border border-zinc-700/80 text-[8px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider uppercase pointer-events-none">
                        Current
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        disabled={isUpdatingProduct}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-sm bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
                        title="Delete photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Newly Staged Uploads */}
                  {editNewPreviews.map((preview, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="group relative aspect-[3/4] rounded-sm bg-zinc-900 border-2 border-yellow-400/70 hover:border-yellow-400 overflow-hidden transition-all shadow-sm shadow-yellow-400/10"
                    >
                      <img
                        src={preview.url}
                        alt={`New upload ${idx + 1}`}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-yellow-400 text-zinc-950 font-black text-[8px] px-1.5 py-0.5 rounded-xs tracking-wider uppercase pointer-events-none shadow-xs">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        disabled={isUpdatingProduct}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-sm bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all opacity-90 group-hover:opacity-100 cursor-pointer shadow-md"
                        title="Discard photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Add Photos Card */}
                  {editExistingImages.length + editNewFiles.length < 7 && (
                    <label
                      htmlFor="editProductFileInput"
                      className="aspect-[3/4] rounded-sm border-2 border-dashed border-zinc-800 hover:border-yellow-400/80 bg-zinc-900/40 hover:bg-yellow-400/5 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group select-none"
                    >
                      <input
                        type="file"
                        id="editProductFileInput"
                        ref={editFileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleAddNewImages}
                        disabled={isUpdatingProduct}
                        className="hidden"
                      />
                      <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-yellow-400/20 group-hover:text-yellow-400 text-zinc-400 flex items-center justify-center transition-colors mb-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-300 group-hover:text-yellow-400 uppercase tracking-wider transition-colors">
                        Add Photos
                      </span>
                      <span className="text-[9px] text-zinc-500 mt-0.5">
                        PNG, JPG, WEBP
                      </span>
                    </label>
                  )}
                </div>

                {editExistingImages.length + editNewFiles.length >= 7 && (
                  <p className="text-[10px] text-amber-400/90 font-medium mt-2.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <span>Maximum limit of 7 images reached. Remove an image to upload another.</span>
                  </p>
                )}

                {editExistingImages.length + editNewFiles.length === 0 && (
                  <p className="text-[10px] text-red-400 font-medium mt-2.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    <span>Drop must contain at least 1 image. Please add or retain a photo.</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-900 shrink-0">
                <button
                  type="button"
                  disabled={isUpdatingProduct}
                  onClick={handleCloseEditModal}
                  className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400 hover:text-white py-3 text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingProduct || editExistingImages.length + editNewFiles.length === 0}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-3 text-xs tracking-[0.15em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/10 disabled:opacity-50"
                >
                  {isUpdatingProduct ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving & Uploading...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE ENTIRE DROP CONFIRMATION MODAL ── */}
      {isDeleteDropModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => !isDeletingProduct && setIsDeleteDropModalOpen(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-red-500/40 rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top red accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            {/* Close Button */}
            {!isDeletingProduct && (
              <button
                type="button"
                onClick={() => setIsDeleteDropModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Cancel"
              >
                ✕
              </button>
            )}

            {/* Header Icon + Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-[10px] tracking-[0.25em] uppercase font-bold">
                    Permanent Deletion
                  </span>
                </div>
                <h3 className="text-white text-xl font-black tracking-tight uppercase">
                  Delete Entire Drop?
                </h3>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed mb-5">
              Are you sure you want to permanently delete this garment drop? This action cannot be reversed. The drop, all its variants, images, and inventory records will be erased completely.
            </p>

            {/* Product Summary Card */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-sm p-4 mb-6 flex items-center gap-3.5">
              <div className="w-14 h-18 rounded-sm bg-zinc-900 overflow-hidden border border-zinc-800 shrink-0">
                {product?.images?.[0] ? (
                  <img
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600">
                    No Img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-bold block mb-0.5">
                  {product?.category || 'Collection Drop'}
                </span>
                <h4 className="text-white font-bold text-xs uppercase truncate">
                  {product?.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
                  <span className="text-yellow-400 font-bold">
                    {formatPrice(product?.price)}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">
                    {product?.variants?.length || 0} variants
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={() => setIsDeleteDropModalOpen(false)}
                className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400 hover:text-white py-3 text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer font-bold disabled:opacity-50"
              >
                Keep Drop
              </button>

              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={handleConfirmDeleteDrop}
                className="flex-1 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black py-3 text-xs tracking-[0.15em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 disabled:opacity-50"
              >
                {isDeletingProduct ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
        user={user}
      />
    </div>
  )
}

export default SellerProductDetails