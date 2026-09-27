import React from 'react'
import { Link } from 'react-router'

const UserPrivacy = () => {
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
              Legal, Compliance & Data Governance
            </span>
          </div>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            User Privacy & Data Policy
          </h1>
          <p className="text-zinc-500 text-xs mt-3 font-mono uppercase tracking-wider">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Compliant with Indian DPDP Act & Global Standards
          </p>
        </div>

        {/* Introduction Notice */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-sm p-4 sm:p-5 mb-10 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            !
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Your trust is our paramount asset. This Privacy Policy details how <strong className="text-white">Snitch Technologies Inc.</strong> collects, processes, encrypts, and protects your personal credentials, digital telemetry, and transactional data across all platform endpoints.
          </p>
        </div>

        {/* Detailed Points Container */}
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          {/* Point 1 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">01</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Personal Identifiers We Collect
              </h2>
            </div>
            <p>
              When you interact with our digital store or create an authenticated profile, we collect:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Identity Credentials:</strong> Full name, verified email address, and mobile phone number.</li>
              <li><strong className="text-white">Shipping & Billing Records:</strong> Street address, apartment/suite number, landmark, city, state, and 6-digit postal pincode.</li>
              <li><strong className="text-white">Wardrobe Fit Preferences:</strong> Sizing preferences, body fit specifications, and shopping bag choices saved to your profile.</li>
              <li><strong className="text-white">Authentication Proofs:</strong> Secure salted password hashes and OAuth token identifiers when signing in via Google.</li>
            </ul>
          </section>

          {/* Point 2 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">02</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Technical Telemetry & Browsing Footprint
              </h2>
            </div>
            <p>
              To safeguard our platform against malicious access, bot checkout spamming, and credential abuse:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>IP addresses, browser family, operating system versions, and screen resolutions are logged automatically.</li>
              <li>Session duration, drop navigation sequences, clickstreams, and referrer URLs are monitored for capacity optimization.</li>
              <li>Device fingerprinting is used exclusively to flag anomalous concurrent logins or brute-force attempts.</li>
            </ul>
          </section>

          {/* Point 3 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">03</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Purposes of Data Processing
              </h2>
            </div>
            <p>
              We process your data strictly under lawful legal bases for explicit e-commerce operations:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Fulfilling drop orders, dispatching shipments, and orchestrating reverse pickups.</li>
              <li>Generating GST-compliant tax invoices and managing accounts payable/receivable.</li>
              <li>Sending transactional order confirmations, tracking links, and critical security alerts.</li>
              <li>Preventing payment fraud, synthetic identity formation, and abusive chargeback claims.</li>
            </ul>
          </section>

          {/* Point 4 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">04</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Session Token Blacklisting & Authentication Security
              </h2>
            </div>
            <p>
              Snitch implements an industry-leading security architecture for user sessions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>All web API traffic is secured with 256-bit TLS/SSL encryption with HTTP Strict Transport Security (HSTS).</li>
              <li><strong className="text-white">Active Token Blacklisting:</strong> Every time you confirm a log out, your current access token is permanently registered in our central database blacklist. Even if intercepted, a logged-out token can never be reused.</li>
              <li>Password credentials are encrypted with multi-round Bcrypt cryptographic hashing algorithms and are never stored in human-readable plaintext.</li>
            </ul>
          </section>

          {/* Point 5 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">05</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Third-Party Disclosures & Verified Service Providers
              </h2>
            </div>
            <p>
              We strictly enforce a <strong className="text-yellow-400">Zero Third-Party Data Sale</strong> rule. Your private data is never traded or monetized. We share selective necessary fields solely with:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Logistics Couriers:</strong> Name, delivery address, and phone number shared with BlueDart, Delhivery, etc., to deliver your parcel.</li>
              <li><strong className="text-white">Payment Gateways:</strong> Encrypted transaction values routed via PCI-DSS Level 1 compliant gateway partners (e.g. Razorpay).</li>
              <li><strong className="text-white">SMS & Communication Gateways:</strong> Phone numbers provided to telecom service gateways solely for OTP and tracking dispatches.</li>
            </ul>
          </section>

          {/* Point 6 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">06</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Cookies, Local Storage & Session State
              </h2>
            </div>
            <p>
              Our web application utilizes minimal essential client-side storage technologies:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Essential Cookies:</strong> Required to maintain authentication status, shopping bag persistence, and CSRF token defenses.</li>
              <li><strong className="text-white">Performance Cookies:</strong> Aggregated, anonymized page performance metrics to detect slow drop load times.</li>
              <li>You may disable non-essential cookies via your browser preferences without losing primary shopping capabilities.</li>
            </ul>
          </section>

          {/* Point 7 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">07</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Data Retention & Archival Schedules
              </h2>
            </div>
            <p>
              We retain user records only as long as necessary to fulfill contractual agreements and statutory compliance:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li>Active member profiles are maintained indefinitely until account closure is requested by the user.</li>
              <li>Tax invoices, financial receipts, and GST filings are legally retained for 7 financial years in accordance with Indian tax laws.</li>
              <li>Blacklisted tokens are purged automatically upon expiration of their validity window.</li>
            </ul>
          </section>

          {/* Point 8 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">08</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Your Privacy Rights & Account Data Deletion
              </h2>
            </div>
            <p>
              Under the Digital Personal Data Protection (DPDP) Act and global privacy frameworks:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1 text-xs sm:text-sm">
              <li><strong className="text-white">Right to Access:</strong> You can request a digital copy of all personal records associated with your account.</li>
              <li><strong className="text-white">Right to Correction:</strong> Update outdated delivery addresses, contact numbers, or names anytime in Account Settings.</li>
              <li><strong className="text-white">Right to Erasure ("Right to Be Forgotten"):</strong> Request full permanent deletion of your account and associated personal data by emailing our privacy desk.</li>
            </ul>
          </section>

          {/* Point 9 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">09</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Protection of Minors & Age of Majority
              </h2>
            </div>
            <p>
              The Snitch platform is intended exclusively for individuals who have reached the age of majority (18 years or older) or minors utilizing the platform under direct parental or legal guardian supervision. We do not knowingly solicit or collect personal records from children under the age of 16.
            </p>
          </section>

          {/* Point 10 */}
          <section className="bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-sm p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono text-xs font-black px-2 py-0.5 bg-yellow-400/10 rounded-xs border border-yellow-400/20">10</span>
              <h2 className="text-white text-base sm:text-lg font-bold uppercase tracking-wider">
                Grievance Officer & Regulatory Contact
              </h2>
            </div>
            <p>
              In compliance with the Information Technology Act 2000 and DPDP guidelines, our designated Grievance Officer details are published below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Data Privacy & Grievance Officer</span>
                <span className="text-white font-bold block mt-1">Mr. Aryan Varma</span>
                <span className="text-yellow-400 font-mono text-xs block mt-0.5">grievance@snitch.co.in</span>
                <span className="text-zinc-500 text-[11px] block mt-1">Snitch Technologies Inc., Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px] block font-bold">Turnaround SLA</span>
                <span className="text-white font-bold block mt-1">Acknowledgement: 24 Hours</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Resolution SLA: Within 15 business days</span>
                <span className="text-yellow-400 font-mono text-xs block mt-1">+91 98765 43210</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default UserPrivacy