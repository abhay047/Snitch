import React from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'

/**
 * Shared Footer Component for Snitch
 * Designed for universal reuse across the entire application without route modifications.
 *
 * Props:
 * - className (string): Optional custom outer container classes.
 * - hidePerks (boolean): Set true to hide the top value/perks banner.
 */
const Footer = ({
  className = '',
  hidePerks = false,
}) => {
  const user = useSelector((state) => state.auth?.user)
  const isSeller = user?.role === 'seller'

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <footer
      className={`border-t border-zinc-900 bg-[#080808] text-zinc-400 relative z-10 transition-colors ${className}`}
    >
      {/* ── TOP PERKS / VALUE PROPOSITIONS BANNER ── */}
      {!hidePerks && (
        <div className="border-b border-zinc-900/80 bg-zinc-950/60 py-6 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Perk 1 */}
            <div className="flex items-center gap-3 p-3 rounded-sm border border-zinc-900/60 bg-zinc-900/20">
              <div className="w-9 h-9 rounded-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 3.75a3 3 0 0 1 3 3v4.5m-3-7.5h-4.5m4.5 0V3.75M12 7.5H6.75a3 3 0 0 0-3 3v4.5m0-7.5V3.75m0 3.75a3 3 0 0 1 3-3" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider truncate">
                  Express Delivery
                </h4>
                <p className="text-zinc-500 text-[11px] truncate mt-0.5">
                  Priority dispatch across India
                </p>
              </div>
            </div>

            {/* Perk 2 */}
            <div className="flex items-center gap-3 p-3 rounded-sm border border-zinc-900/60 bg-zinc-900/20">
              <div className="w-9 h-9 rounded-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider truncate">
                  100% Authentic
                </h4>
                <p className="text-zinc-500 text-[11px] truncate mt-0.5">
                  Verified luxury drops only
                </p>
              </div>
            </div>

            {/* Perk 3 */}
            <div className="flex items-center gap-3 p-3 rounded-sm border border-zinc-900/60 bg-zinc-900/20">
              <div className="w-9 h-9 rounded-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider truncate">
                  Easy Exchange
                </h4>
                <p className="text-zinc-500 text-[11px] truncate mt-0.5">
                  Hassle-free garment returns
                </p>
              </div>
            </div>

            {/* Perk 4 */}
            <div className="flex items-center gap-3 p-3 rounded-sm border border-zinc-900/60 bg-zinc-900/20">
              <div className="w-9 h-9 rounded-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider truncate">
                  Secure Checkout
                </h4>
                <p className="text-zinc-500 text-[11px] truncate mt-0.5">
                  256-Bit SSL protection
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN FOOTER NAVIGATION & BRAND AREA ── */}
      <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ── COLUMN 1: BRAND IDENTITY & SOCIALS (4 cols on lg) ── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Brand Logo & Name */}
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/Logo.png"
                alt="Snitch Logo"
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105 duration-200"
              />
              <span className="text-white font-black text-xl tracking-[0.25em] uppercase">
                Snitch
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse ml-0.5" />
            </Link>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              A contemporary online luxury streetwear & high-fashion collective. Redefining modern wardrobe aesthetics through limited drops, signature cuts, and refined craftsmanship.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500 block mb-3">
                Connect With The Movement
              </span>
              <div className="flex items-center gap-2.5">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snitch on Instagram"
                  className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snitch on X"
                  className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snitch on YouTube"
                  className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snitch Discord Community"
                  className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* ── COLUMN 2: EXPLORE & SHOP (3 cols on lg) ── */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-1 h-3 bg-yellow-400 rounded-xs" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Latest Drops
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Shopping Bag
                </Link>
              </li>
              {!user ? (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-yellow-400 transition-colors inline-block"
                    >
                      Member Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="hover:text-yellow-400 transition-colors inline-block"
                    >
                      Join Club
                    </Link>
                  </li>
                </>
              ) : isSeller ? (
                <>
                  <li>
                    <Link
                      to="/seller/dashboard"
                      className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors inline-block"
                    >
                      Seller Studio
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/seller/create-product"
                      className="hover:text-yellow-400 transition-colors inline-block"
                    >
                      Create Drop
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <span className="text-zinc-500 text-[11px] block font-mono">
                    Signed In: <span className="text-zinc-300 font-bold">{user.fullname?.split(' ')[0] || 'Member'}</span>
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* ── COLUMN 3: CUSTOMER CARE (3 cols on lg) ── */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-1 h-3 bg-yellow-400 rounded-xs" />
              <span>Customer Care</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/policy/shipping&delivery"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  to="/policy/return&refund"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/policy/exchange"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Garment Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/policy/Cancellation"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Order Cancellation
                </Link>
              </li>
              <li>
                <Link
                  to="/policy/payment"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Payment Methods & Security
                </Link>
              </li>
            </ul>
          </div>

          {/* ── COLUMN 4: LEGAL & GOVERNANCE (2 cols on lg) ── */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-1 h-3 bg-yellow-400 rounded-xs" />
              <span>Legal</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/policy/privacy"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policy/term&conditions"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/policy/payment"
                  className="hover:text-yellow-400 transition-colors inline-block"
                >
                  Payment Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SUB-FOOTER / COPYRIGHT & TRUST BADGES ── */}
      <div className="border-t border-zinc-900/80 bg-black/60 py-6 px-4 sm:px-6 lg:px-12 text-[11px] text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright & Tagline */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-center md:text-left">
            <span>© {new Date().getFullYear()} Snitch Technologies Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="uppercase tracking-widest text-zinc-400 font-mono text-[10px]">
              Wear What You Are
            </span>
          </div>

          {/* Payment Badges Strip */}
          <div className="flex items-center flex-wrap justify-center gap-2 font-mono text-[10px] text-zinc-400">
            <span className="px-2 py-0.5 rounded-xs bg-zinc-900/80 border border-zinc-800 text-zinc-400 uppercase">
              UPI
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-zinc-900/80 border border-zinc-800 text-zinc-400 uppercase">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-zinc-900/80 border border-zinc-800 text-zinc-400 uppercase">
              MASTERCARD
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-zinc-900/80 border border-zinc-800 text-zinc-400 uppercase">
              RUPAY
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-zinc-900/80 border border-zinc-800 text-zinc-400 uppercase">
              COD
            </span>
          </div>

          {/* System Status & Scroll To Top */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="w-7 h-7 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              title="Back to Top"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer