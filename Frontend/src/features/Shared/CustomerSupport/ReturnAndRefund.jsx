import React from 'react'
import { Link } from 'react-router'

const ReturnAndRefund = () => {
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
              Customer Support & Protection
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Return & Refund Policy
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • 100% Buyer Guarantee
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            We want every garment you purchase from Snitch to feel tailored and authentic. If for any reason your selected piece does not meet your expectations, our streamlined 7-day return and refund policy ensures an effortless resolution.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                7-Day Hassle-Free Return Guarantee
              </h2>
            </div>
            <p>
              Snitch provides a transparent <strong className="text-white">7-day return window</strong> on eligible clothing drops:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>The 7-day period begins exactly from the day and timestamp delivery is confirmed by our courier partner.</li>
              <li>Return requests can be initiated directly via our online self-service portal or by notifying our support desk.</li>
              <li>Requests submitted after 7 days from the confirmed delivery date cannot be accommodated in our automated warehouse returns system.</li>
            </ul>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Garment Condition & Acceptance Standards
              </h2>
            </div>
            <p>
              To maintain strict luxury quality benchmarks for our collective community, returned garments must satisfy all of the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Unworn & Unused:</strong> Garments must show zero signs of wear, stretching, body odor, deodorant marks, or cosmetic stains.</li>
              <li><strong className="text-white">Tags Attached:</strong> All original barcode tags, luxury swing tags, brand ribbon ribbons, and spare button bags must remain securely attached.</li>
              <li><strong className="text-white">Original Box & Packing:</strong> Items must be returned in the original brand box with internal protective parchment/poly packaging.</li>
              <li><strong className="text-white">Unwashed:</strong> Garments that have undergone any laundering, chemical dry cleaning, or ironing will be immediately disqualified.</li>
            </ul>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Non-Returnable Items & Final Clearance Drops
              </h2>
            </div>
            <p>
              For hygiene reasons and scarcity regulations, certain categories are classified as non-returnable:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Innerwear, boxers, briefs, undershirts, and sock packs.</li>
              <li>Headwear including beanies, caps, and balaclavas.</li>
              <li>Jewelry, chains, bracelets, and metallic streetwear accessories.</li>
              <li>Archival Vault releases explicitly tagged as <em className="text-yellow-400 font-semibold">"Final Sale / Non-Returnable"</em> on the product detail page.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Step-by-Step Return Request Workflow
              </h2>
            </div>
            <p>
              Returning an item is completed in four simple steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Step 1 — Initiate:</strong> Log in to your Snitch account, navigate to Order History, and select "Request Return" on the item.</li>
              <li><strong className="text-white">Step 2 — Reason & Photos:</strong> Select the return reason (size issue, fabric feel, or change of mind) and upload photos if reporting a defect.</li>
              <li><strong className="text-white">Step 3 — Doorstep Handover:</strong> Our logistics partner will schedule a doorstep reverse pickup within 24 to 48 hours. Provide the OTP received via SMS.</li>
              <li><strong className="text-white">Step 4 — Quality Check & Refund:</strong> Once the parcel arrives at our central hub and clears the physical audit, your refund is instantly initiated.</li>
            </ol>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Doorstep Reverse Pickup Logistics
              </h2>
            </div>
            <p>
              Snitch arranges convenient doorstep pickups in over 19,000 postal pincodes across India:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Reverse pickup is 100% complimentary on your first return per order.</li>
              <li>The courier executive will inspect the garment superficially and scan the return barcode before handing you an acknowledgement receipt.</li>
              <li>In remote areas where reverse pickup is unavailable, customers may self-ship via Speed Post, and Snitch will reimburse up to ₹150 courier freight.</li>
            </ul>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Warehouse Quality Audit & Disqualification
              </h2>
            </div>
            <p>
              Upon arrival at our central fulfillment facility, every returned piece undergoes a 3-point inspection by our apparel audit specialists:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Fabric weave integrity, seam strength, zipper/button functionality, and scent profile are evaluated.</li>
              <li>If an item fails the quality audit due to evident wear or missing tags, the return request will be rejected.</li>
              <li>Rejected garments will be shipped back to the customer's delivery address, and any forward freight charges may apply.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Refund Processing Channels & Timelines
              </h2>
            </div>
            <p>
              Once approved, refunds are settled according to the original payment channel:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 uppercase font-bold block">Prepaid (UPI / Cards / Net Banking)</span>
                <p className="text-zinc-300 mt-1">Refunded directly to source account within <strong className="text-white">3 – 5 business days</strong>.</p>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 uppercase font-bold block">Cash on Delivery (COD)</span>
                <p className="text-zinc-300 mt-1">Transferred via IMPS/NEFT/UPI to your bank details within <strong className="text-white">2 – 4 business days</strong>.</p>
              </div>
            </div>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Partial Returns & Promotional Recalculations
              </h2>
            </div>
            <p>
              If you placed an order benefiting from a multi-item drop promotion (e.g. "Buy 2 Get 15% Off" or "Free Shipping above ₹2,999"):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Returning one piece from the bundle may alter the qualifying threshold of the applied coupon.</li>
              <li>The refund amount will be calculated by deducting the promotional value that is no longer valid on retained pieces.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Defective, Damaged or Incorrect Garment Claims
              </h2>
            </div>
            <p>
              We enforce strict zero-defect tolerance. In the unlikely scenario you receive a garment with a manufacturing defect or wrong color/size:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Report the discrepancy within <strong className="text-white">48 hours of delivery</strong> by sending an email with clear unboxing photos to <span className="text-yellow-400 font-mono">support@snitch.co.in</span>.</li>
              <li>A priority courier pickup will be deployed immediately without any charge.</li>
              <li>You may opt for an immediate brand replacement dispatch or a 100% full instant refund.</li>
            </ul>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Support Desk & Refund Status Inquiries
              </h2>
            </div>
            <p>
              Have questions regarding an active return or need help entering bank details for a COD refund?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Email Helpdesk</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">returns@snitch.co.in</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Please quote your Order ID and Registered Phone</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Customer Care Live Desk</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">+91 98765 43210</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Operating Mon – Sat | 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default ReturnAndRefund