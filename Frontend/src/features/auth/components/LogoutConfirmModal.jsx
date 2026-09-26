import React from 'react'

const LogoutConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
  user = null,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={() => !isLoggingOut && onClose()}
    >
      <div
        className="bg-[#0a0a0a] border border-zinc-800 rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400" />

        {/* Close Button */}
        {!isLoggingOut && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white text-lg w-8 h-8 rounded-sm border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Cancel"
          >
            ✕
          </button>
        )}

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-[10px] tracking-[0.25em] uppercase font-bold">
                Session Control
              </span>
            </div>
            <h3 className="text-white text-xl font-black tracking-tight uppercase">
              Confirm Log Out
            </h3>
          </div>
        </div>

        {/* Body Text */}
        <p className="text-zinc-400 text-xs leading-relaxed mb-5">
          Are you sure you want to end your session? Your access token will be added to the secure blacklist and you will be signed out immediately.
        </p>

        {/* User Snapshot Card if available */}
        {user && (
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-sm p-3.5 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user.fullname ? user.fullname[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-bold truncate">
                  {user.fullname || 'Authenticated User'}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase">
                  {user.role || 'buyer'}
                </span>
              </div>
              <p className="text-zinc-500 text-[11px] truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onClose}
            className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-white py-3 text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black py-3 text-xs tracking-[0.15em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Yes, Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal
