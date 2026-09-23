import { useState, useRef } from 'react'
import { useProduct } from '../hook/useProduct.js'
import { useNavigate } from 'react-router'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
const MAX_IMAGES = 7

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
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
      formData.append('priceAmount', form.priceAmount)
      formData.append('priceCurrency', form.priceCurrency)
      images.forEach((img) => formData.append('images', img))
      await handleCreateProduct(formData)
      navigate('/')
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
    <div className={`bg-[#0a0a0a] px-6 py-14 sm:px-12 lg:px-24 ${images.length === 0 ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-12">
        <p className="text-yellow-400 text-[10px] tracking-[0.35em] uppercase mb-3">Seller Studio</p>
        <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight">Create Product</h1>
        <p className="text-zinc-600 text-sm mt-2">Fill in the details below to list your product on Snitch.</p>
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

        {/* Price */}
        <div>
          <label className={labelClass}>Price</label>
          <div className="flex items-end gap-6">
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
  )
}

export default CreateProduct