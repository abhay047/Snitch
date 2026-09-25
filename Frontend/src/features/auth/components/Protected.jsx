import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router'
import { useAuth } from '../hook/useAuth.js'

const Protected = ({ children, role = "buyer" }) => {
  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)
  const { handleBecomeSeller } = useAuth()
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 text-xs uppercase tracking-widest">Loading Snitch Studio...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role === "seller" && user.role !== "seller") {
    const handleUpgrade = async () => {
      setUpgrading(true)
      setUpgradeError(null)
      try {
        await handleBecomeSeller()
      } catch (err) {
        setUpgradeError(err.response?.data?.message || 'Failed to activate seller account.')
      } finally {
        setUpgrading(false)
      }
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-zinc-800 bg-zinc-950/80 p-8 rounded-sm text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.614A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 0 0 2.25 1.015c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 0c.896 0 1.7-.393 2.25-1.015" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-xl font-black uppercase tracking-tight">Seller Studio Access Required</h2>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              Your account (<span className="text-white font-mono">{user.email}</span>) is currently registered as a buyer. Upgrade to a Seller account to create drops and manage inventory.
            </p>
          </div>

          {upgradeError && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-sm text-red-400 text-xs">
              {upgradeError}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-3.5 px-4 text-xs tracking-widest uppercase rounded-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {upgrading ? 'Activating Seller Mode...' : 'Activate Seller Account'}
            </button>

            <Link
              to="/"
              className="block w-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-white py-3 text-xs tracking-wider uppercase rounded-sm transition-colors"
            >
              Back to Snitch Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default Protected