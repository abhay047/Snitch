import React, { useEffect } from 'react'

const ClearBagConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isClearing = false,
  cartItems = [],
  getItemImage,
  getItemVariantDetails,
  getItemUnitPrice,
  getItemCurrency,
  formatPrice,
  subtotal = 0,
  totalQuantity = 0,
  primaryCurrency = 'INR',
}) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isClearing && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isClearing, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={() => !isClearing && onClose()}
    >
      <div
        className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-lg w-full p-5 sm:p-7 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Warning Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Close Button */}
        {!isClearing && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Cancel and Keep Bag"
          >
            ✕
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-[10px] tracking-[0.25em] uppercase font-bold">
                Confirm Bag Clearance
              </span>
            </div>
            <h3 className="text-white text-lg sm:text-xl font-black tracking-tight uppercase">
              Empty Your Entire Bag?
            </h3>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-zinc-400 text-xs leading-relaxed mb-4">
          Are you sure you want to remove all garments from your bag? Review the items below before clearing your selection:
        </p>

        {/* List of Cart Items with Details */}
        <div className="border border-zinc-900 rounded-sm bg-zinc-950/70 p-2 mb-4">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-900 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Garments in Bag ({cartItems.length})</span>
            <span>{totalQuantity} Unit{totalQuantity > 1 ? 's' : ''}</span>
          </div>

          <div className="max-h-60 sm:max-h-64 overflow-y-auto space-y-2 p-1 divide-y divide-zinc-900/60">
            {cartItems.map((item, index) => {
              const product = typeof item.product === 'object' ? item.product : null
              const productId = product?._id || item.product
              const title = product?.title || 'Garment Piece'
              const category = product?.category || 'Limited Edition'
              const itemImg = getItemImage ? getItemImage(item) : null
              const { size, color } = getItemVariantDetails ? getItemVariantDetails(item) : {}
              const unitPrice = getItemUnitPrice ? getItemUnitPrice(item) : 0
              const currency = getItemCurrency ? getItemCurrency(item) : primaryCurrency
              const qty = Math.max(1, Number(item.quantity) || 1)
              const lineTotal = unitPrice * qty

              return (
                <div
                  key={item._id || `${productId}-${item.variant || index}`}
                  className="flex items-center gap-3 pt-2 first:pt-0"
                >
                  {/* Thumbnail */}
                  <div className="w-12 sm:w-14 aspect-[3/4] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800/80 shrink-0 flex items-center justify-center">
                    {itemImg ? (
                      <img
                        src={itemImg}
                        alt={title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                      </svg>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold truncate">
                      {category}
                    </span>
                    <h4 className="text-white text-xs font-bold truncate">
                      {title}
                    </h4>

                    {/* Variant tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {size && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-zinc-900 border border-zinc-800 text-zinc-300">
                          Size: {size}
                        </span>
                      )}
                      {color && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-zinc-900 border border-zinc-800 text-zinc-300">
                          Color: {color}
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-zinc-900 border border-zinc-800 text-yellow-400 font-bold">
                        Qty: {qty}
                      </span>
                    </div>
                  </div>

                  {/* Price info */}
                  <div className="text-right shrink-0">
                    <span className="text-zinc-400 text-[10px] font-mono block">
                      {qty} × {formatPrice ? formatPrice(unitPrice, currency) : `₹${unitPrice}`}
                    </span>
                    <span className="text-white text-xs font-mono font-black block mt-0.5">
                      {formatPrice ? formatPrice(lineTotal, currency) : `₹${lineTotal}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bag Total Snapshot */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-sm p-3 mb-5 flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-400 uppercase tracking-wider font-bold block text-[11px]">
              Total Bag Value
            </span>
            <span className="text-zinc-500 text-[10px] block mt-0.5">
              {cartItems.length} unique piece{cartItems.length > 1 ? 's' : ''} • {totalQuantity} item{totalQuantity > 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-yellow-400 font-mono font-black text-base">
            {formatPrice ? formatPrice(subtotal, primaryCurrency) : `₹${subtotal}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isClearing}
            onClick={onClose}
            className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:text-white py-3 text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            Keep In Bag
          </button>

          <button
            type="button"
            disabled={isClearing}
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black py-3 text-xs tracking-[0.15em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 disabled:opacity-50"
          >
            {isClearing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Clearing Bag...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                <span>Clear Entire Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClearBagConfirmModal
