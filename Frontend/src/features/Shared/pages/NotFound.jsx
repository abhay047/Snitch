import React from 'react'
import { Link } from 'react-router'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex flex-col justify-between selection:bg-yellow-400 selection:text-black relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Pure Element Shake Animation (No RGB Colors on the text) */}
      <style>{`
        @keyframes element-shake-heavy {
          0% { transform: translate(0, 0) rotate(0deg); }
          4% { transform: translate(-8px, 4px) rotate(-1.5deg); }
          8% { transform: translate(7px, -6px) rotate(1deg); }
          12% { transform: translate(-10px, -2px) rotate(-1deg); }
          16% { transform: translate(9px, 5px) rotate(1.5deg); }
          20% { transform: translate(-6px, 3px) rotate(0deg); }
          24% { transform: translate(0, 0) rotate(0deg); }
          40% { transform: translate(0, 0) rotate(0deg); }
          44% { transform: translate(-12px, -5px) rotate(-2deg); }
          48% { transform: translate(13px, 6px) rotate(2deg); }
          52% { transform: translate(-9px, 4px) rotate(-1deg); }
          56% { transform: translate(11px, -4px) rotate(1.5deg); }
          60% { transform: translate(-5px, 2px) rotate(0deg); }
          64% { transform: translate(0, 0) rotate(0deg); }
          80% { transform: translate(0, 0) rotate(0deg); }
          84% { transform: translate(10px, -5px) rotate(1.5deg); }
          88% { transform: translate(-11px, 6px) rotate(-2deg); }
          92% { transform: translate(8px, -3px) rotate(1deg); }
          96% { transform: translate(-5px, 2px) rotate(0deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        @keyframes element-shake-light {
          0% { transform: translate(0, 0); }
          5% { transform: translate(6px, -3px); }
          10% { transform: translate(-7px, 4px); }
          15% { transform: translate(8px, 2px); }
          20% { transform: translate(-6px, -3px); }
          25% { transform: translate(0, 0); }
          41% { transform: translate(0, 0); }
          45% { transform: translate(-9px, 4px); }
          49% { transform: translate(10px, -4px); }
          53% { transform: translate(-8px, 3px); }
          57% { transform: translate(6px, -2px); }
          61% { transform: translate(0, 0); }
          81% { transform: translate(0, 0); }
          85% { transform: translate(7px, -4px); }
          89% { transform: translate(-8px, 5px); }
          93% { transform: translate(6px, -2px); }
          97% { transform: translate(0, 0); }
          100% { transform: translate(0, 0); }
        }

        .shake-heavy {
          display: block;
          animation: element-shake-heavy 2s infinite ease-in-out;
        }

        .shake-light {
          display: block;
          animation: element-shake-light 2s infinite ease-in-out;
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo.png"
              alt="Snitch"
              className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-white font-black text-lg tracking-[0.25em] uppercase">
              Snitch
            </span>
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

      {/* 404 Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 relative z-10">
        <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto">
          {/* 1. Shaking 404 */}
          <div className="shake-heavy select-none w-full">
            <h1 className="text-9xl sm:text-[13rem] md:text-[15rem] lg:text-[17rem] font-black tracking-tighter text-white select-none leading-none">
              404
            </h1>
          </div>

          {/* 2. Shaking Page Not Found - Strictly Placed Directly Below 404 */}
          <div className="shake-light select-none w-full mt-4 sm:mt-6">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-white">
              Page Not Found
            </h2>
          </div>

          {/* 3. Description Subtext Below */}
          <p className="text-zinc-500 text-xs sm:text-sm font-mono uppercase tracking-wider mt-6 max-w-md mx-auto">
            The page you are looking for does not exist.
          </p>
        </div>
      </main>

      {/* Bottom spacer for centered balance */}
      <div className="h-16" />
    </div>
  )
}

export default NotFound
