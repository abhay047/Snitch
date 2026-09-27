import React from 'react'
import { Link } from 'react-router'

const Cancellation = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/Logo.png" alt="Snitch" className="w-7 h-7 object-contain transition-transform group-hover:scale-105" />
            <span className="text-white font-black text-lg tracking-[0.25em] uppercase">Snitch</span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          </Link>

          <Link
            to="/"
            className="text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Store</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full pb-24">
        {/* Page Header */}
        <div className="mb-10 pb-8 border-b border-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-[10px] tracking-[0.3em] uppercase font-bold">
              Customer Support & Order Management
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Order Cancellation Policy
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Transparent Cancellation Terms
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            We understand that circumstances change or accidental orders happen. Snitch offers a quick and transparent cancellation mechanism with <strong className="text-white">zero penalty fees</strong> as long as your order has not been dispatched.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Pre-Dispatch Cancellation Window
              </h2>
            </div>
            <p>
              You have the right to cancel your order at any stage prior to dispatch:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Orders remain eligible for instant cancellation while their operational status is marked as <strong className="text-white">"Order Placed"</strong>, <strong className="text-white">"Payment Verified"</strong>, or <strong className="text-white">"Packing in Progress"</strong>.</li>
              <li>There is absolutely zero penalty or processing fee deducted for pre-dispatch cancellations.</li>
              <li>Once an order status transitions to <strong className="text-yellow-400">"Handed Over to Courier"</strong> or <strong className="text-yellow-400">"Dispatched"</strong>, the shipment label is generated and automated transit cannot be cancelled online.</li>
            </ul>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                How to Cancel Your Order Online
              </h2>
            </div>
            <p>
              Cancellation can be completed seamlessly directly through our member dashboard:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Sign in to your Snitch account and open <strong className="text-white">Profile → Orders</strong>.</li>
              <li>Locate the active order and click on <strong className="text-red-400 font-bold">"Cancel Order"</strong>.</li>
              <li>Choose a brief reason for cancellation from the dropdown (e.g., ordered wrong size, accidental order, change of mind).</li>
              <li>Click <strong className="text-white font-bold">"Confirm Cancellation"</strong>. A confirmation SMS and email receipt will be triggered instantly.</li>
            </ol>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Cancellation After Dispatch (Doorstep Refusal)
              </h2>
            </div>
            <p>
              If your order was already dispatched before you could cancel:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>You may simply <strong className="text-white">refuse the delivery at your doorstep</strong> when the courier agent arrives.</li>
              <li>Notify the delivery executive that you wish to cancel the parcel. Do not share the delivery OTP.</li>
              <li>Once the courier marks the parcel as "Delivery Refused / RTO Initiated", an automated refund will be processed to your source account.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                100% Full Refund Guarantee
              </h2>
            </div>
            <p>
              For all eligible pre-dispatch cancellations:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>100% of the total order value — including garment prices, taxes, and shipping fees — will be refunded without deductions.</li>
              <li>Refund processing is triggered by our payment gateway within 15 minutes of cancellation confirmation.</li>
              <li>Funds will reflect back in your bank account, credit card statement, or UPI wallet within <strong className="text-yellow-400">2 to 4 business days</strong> depending on your banking institution.</li>
            </ul>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Cancellation Triggered by Snitch or Sellers
              </h2>
            </div>
            <p>
              In rare operational scenarios, Snitch or a marketplace seller may need to cancel an order:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Quality Inspection Failure:</strong> The remaining piece in stock fails our pre-dispatch fabric audit.</li>
              <li><strong className="text-white">Inventory Discrepancy:</strong> Sudden stock runouts during concurrent flash drops.</li>
              <li><strong className="text-white">Address Inaccuracy:</strong> Incomplete address details or unserviceable pincode that cannot be resolved via phone call.</li>
              <li>In all company-initiated cancellations, a 100% immediate refund is processed along with an apology store coupon code.</li>
            </ul>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Partial Cancellation in Multi-Item Orders
              </h2>
            </div>
            <p>
              If your order contains several garments and you only wish to cancel one:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Individual item cancellation is supported prior to packing.</li>
              <li>If promotional bundles (e.g. "Buy 2 Get 1 Free") were applied, cancelling a constituent piece may require recalculating the order total at standard retail pricing.</li>
              <li>The remaining confirmed items will proceed to shipping and dispatch uninterrupted.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Cash on Delivery (COD) Cancellation Rules
              </h2>
            </div>
            <p>
              We maintain fair access to Cash on Delivery services for all genuine buyers:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>COD orders can be cancelled online or via the automated WhatsApp confirmation prompt before dispatch.</li>
              <li>Repeated doorstep refusals or high-frequency COD cancellations (3 or more consecutive refused shipments) may result in automatic restriction of COD payment mode for that account.</li>
            </ul>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Correction of Order Details vs Cancellation
              </h2>
            </div>
            <p>
              If you merely need to adjust your contact number or delivery address:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>You do not need to cancel your order if the drop is still within 2 hours of booking.</li>
              <li>Contact our live chat desk to request a field update without forfeiting your reserved garment stock.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Bank Settlement Reversal Notice
              </h2>
            </div>
            <p>
              Please note that once Snitch processes your refund, the transaction status is marked as "Settled" on our payment gateway. The subsequent reflection in your passbook is managed by your card issuer or bank (SBI, HDFC, ICICI, Axis, etc.). If you do not see the credit after 5 business days, please quote the provided RRN/UTR reference number to your bank manager.
            </p>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Urgent Cancellation Helpline & Support
              </h2>
            </div>
            <p>
              Need immediate assistance cancelling an order before the courier pickup cut-off?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Priority Cancellation Email</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">cancellation@snitch.co.in</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Subject: "URGENT CANCEL: [Order ID]"</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Direct WhatsApp Assistance</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">+91 98765 43210</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Mon – Sat | 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Cancellation