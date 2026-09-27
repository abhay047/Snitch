import React from 'react'
import { Link } from 'react-router'

const Exchange = () => {
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
              Customer Support & Fit Guarantee
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Garment Exchange Policy
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Perfect Fit Pledge
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Finding your ideal streetwear silhouette is essential. If a piece doesn't fit exactly the way you envisioned, Snitch provides a <strong className="text-white">complimentary size and fit exchange</strong> on all apparel collections.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Complimentary One-Time Size Exchange
              </h2>
            </div>
            <p>
              Snitch provides one free size exchange per garment purchased:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Exchange requests must be submitted within <strong className="text-white">7 calendar days</strong> from the delivery confirmation date.</li>
              <li>There are zero doorstep pickup or forward delivery charges for your first size exchange.</li>
              <li>Exchanges are subject to real-time inventory availability of the requested replacement size.</li>
            </ul>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Eligible Garment Categories
              </h2>
            </div>
            <p>
              Size exchanges are supported across all our primary wardrobe collections:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <span className="p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-300">✓ Oversized T-Shirts & Polos</span>
              <span className="p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-300">✓ Formal & Casual Shirts</span>
              <span className="p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-300">✓ Cargo Pants & Chinos</span>
              <span className="p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-300">✓ Denim Jeans & Jeggings</span>
              <span className="p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-300">✓ Hoodies, Sweatshirts & Knits</span>
              <span className="p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-300">✓ Outerwear & Tailored Blazers</span>
            </div>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Exchange Eligibility & Condition Rules
              </h2>
            </div>
            <p>
              Garments handed over for exchange must be in 100% brand-new, re-sellable condition:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>All garment tags, price swing tags, and branded woven labels must remain intact and untampered.</li>
              <li>Garments must not exhibit collar stains, makeup smudges, pet hair, or cologne/perfume fragrance.</li>
              <li>Pieces that have been washed, hemmed, or altered will be rejected during doorstep inspection.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Exchanging Across Different Colors or Models
              </h2>
            </div>
            <p>
              Please note our system rules regarding non-size swaps:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Our automated exchange process is dedicated exclusively to <strong className="text-white">size modifications within the same SKU/design</strong>.</li>
              <li>If you wish to switch to a completely different color variant, fabric pattern, or product category, please return the existing item for a refund or store credit and place a new drop order.</li>
            </ul>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Self-Service Online Exchange Booking
              </h2>
            </div>
            <p>
              You can lodge an exchange request in less than 60 seconds without having to dial customer support:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Log in to your account and go to <strong className="text-white">Profile → Order History</strong>.</li>
              <li>Locate your delivered drop and tap on <strong className="text-yellow-400">"Exchange Garment"</strong>.</li>
              <li>Select your replacement size from live stock availability indicators.</li>
              <li>Confirm your doorstep pickup address and submit. An exchange AWB will be generated immediately.</li>
            </ol>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Reverse Pickup & Handover Protocols
              </h2>
            </div>
            <p>
              Once your exchange is booked:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Our express courier partner will arrive at your registered address within <strong className="text-white">24 to 48 hours</strong>.</li>
              <li>Keep the garment ready inside the original Snitch box.</li>
              <li>A verification OTP will be sent to your mobile phone. Share this OTP with the pickup executive to validate collection.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Replacement Dispatch Timelines
              </h2>
            </div>
            <p>
              Depending on logistics coverage in your city:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Express Swap (Selected Metros):</strong> Courier delivers the replacement garment and collects the original in a single visit.</li>
              <li><strong className="text-white">Standard Exchange:</strong> The replacement size is automatically dispatched within 24 hours of the pickup scan or quality audit completion at our center.</li>
              <li>You will receive a new tracking link for your replacement garment via SMS and email.</li>
            </ul>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Out-of-Stock Policy on Limited Drops
              </h2>
            </div>
            <p>
              Due to the exclusive limited edition runs of our streetwear releases, requested replacement sizes may occasionally sell out while in transit:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>If your preferred replacement size is no longer available in inventory, our care team will contact you immediately.</li>
              <li>You may opt for <strong className="text-yellow-400">100% full refund</strong> to your original payment method or an instant store credit code loaded with a 5% bonus perk for future drops.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Secondary Exchanges & Policy Limits
              </h2>
            </div>
            <p>
              While the initial exchange is 100% complimentary, secondary exchanges on the same order line item:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Are evaluated on a case-by-case basis by our senior fulfillment supervisor.</li>
              <li>A nominal reverse courier charge of ₹120 will be applicable to cover additional freight handling.</li>
              <li>Replacement items received via exchange remain eligible for a return within 3 days if still unsatisfactory.</li>
            </ul>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Fit Consultation & Size Helpdesk
              </h2>
            </div>
            <p>
              Unsure whether you should size up or size down for oversized vs regular cuts?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Stylist & Fit Assistance</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">exchange@snitch.co.in</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Share your chest & waist measurements for instant size recommendations</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Direct Exchange Desk</span>
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

export default Exchange