import React, { useEffect } from 'react'

const PaymentStatusModal = ({
  isOpen,
  status = 'success', // 'success' | 'failed'
  title,
  message,
  paymentId,
  orderId,
  amount,
  currency = 'INR',
  onClose,
  onPrimaryAction,
}) => {
  const isSuccess = status === 'success'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatAmount = (amt) => {
    if (!amt && amt !== 0) return null
    // If amount is in paise (>= 1000 and whole), format appropriately
    const val = Number(amt)
    return `₹${val.toLocaleString('en-IN')}`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400'
              : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
          }`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white text-base w-8 h-8 rounded-sm border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Center Animated Icon */}
        <div className="mx-auto mb-5 flex items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xl relative ${
              isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'
            }`}
          >
            {/* Ambient Pulse Ring */}
            <span
              className={`absolute -inset-1 rounded-full animate-ping opacity-25 ${
                isSuccess ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />

            {isSuccess ? (
              <svg className="w-8 h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-8 h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Status Badge Tag */}
        <div className="inline-flex items-center gap-2 mb-2">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isSuccess ? 'bg-emerald-400' : 'bg-red-400'
            }`}
          />
          <span
            className={`text-[10px] tracking-[0.25em] uppercase font-mono font-bold ${
              isSuccess ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isSuccess ? 'Payment Confirmed' : 'Transaction Declined'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
          {title || (isSuccess ? 'Payment Successful' : 'Payment Failed')}
        </h3>

        {/* Subtitle / Message */}
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          {message ||
            (isSuccess
              ? 'Your transaction has been processed. Your order has been placed and will be dispatched shortly.'
              : 'Your payment could not be processed. No amount was deducted from your account. Please try again.')}
        </p>

        {/* Transaction Details Box */}
        {(paymentId || orderId || amount) && (
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-sm p-4 mb-6 text-left space-y-2 font-mono text-xs">
            {amount && (
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Amount Paid</span>
                <span className="text-white font-bold">{formatAmount(amount)}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Payment ID</span>
                <span className="text-zinc-300 font-bold text-[11px] truncate max-w-[190px]">
                  {paymentId}
                </span>
              </div>
            )}
            {orderId && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Order ID</span>
                <span className="text-zinc-400 text-[11px] truncate max-w-[190px]">
                  {orderId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {isSuccess ? (
            <button
              type="button"
              onClick={onPrimaryAction || onClose}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-3.5 px-6 text-xs uppercase tracking-[0.2em] rounded-sm transition-all duration-200 cursor-pointer shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onPrimaryAction || onClose}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-3.5 px-6 text-xs uppercase tracking-[0.2em] rounded-sm transition-all duration-200 cursor-pointer shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2"
              >
                <span>Retry Payment</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 px-6 text-xs uppercase tracking-wider rounded-sm border border-zinc-800 transition-colors cursor-pointer"
              >
                Review Shopping Bag
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentStatusModal
