import React from 'react'
import { Link } from 'react-router'

const ShippingAndDelivery = () => {
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
              Customer Support & Logistics
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Verified Logistics Guide
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            At <strong className="text-white">Snitch</strong>, we operate a dedicated high-priority logistics network to ensure that our limited garment drops reach you in pristine collector condition. Please review our comprehensive shipping policies, transit timelines, and dispatch workflows outlined below.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Order Processing & Dispatch Windows
              </h2>
            </div>
            <p>
              Every order placed on the Snitch platform undergoes automated inventory allocation and payment verification:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Standard Drops:</strong> Dispatched within 24 to 48 business hours from our central fulfillment hubs.</li>
              <li><strong className="text-white">Daily Order Cut-off:</strong> Orders confirmed before 12:00 PM IST on working days (Monday – Saturday) are scheduled for same-day packing and courier handover.</li>
              <li><strong className="text-white">Limited Archival Releases:</strong> During heavy drop periods, processing may take up to 72 hours due to rigorous individual garment quality inspections.</li>
            </ul>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Domestic Estimated Delivery Timelines
              </h2>
            </div>
            <p>
              Once your garment leaves our fulfillment center, estimated transit times vary by destination zone:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-bold text-xs uppercase block">Tier 1 Metros</span>
                <span className="text-white font-mono text-sm block mt-1">2 – 3 Business Days</span>
                <span className="text-zinc-500 text-[11px] block mt-1">Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata</span>
              </div>
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-bold text-xs uppercase block">Tier 2 & 3 Cities</span>
                <span className="text-white font-mono text-sm block mt-1">4 – 6 Business Days</span>
                <span className="text-zinc-500 text-[11px] block mt-1">State capitals, major industrial hubs, and tier 2 districts</span>
              </div>
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-bold text-xs uppercase block">Special Zones</span>
                <span className="text-white font-mono text-sm block mt-1">7 – 10 Business Days</span>
                <span className="text-zinc-500 text-[11px] block mt-1">North-Eastern states, Jammu & Kashmir, and remote islands</span>
              </div>
            </div>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Shipping Tariffs & Complimentary Free Delivery
              </h2>
            </div>
            <p>
              We believe in transparent pricing with zero surprise surcharges:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-yellow-400">100% Free Shipping:</strong> Applicable on all prepaid orders (UPI, Cards, Net Banking) nationwide with no minimum cart order required.</li>
              <li><strong className="text-white">Cash on Delivery (COD) Convenience Fee:</strong> A nominal flat handling fee of ₹79 is applied to cover courier collection and remittance overheads.</li>
              <li><strong className="text-white">Promotional Drops:</strong> Special drops featuring complimentary express courier tags will have all handling fees waived.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Real-Time Tracking & Express Logistics Partners
              </h2>
            </div>
            <p>
              We partner exclusively with certified express 3PL logistics networks including <strong className="text-white">Blue Dart, Delhivery, XpressBees, and Shadowfax</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Upon handover to the courier, an SMS and Email notification containing your 12-digit AWB tracking number will be triggered automatically.</li>
              <li>Track your shipment status live in real-time from your order history dashboard on the Snitch web portal.</li>
              <li>Receive automated WhatsApp milestone updates when your drop is Out for Delivery.</li>
            </ul>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Split Shipments for Multi-Garment Drops
              </h2>
            </div>
            <p>
              In cases where your shopping bag contains pieces from multiple independent sellers or distinct regional warehouses:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Garments may be dispatched in separate packages to ensure fastest possible delivery.</li>
              <li>You will receive individual tracking numbers for each package at no extra cost.</li>
              <li>All packages are covered under the single consolidated invoice generated at checkout.</li>
            </ul>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Heavy-Duty Tamper-Evident Packaging
              </h2>
            </div>
            <p>
              To safeguard streetwear luxury garments against transit damage, dampness, and theft:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Every piece is wrapped in a protective waterproof poly garment pouch inside a reinforced matte-black Snitch box.</li>
              <li>Outer polybags are sealed with tamper-evident security tape.</li>
              <li><strong className="text-white">Important:</strong> If you observe any physical tears, broken tape, or tampered outer seals upon courier delivery, please refuse the delivery immediately and notify our care desk.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Delivery Attempts & Return to Origin (RTO)
              </h2>
            </div>
            <p>
              Our courier partners follow standardized delivery attempt protocols:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Couriers will attempt doorstep delivery a minimum of <strong className="text-white">3 times</strong> on consecutive business days.</li>
              <li>You will receive an automated phone call or SMS alert prior to each delivery attempt.</li>
              <li>If the parcel remains uncollected after 3 attempts or due to incorrect customer phone/address details, it will be marked as Return to Origin (RTO).</li>
              <li>Prepaid orders returned as RTO will be refunded to your original payment source minus nominal forward and reverse shipping costs.</li>
            </ul>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Address Modification & Delivery Instructions
              </h2>
            </div>
            <p>
              Need to alter your delivery address after completing checkout?
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Address changes can only be accommodated within <strong className="text-white">2 hours</strong> of order placement before shipment labels are generated.</li>
              <li>Once an order is handed over to the courier partner, addresses cannot be rerouted to a different postal pincode.</li>
              <li>Special instructions (e.g. "Leave with building concierge" or "Deliver after 4 PM") can be provided directly to the courier agent when contacted via the Out for Delivery phone call.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Force Majeure & Uncontrollable Delays
              </h2>
            </div>
            <p>
              While 98.4% of Snitch deliveries arrive ahead of schedule, occasional delays may occur due to external circumstances beyond our operational control, including severe weather events, regional strikes, national holidays, airline cargo congestion, or localized containment orders. In such situations, our customer support team proactively updates your tracking status.
            </p>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Dedicated Logistics Support & Inquiries
              </h2>
            </div>
            <p>
              Have questions regarding your shipment or need priority courier coordination?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Email Support</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">shipping@snitch.co.in</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Response turnaround within 12 business hours</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">WhatsApp Logistics Desk</span>
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

export default ShippingAndDelivery