import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct.js'
import { useAuth } from '../../auth/hook/useAuth.js'
import LogoutConfirmModal from '../../auth/components/LogoutConfirmModal.jsx'
import { useNavigate, Link } from 'react-router'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
const MAX_IMAGES = 7

const PRODUCT_CATEGORIES = ['TSHIRTS', 'SHIRTS', 'JEANS', 'HOODIES', 'OVERSIZED', 'OTHER']

const COLOR_SUGGESTIONS = [
  { name: 'Onyx Black', hex: '#111111' },
  { name: 'Off-White', hex: '#f4f4f4' },
  { name: 'Slate Grey', hex: '#64748b' },
  { name: 'Beige', hex: '#d4b996' },
  { name: 'Vintage Navy', hex: '#1e293b' },
  { name: 'Olive Green', hex: '#556b2f' },
  { name: 'Crimson', hex: '#991b1b' },
]

const SIZE_SUGGESTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', 'FREE SIZE']

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct()
  const { handleLogout } = useAuth()
  const navigate = useNavigate()
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

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TSHIRTS',
    color: '',
    size: 'M',
    stock: '25',
    priceAmount: '',
    priceCurrency: 'INR',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addFiles = (files) => {
    const toAdd = Array.from(files).slice(0, MAX_IMAGES - images.length)
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])
    setImages((prev) => [...prev, ...toAdd])
  }

  const handleImageChange = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (images.length >= MAX_IMAGES) return
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    addFiles(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (images.length < MAX_IMAGES) setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category || 'TSHIRTS')
      formData.append('color', form.color ? form.color.trim() : '')
      formData.append('size', form.size ? form.size.trim() : 'M')
      formData.append('stock', form.stock || '25')
      formData.append('priceAmount', form.priceAmount)
      formData.append('priceCurrency', form.priceCurrency)
      images.forEach((img) => formData.append('images', img))
      await handleCreateProduct(formData)
      navigate('/seller/dashboard')
    } catch (err) {
      console.error('Failed to create product:', err)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300'

  const labelClass =
    'block text-zinc-500 text-[10px] font-medium tracking-[0.25em] uppercase mb-3'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black relative">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.03)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_70%)]" />
      </div>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-yellow-400 text-zinc-950 px-4 py-2 text-center text-[11px] font-black tracking-[0.25em] uppercase select-none relative z-10">
        <span>Snitch Seller Studio • New Garment Creation</span>
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
              to="/"
              className="text-zinc-400 hover:text-white text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-colors px-3 py-2 border border-zinc-800/80 hover:border-zinc-700 rounded-sm bg-zinc-900/40"
            >
              <span className="hidden sm:inline">Snitch Store</span>
              <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-500 tracking-wider">
            <Link to="/seller/dashboard" className="hover:text-yellow-400 transition-colors uppercase text-[10px]">
              Seller Studio
            </Link>
            <span>/</span>
            <Link to="/seller/dashboard" className="hover:text-yellow-400 transition-colors uppercase text-[10px]">
              Products
            </Link>
            <span>/</span>
            <span className="text-zinc-300 font-medium uppercase text-[10px]">
              Create New Drop
            </span>
          </div>
          <Link
            to="/seller/dashboard"
            className="text-zinc-400 hover:text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>← Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 sm:px-12 pb-28">
        {/* Header */}
        <div className="mb-10 border-b border-zinc-900 pb-6">
          <p className="text-yellow-400 text-[10px] tracking-[0.35em] uppercase font-bold mb-2">Seller Studio</p>
          <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight uppercase">Create Product</h1>
          <p className="text-zinc-500 text-xs mt-1.5">Fill in the specifications below to publish a new drop onto Snitch Store.</p>
        </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-10">

        {/* Title */}
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Oversized Graphic Tee"
            required
            className={inputClass}
          />
        </div>

        {/* Drop Category */}
        <div>
          <label className={labelClass}>Drop Category</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                className={`px-3.5 py-2 text-xs tracking-wider uppercase rounded-sm border transition-all cursor-pointer ${
                  form.category === cat
                    ? 'bg-yellow-400 text-zinc-950 font-bold border-yellow-400 shadow-md scale-[1.02]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Color Attribute */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`${labelClass} mb-0`}>
              Garment Colour / Color <span className="text-yellow-400 font-bold tracking-normal">(Variant Attribute)</span>
            </label>
            {form.color && (
              <span className="text-yellow-400 text-xs font-mono font-bold uppercase tracking-wider">
                Selected: {form.color}
              </span>
            )}
          </div>

          {/* Quick Color Swatches / Presets */}
          <div className="flex flex-wrap gap-2 mb-3 pt-1">
            {COLOR_SUGGESTIONS.map((col) => {
              const isSelected = (form.color || '').trim().toLowerCase() === col.name.toLowerCase()
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color: col.name }))}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium tracking-wider border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400 text-zinc-950 font-bold border-yellow-400 shadow-md scale-[1.02]'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              )
            })}
          </div>

          {/* Custom Color Input */}
          <div className="relative">
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Or type custom colour (e.g. Sage Green, Electric Blue, Mauve)..."
              className={inputClass}
            />
            {form.color && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color: '' }))}
                className="absolute right-0 bottom-3 text-zinc-500 hover:text-white text-xs uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-zinc-600 text-[11px] mt-1.5">
            Uploaded photos will be tied to this colour so buyers can view photos by selecting this colour.
          </p>
        </div>

        {/* Garment Size Attribute */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`${labelClass} mb-0`}>
              Garment Size <span className="text-yellow-400 font-bold tracking-normal">(Variant Attribute)</span>
            </label>
            {form.size && (
              <span className="text-yellow-400 text-xs font-mono font-bold uppercase tracking-wider">
                Selected: {form.size}
              </span>
            )}
          </div>

          {/* Quick Size Presets */}
          <div className="flex flex-wrap gap-2 mb-3 pt-1">
            {SIZE_SUGGESTIONS.map((sz) => {
              const isSelected = (form.size || '').trim().toUpperCase() === sz.toUpperCase()
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, size: sz }))}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400 text-zinc-950 font-bold border-yellow-400 shadow-md scale-[1.02]'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {sz}
                </button>
              )
            })}
          </div>

          {/* Custom Size Input */}
          <div className="relative">
            <input
              type="text"
              name="size"
              value={form.size}
              onChange={handleChange}
              placeholder="Or enter custom size (e.g. 28, 36, Oversized L)..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your product — material, fit, occasion..."
            required
            rows={5}
            className="w-full bg-transparent border border-zinc-800 rounded-sm px-4 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300 resize-none"
          />
        </div>

        {/* Commercial Details: Price & Initial Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Price */}
          <div>
            <label className={labelClass}>Price</label>
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <select
                  name="priceCurrency"
                  value={form.priceCurrency}
                  onChange={handleChange}
                  className="appearance-none bg-transparent border-b border-zinc-800 text-white text-sm py-3 pr-7 focus:outline-none focus:border-yellow-400 transition-colors duration-300 cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0a0a0a] text-white">{c}</option>
                  ))}
                </select>
                <span className="absolute right-0 bottom-3.5 text-zinc-600 text-xs pointer-events-none">▾</span>
              </div>
              <div className="relative flex-1">
                <span className="absolute left-0 bottom-3 text-zinc-400 text-sm pointer-events-none select-none">
                  {CURRENCY_SYMBOLS[form.priceCurrency]}
                </span>
                <input
                  type="number"
                  name="priceAmount"
                  value={form.priceAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className={`${inputClass} pl-6`}
                />
              </div>
            </div>
          </div>

          {/* Initial Stock */}
          <div>
            <label className={labelClass}>Initial Stock (Units)</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="e.g. 25"
              min="0"
              className={inputClass}
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className={`${labelClass} mb-0`}>Images</label>
            <span className="text-zinc-700 text-[10px] tracking-widest">{images.length} / {MAX_IMAGES}</span>
          </div>

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover rounded-sm border border-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-[#0a0a0a]/80 text-zinc-400 hover:text-white rounded-sm text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          {images.length < MAX_IMAGES && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border border-dashed rounded-sm py-10 flex flex-col items-center gap-2 transition-all duration-200 cursor-pointer group ${
                isDragging
                  ? 'border-yellow-400 bg-yellow-400/5'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Upload icon */}
              <svg
                className={`w-7 h-7 transition-colors duration-200 ${isDragging ? 'text-yellow-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className={`text-[10px] tracking-[0.25em] uppercase transition-colors duration-200 ${isDragging ? 'text-yellow-400' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-zinc-800 text-[10px]">
                {MAX_IMAGES - images.length} slot{MAX_IMAGES - images.length !== 1 ? 's' : ''} remaining · images only
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-900" />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black py-4 text-xs tracking-[0.3em] uppercase transition-all duration-200 rounded-sm cursor-pointer flex items-center justify-center gap-3"
        >
          {loading ? 'Publishing...' : 'Publish Product'}
          {!loading && (
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          )}
        </button>

      </form>
      </div>

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

export default CreateProduct