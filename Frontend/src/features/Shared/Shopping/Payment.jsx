import React from 'react'
import { Link } from 'react-router'

const Payment = () => {
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
              Shopping, Security & Financial Infrastructure
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Payment Methods & Security Policy
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • 256-Bit SSL Encrypted Checkout
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            At <strong className="text-white">Snitch</strong>, financial safety and checkout frictionless speed are backed by bank-grade security protocols. Below you will find comprehensive documentation on supported payment channels, fraud prevention systems, and failure resolution workflows.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Comprehensive Supported Payment Channels
              </h2>
            </div>
            <p>
              Snitch provides a full array of modern digital checkout instruments tailored for Indian shoppers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-mono text-xs font-bold uppercase block">UPI & QR</span>
                <span className="text-white text-xs font-bold block mt-1">Google Pay, PhonePe, Paytm, CRED</span>
                <span className="text-zinc-500 text-[11px] block mt-1">Direct app-to-app zero-latency checkout</span>
              </div>
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-mono text-xs font-bold uppercase block">Cards</span>
                <span className="text-white text-xs font-bold block mt-1">Visa, Mastercard, RuPay, Amex</span>
                <span className="text-zinc-500 text-[11px] block mt-1">Domestic & International credit/debit cards</span>
              </div>
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-mono text-xs font-bold uppercase block">Net Banking</span>
                <span className="text-white text-xs font-bold block mt-1">50+ Major Indian Banks</span>
                <span className="text-zinc-500 text-[11px] block mt-1">HDFC, ICICI, SBI, Axis, Kotak, etc.</span>
              </div>
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-yellow-400 font-mono text-xs font-bold uppercase block">COD</span>
                <span className="text-white text-xs font-bold block mt-1">Cash on Delivery</span>
                <span className="text-zinc-500 text-[11px] block mt-1">Doorstep cash & UPI-on-delivery options</span>
              </div>
            </div>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Zero Hidden Surcharges & Convenience Transparency
              </h2>
            </div>
            <p>
              We firmly reject predatory checkout fees:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>All prepaid transactions (UPI, Credit/Debit Cards, Net Banking) incur <strong className="text-yellow-400">0% convenience surcharge</strong>.</li>
              <li>Garment prices displayed on the product catalog are fully inclusive of all applicable indirect central and state taxes.</li>
              <li>Transparent breakdown of item subtotal, applicable taxes (18% GST), and handling is explicitly rendered prior to final order confirmation.</li>
            </ul>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                256-Bit SSL Encryption & PCI-DSS Level 1 Compliance
              </h2>
            </div>
            <p>
              Your sensitive card information is never compromised:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>All transaction streams are shielded with SHA-256 with RSA encryption and end-to-end tokenization.</li>
              <li>Snitch does not retain, view, or log your card numbers, CVV security codes, or net banking passwords on internal servers.</li>
              <li>Payment gateways integrated with our application comply with the stringent <strong className="text-white">PCI-DSS Level 1 (Payment Card Industry Data Security Standard)</strong> certification.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Two-Factor Authentication & 3D Secure Protocols
              </h2>
            </div>
            <p>
              In accordance with Reserve Bank of India (RBI) mandates, all domestic card payments require Two-Factor Authentication (2FA) via a dynamic One-Time Password (OTP) or cardholder biometric verification. Transactions cannot be finalized without explicit banking authorization from your registered mobile device.
            </p>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Cash on Delivery (COD) Rules & Thresholds
              </h2>
            </div>
            <p>
              For customers preferring cash payment upon doorstep arrival:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>COD is available for cart values ranging between <strong className="text-white">₹499 and ₹9,999</strong> across serviceable pin codes.</li>
              <li>High-value drops exceeding ₹10,000 must be finalized via prepaid channels to minimize transit cash handling risks.</li>
              <li>A mobile OTP confirmation or automated WhatsApp prompt may be triggered before dispatch to verify physical buyer intent.</li>
              <li>Most courier executives carry portable QR scanners enabling you to pay via UPI at the doorstep even if you chose COD.</li>
            </ul>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Payment Failures & Auto-Reversal Workflows
              </h2>
            </div>
            <p>
              What happens if money was deducted from your bank but your drop order failed to generate?
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>This occasional anomaly is known as an <strong className="text-white">"In-Flight Timeout"</strong> caused by sudden network dropouts between your bank server and the payment gateway.</li>
              <li>Our automated reconciliation bot scans unsettled captures every 60 minutes.</li>
              <li>If the payment cannot be linked to a confirmed order ID, a <strong className="text-yellow-400">100% full automatic reversal</strong> is triggered within 24 to 48 hours back to your original source account.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Multi-Currency & International Card Settlement
              </h2>
            </div>
            <p>
              Snitch welcomes global streetwear enthusiasts:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>We accept international credit cards issued by Visa, Mastercard, and American Express.</li>
              <li>Transactions are processed in Indian Rupees (INR). Your card issuer will apply standard forex conversion rates and international transaction fees as dictated by your local banking policy.</li>
            </ul>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Automated Fraud Detection & Risk Scoring
              </h2>
            </div>
            <p>
              Our automated checkout security engine monitors all transactions in real time:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Transactions exhibiting anomalous velocity, high-risk proxy IP networks, or mismatched billing-shipping geo-coordinates are flagged for manual security screening.</li>
              <li>Snitch reserves the right to void any transaction deemed high risk for credit card cloning or stolen credential abuse.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Tax Compliance, GST Billing & Invoicing
              </h2>
            </div>
            <p>
              Every transaction completed on the platform is legally recorded under Indian Goods and Services Tax (GST) provisions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>A digitally signed tax invoice showing HSN clothing codes, CGST, SGST, or IGST breakdowns is sent to your email upon dispatch.</li>
              <li>Customers requiring B2B GST invoices with company GSTIN input tax credit can enter their business tax details during checkout.</li>
            </ul>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Payment Assistance & Billing Escalation Desk
              </h2>
            </div>
            <p>
              Encountered an issue with double deduction or need a bank reconciliation certificate?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Billing & Payment Desk</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">payments@snitch.co.in</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Please attach payment screenshot or bank SMS reference ID</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Priority Finance Helpline</span>
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

export default Payment