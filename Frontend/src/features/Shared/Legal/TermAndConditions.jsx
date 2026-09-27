import React from 'react'
import { Link } from 'react-router'

const TermAndConditions = () => {
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
              Legal Framework & Governance
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Master User Agreement
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Please carefully read these Terms and Conditions before utilizing the services, browsing garment catalogs, or completing drop transactions on <strong className="text-white">Snitch</strong>. Accessing this web portal implies unconditional acceptance of these terms.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Platform Overview & Legally Binding Agreement
              </h2>
            </div>
            <p>
              These Terms constitute a legally binding electronic agreement under the provisions of the Information Technology Act, 2000, between you ("User", "Buyer", or "Seller") and <strong className="text-white">Snitch Technologies Inc.</strong> governing all interactions with our domain, subdomains, APIs, and client portals.
            </p>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                User Account Integrity & Security Responsibilities
              </h2>
            </div>
            <p>
              When establishing an account on Snitch:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>You must provide truthful, complete, and accurate registration details. Impersonation of any person or legal entity is strictly forbidden.</li>
              <li>You are solely responsible for preserving the confidentiality of your account credentials and password.</li>
              <li>Any activity conducted under your authenticated session will be legally attributed to you unless unauthorized breach is reported immediately.</li>
            </ul>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Garment Cataloging, Studio Lighting & Color Variance
              </h2>
            </div>
            <p>
              We strive to display our garment cuts, silhouettes, and fabric colors with surgical accuracy:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Due to studio editorial lighting, screen calibration variances, and OLED/LCD rendering, slight color shade differences of up to 5% may occur between the photograph and the physical textile.</li>
              <li>Garment measurements specified in our sizing matrices represent standardized averages with an acceptable hand-tailoring tolerance of ±0.5 inches.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Limited Drops, Anti-Bot Protections & Order Limits
              </h2>
            </div>
            <p>
              Snitch garments are manufactured in scarce, batch-released drops:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Adding a piece to your cart does not constitute reserved inventory until checkout is concluded and payment is authenticated.</li>
              <li>We enforce strict anti-botting defenses. Automated scripting, mass scraping, or headless browser checkouts will result in immediate IP banning.</li>
              <li>Snitch reserves the right to cap maximum order quantities per user or household to discourage unauthorized secondary market reselling.</li>
            </ul>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Intellectual Property & Trademark Exclusivity
              </h2>
            </div>
            <p>
              All assets present on the Snitch platform — including the "Snitch" wordmark, brand logos, graphic streetwear prints, editorial photography, lookbooks, UI layouts, software code, and sound clips — are the protected intellectual property of Snitch Technologies Inc. Any reproduction, crawling, or derivative commercial exploitation without prior written consent is actionable under civil and criminal IP laws.
            </p>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                User Conduct & Prohibited Platform Activities
              </h2>
            </div>
            <p>
              Users agree not to engage in any of the following unauthorized actions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Attempting to probe, scan, or breach system vulnerabilities or bypass token blacklisting checks.</li>
              <li>Filing fraudulent chargebacks or initiating false courier non-delivery claims.</li>
              <li>Posting defamatory, abusive, or obscene material on product review and seller communication forums.</li>
              <li>Creating duplicate accounts to exploit welcome promo vouchers or referral bonuses.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Seller Marketplace Terms & Quality Assurance
              </h2>
            </div>
            <p>
              For verified sellers operating in our Seller Studio:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Sellers must guarantee 100% garment authenticity and hold legal rights to manufacture and distribute listed designs. Counterfeits result in immediate blacklisting and forfeiture of account balance.</li>
              <li>Sellers must maintain accurate stock counts and pack garments strictly within designated SLA windows.</li>
              <li>Sellers are subject to marketplace commission rates and settlement cycles defined in the Seller Studio Agreement.</li>
            </ul>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Limitation of Liability & Disclaimer of Warranties
              </h2>
            </div>
            <p>
              The platform and all merchandise are provided on an "as is" and "as available" basis. To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Snitch shall not be liable for indirect, incidental, or consequential damages arising from website downtime, carrier transit delays, or third-party payment gateway failures.</li>
              <li>Our aggregate financial liability for any dispute shall not exceed the total price paid by you for the specific garment order in question.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Account Suspension & Permanent Blacklisting
              </h2>
            </div>
            <p>
              Snitch reserves the unilateral right to suspend, terminate, or permanently blacklist any user profile or device ID without prior notice if fraudulent activity, repeated COD delivery refusals, abusive behavior, or material breaches of these Terms are detected.
            </p>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Governing Law, Jurisdiction & Dispute Resolution
              </h2>
            </div>
            <p>
              These Terms shall be interpreted and governed in accordance with the laws of India:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Judicial Jurisdiction</span>
                <p className="text-zinc-300 mt-1">Exclusive territorial jurisdiction shall reside in the competent courts situated in <strong className="text-white">Bengaluru, Karnataka, India</strong>.</p>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Legal & Compliance Notice</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">legal@snitch.co.in</span>
                <p className="text-zinc-400 text-[11px] mt-1">Attn: Legal & Regulatory Affairs, Snitch Technologies Inc.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default TermAndConditions