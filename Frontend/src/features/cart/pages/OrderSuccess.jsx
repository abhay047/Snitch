import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import Footer from '../../Shared/Components/Footer.jsx'
import { getOrderDetails, getPaymentHistory } from '../service/cart.api.js'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

const formatPrice = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹'
  const numeric = Math.max(0, Number(amount) || 0)
  return `${symbol}${numeric.toLocaleString('en-IN')}`
}

const OrderSuccess = () => {
  const location = useLocation()
  const user = useSelector((state) => state.auth?.user)

  const orderData = location.state || {}
  const [paymentId, setPaymentId] = useState(orderData.paymentId || '')
  const [orderId, setOrderId] = useState(orderData.orderId || '')
  const [amount, setAmount] = useState(orderData.amount != null ? Number(orderData.amount) : null)
  const [currency, setCurrency] = useState(orderData.currency || 'INR')
  const [items, setItems] = useState(Array.isArray(orderData.items) ? orderData.items : [])
  const [subtotal, setSubtotal] = useState(orderData.subtotal != null ? Number(orderData.subtotal) : null)
  const [gstAmount, setGstAmount] = useState(orderData.gstAmount != null ? Number(orderData.gstAmount) : null)
  const [handlingFee, setHandlingFee] = useState(orderData.handlingFee != null ? Number(orderData.handlingFee) : null)
  const [loading, setLoading] = useState(false)

  const symbol = CURRENCY_SYMBOLS[currency] || '₹'

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // If items are not in router state (e.g. page refresh), fetch from database
  useEffect(() => {
    if (items.length > 0) return

    let isMounted = true
    async function fetchOrderFromDb() {
      try {
        setLoading(true)
        let paymentRecord = null

        if (orderId) {
          try {
            const res = await getOrderDetails(orderId)
            paymentRecord = res
          } catch {
            // fallback to payment history
          }
        }

        if (!paymentRecord) {
          const historyRes = await getPaymentHistory()
          if (Array.isArray(historyRes) && historyRes.length > 0) {
            paymentRecord = historyRes[0]
          }
        }

        if (paymentRecord && isMounted) {
          if (!orderId && paymentRecord.razorpay?.orderId) {
            setOrderId(paymentRecord.razorpay.orderId)
          }
          if (!paymentId && paymentRecord.razorpay?.paymentId) {
            setPaymentId(paymentRecord.razorpay.paymentId)
          }
          if (amount == null && paymentRecord.price?.amount != null) {
            setAmount(Number(paymentRecord.price.amount))
          }
          if (paymentRecord.price?.currency) {
            setCurrency(paymentRecord.price.currency)
          }

          if (Array.isArray(paymentRecord.orderItems) && paymentRecord.orderItems.length > 0) {
            const mappedItems = paymentRecord.orderItems.map((oi) => ({
              productId: oi.productId,
              variantId: oi.variantId,
              title: oi.title || 'Garment',
              description: oi.description || '',
              image: oi.images?.[0]?.url || oi.images?.[0] || '',
              size: oi.size || '',
              color: oi.color || '',
              quantity: Math.max(1, Number(oi.quantity) || 1),
              price: oi.price?.amount || 0,
              currency: oi.price?.currency || 'INR',
            }))
            setItems(mappedItems)

            // Derive subtotal, gst, handling if not set
            const sum = mappedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0)
            setSubtotal(sum)
            setGstAmount(Math.round(sum * 0.18))
            setHandlingFee(Math.round(sum * 0.05))
          }
        }
      } catch (err) {
        console.error('Failed to load order details:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOrderFromDb()

    return () => {
      isMounted = false
    }
  }, [orderId, items.length])

  // Calculated subtotal fallback if missing
  const calculatedSubtotal = subtotal != null 
    ? subtotal 
    : items.reduce((acc, it) => acc + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0)

  const calculatedGst = gstAmount != null 
    ? gstAmount 
    : Math.round(calculatedSubtotal * 0.18)

  const calculatedHandling = handlingFee != null 
    ? handlingFee 
    : Math.round(calculatedSubtotal * 0.05)

  const totalCalculated = amount != null 
    ? amount 
    : (calculatedSubtotal + calculatedGst + calculatedHandling)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative font-sans selection:bg-yellow-400 selection:text-zinc-950 flex flex-col">
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-1/3 left-[-100px] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.04)_0%,transparent_70%)]" />
      </div>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-yellow-400 text-zinc-950 px-4 py-2 text-center text-[11px] font-black tracking-[0.25em] uppercase select-none relative z-10">
        <span>Order Confirmed • Complimentary Express Shipping Initialized</span>
      </div>

      {/* ── STICKY FROSTED NAVBAR ── */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo.png"
              alt="Snitch Logo"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-black tracking-[0.2em] uppercase text-zinc-100 hidden sm:inline-block">
              Snitch
            </span>
          </Link>

          <Link
            to="/"
            className="text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>Back to Store</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONFIRMATION CONTENT ── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full relative z-10 flex flex-col items-center">
        {/* Animated Success Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20">
            <svg className="w-10 h-10 sm:w-11 sm:h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md -z-10 animate-pulse" />
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-emerald-400 font-mono text-[11px] sm:text-xs tracking-[0.3em] uppercase block mb-2 font-bold">
            Payment Authenticated • Order Dispatched to Fulfillment
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-zinc-100 mb-3">
            Order Confirmed
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Thank you for your purchase. We have received your order and our atelier is already packaging your pieces for complimentary express courier dispatch.
          </p>
        </div>

        {/* ── MAIN ORDER CARD ── */}
        <div className="w-full bg-[#121212]/90 border border-zinc-800 rounded-sm p-6 sm:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

          {/* Top Header: Recipient & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 block mb-1 font-semibold">
                Customer Recipient
              </span>
              <p className="text-zinc-100 font-bold text-base">
                {user?.fullname || user?.email || 'Valued Snitch Patron'}
              </p>
              {user?.email && (
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 block mb-1 font-semibold">
                Payment Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Verified & Paid
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 pb-6 border-b border-zinc-800/80">
            {orderId && (
              <div className="bg-zinc-950/60 p-4 rounded-sm border border-zinc-850">
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 block font-semibold mb-1">
                  Order Reference
                </span>
                <span className="font-mono text-xs sm:text-sm text-zinc-200 select-all break-all">
                  {orderId}
                </span>
              </div>
            )}

            {paymentId && (
              <div className="bg-zinc-950/60 p-4 rounded-sm border border-zinc-850">
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 block font-semibold mb-1">
                  Razorpay Transaction ID
                </span>
                <span className="font-mono text-xs sm:text-sm text-yellow-400 select-all break-all">
                  {paymentId}
                </span>
              </div>
            )}

            <div className="bg-zinc-950/60 p-4 rounded-sm border border-zinc-850">
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 block font-semibold mb-1">
                Settled Total
              </span>
              <span className="font-mono text-base font-bold text-zinc-100">
                {formatPrice(totalCalculated, currency)}
              </span>
            </div>
          </div>

          {/* ── ORDERED PRODUCTS SECTION ── */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-zinc-300 flex items-center gap-2">
                <span>Purchased Pieces</span>
                {items.length > 0 && (
                  <span className="text-yellow-400 font-mono text-[11px]">
                    ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">
                Itemized Summary
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500 text-xs gap-3">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading your purchased garment details...</span>
              </div>
            ) : items.length > 0 ? (
              <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-sm bg-zinc-950/40 overflow-hidden mb-6">
                {items.map((item, index) => {
                  const itemPrice = Number(item.price) || 0
                  const itemQty = Math.max(1, Number(item.quantity) || 1)
                  const lineTotal = itemPrice * itemQty
                  const itemCurrency = item.currency || currency

                  return (
                    <div
                      key={item.variantId || item.productId || index}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-zinc-900/30"
                    >
                      {/* Product Image & Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-16 h-20 sm:w-20 sm:h-24 bg-zinc-900 rounded-sm overflow-hidden shrink-0 border border-zinc-800 relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          {item.productId ? (
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-sm sm:text-base font-bold text-zinc-100 hover:text-yellow-400 transition-colors truncate block"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                              {item.title}
                            </h3>
                          )}

                          {/* Variant Attributes (Size, Color, Qty) */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {item.size && (
                              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                                Size: <strong className="text-white">{item.size}</strong>
                              </span>
                            )}
                            {item.color && (
                              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                                Color: <strong className="text-white">{item.color}</strong>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                              Qty: <strong>{itemQty}</strong>
                            </span>
                          </div>

                          <div className="text-xs text-zinc-500 font-mono mt-1.5">
                            Unit Price: {formatPrice(itemPrice, itemCurrency)}
                          </div>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="self-end sm:self-center text-right shrink-0">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Total
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-zinc-100">
                          {formatPrice(lineTotal, itemCurrency)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs bg-zinc-950/40 border border-zinc-850 rounded-sm mb-6">
                Your order receipt has been sent to your registered email address.
              </div>
            )}

            {/* ── FINANCIAL SUMMARY BREAKDOWN ── */}
            <div className="bg-zinc-950/70 border border-zinc-850 rounded-sm p-4 sm:p-5 space-y-2.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Items Subtotal</span>
                <span className="font-mono text-zinc-200">
                  {formatPrice(calculatedSubtotal, currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-zinc-400">
                <span>18% Goods & Services Tax (GST)</span>
                <span className="font-mono text-zinc-200">
                  {formatPrice(calculatedGst, currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-zinc-400">
                <span>5% Priority Logistics & Handling</span>
                <span className="font-mono text-zinc-200">
                  {formatPrice(calculatedHandling, currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-emerald-400">
                <span>Express Courier Dispatch</span>
                <span className="font-bold uppercase tracking-wider">Complimentary (Free)</span>
              </div>

              <div className="border-t border-zinc-800 pt-3 mt-2 flex justify-between items-center text-sm sm:text-base font-bold text-zinc-100">
                <span className="uppercase tracking-widest text-xs">Total Amount Paid</span>
                <span className="font-mono text-lg text-yellow-400">
                  {formatPrice(totalCalculated, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Assurance Notice */}
          <div className="mt-8 pt-6 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Estimated Delivery: <strong className="text-zinc-200">2 - 4 Business Days</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Snitch Guarantee: <strong className="text-zinc-200">Tamper-Proof Express Transit</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-[0.25em] text-center transition-all duration-200 shadow-xl shadow-yellow-400/10 active:scale-[0.98]"
          >
            Continue Shopping
          </Link>

          <Link
            to="/cart"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-[0.25em] text-center border border-zinc-800 transition-all duration-200 active:scale-[0.98]"
          >
            View Bag
          </Link>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer className="mt-auto" />
    </div>
  )
}

export default OrderSuccess