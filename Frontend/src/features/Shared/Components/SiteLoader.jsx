import React, { useState, useEffect } from 'react'

const SiteLoader = () => {
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [activePhase, setActivePhase] = useState(0)

  const LETTERS = ['S', 'N', 'I', 'T', 'C', 'H']

  const PHASES = [
    'PREPARING YOUR PERSONALIZED ATELIER...',
    'SYNCING EXCLUSIVE LUXURY DROPS...',
    'OPTIMIZING DISPLAY & FIT PROTOCOLS...',
    'ALL SET • WELCOME TO SNITCH',
  ]

  useEffect(() => {
    let currentProgress = 0
    let timeoutId = null

    const tick = () => {
      if (currentProgress >= 100) return

      let increment = 1
      let nextDelay = 60

      // Natural Human-Like Dynamic Loading Curve:
      if (currentProgress < 18) {
        // 1. Fast initial burst (responsive start)
        increment = Math.floor(Math.random() * 3) + 2 // +2 to +4
        nextDelay = Math.floor(Math.random() * 25) + 30 // 30ms - 55ms (Fast)
      } else if (currentProgress < 38) {
        // 2. Steady cruise
        increment = Math.floor(Math.random() * 2) + 1 // +1 to +2
        nextDelay = Math.floor(Math.random() * 30) + 65 // 65ms - 95ms
      } else if (currentProgress < 50) {
        // 3. Realistic micro-slowdown / asset buffering pause (Slow)
        increment = Math.random() > 0.3 ? 1 : 0
        nextDelay = Math.floor(Math.random() * 60) + 130 // 130ms - 190ms (Noticeably slow)
      } else if (currentProgress < 76) {
        // 4. Sudden fast breakthrough surge (Fast)
        increment = Math.floor(Math.random() * 3) + 2 // +2 to +4
        nextDelay = Math.floor(Math.random() * 20) + 35 // 35ms - 55ms (Fast)
      } else if (currentProgress < 94) {
        // 5. Deliberate precision calibration (Slow & steady)
        increment = 1
        nextDelay = Math.floor(Math.random() * 40) + 90 // 90ms - 130ms (Careful)
      } else {
        // 6. Final quick snap to 100% (Fast finish)
        increment = Math.floor(Math.random() * 2) + 1
        nextDelay = 40 // 40ms
      }

      currentProgress = Math.min(100, currentProgress + increment)
      setProgress(currentProgress)

      if (currentProgress < 28) setActivePhase(0)
      else if (currentProgress < 62) setActivePhase(1)
      else if (currentProgress < 90) setActivePhase(2)
      else setActivePhase(3)

      if (currentProgress < 100) {
        timeoutId = setTimeout(tick, nextDelay)
      }
    }

    timeoutId = setTimeout(tick, 100)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Trigger staggered pillar exit when progress completes
  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true)
      }, 600)

      const finishTimer = setTimeout(() => {
        setIsFinished(true)
      }, 1950)

      return () => {
        clearTimeout(exitTimer)
        clearTimeout(finishTimer)
      }
    }
  }, [progress])

  const handleSkip = () => {
    setProgress(100)
    setIsExiting(true)
    setTimeout(() => setIsFinished(true), 600)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isFinished) return null

  const formattedProgress = progress < 10 ? `0${progress}` : `${progress}`

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto select-none overflow-hidden font-sans">
      {/* ── 4 STAGGERED OBSIDIAN ARCHITECTURAL PILLARS (THE SIGNATURE REVEAL) ── */}
      <div className="absolute inset-0 flex pointer-events-none z-10">
        {[0, 1, 2, 3].map((colIndex) => {
          // Staggered exit delays: 0ms, 110ms, 220ms, 330ms
          const delayStyle = isExiting
            ? { transitionDelay: `${colIndex * 110}ms` }
            : { transitionDelay: '0ms' }

          return (
            <div
              key={colIndex}
              style={delayStyle}
              className={`w-1/4 h-full bg-[#050505] border-r border-white/[0.035] transition-transform duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)] will-change-transform ${
                isExiting ? '-translate-y-full' : 'translate-y-0'
              }`}
            />
          )
        })}
      </div>

      {/* ── AMBIENT FAINT WATERMARK (ROMAN NUMERAL MMXXVI / 2026) ── */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-700 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-[17vw] font-black text-white/[0.018] tracking-[0.25em] select-none font-mono">
          MMXXVI
        </span>
      </div>

      {/* ── MAIN CONTENT CONTAINER (FADES SMOOTHLY PRIOR TO PILLAR ASCENT) ── */}
      <div
        className={`relative z-30 w-full h-full flex flex-col justify-between p-6 sm:p-12 transition-all duration-500 ease-out ${
          isExiting ? 'opacity-0 scale-98 filter blur-xs pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Central ambient luxury champagne glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.07)_0%,transparent_70%)] luxury-ambient-glow" />
        </div>

        {/* ── TOP HEADER ROW ── */}
        <div className="relative z-10 flex items-center justify-between text-zinc-500 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-zinc-300 font-bold tracking-[0.3em]">SNITCH OFFICIAL</span>
            <span className="hidden lg:inline text-zinc-700 font-mono text-[9px] tracking-widest">
              [ 19.0760° N, 72.8777° E ]
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-zinc-600 tracking-[0.25em]">
            <span>EDITION 2026</span>
            <span>•</span>
            <span>LIMITED ARCHIVE</span>
          </div>

          <div className="text-zinc-400 font-mono tracking-widest text-[10px] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>GLOBAL ACCESS</span>
          </div>
        </div>

        {/* ── CENTER EDITORIAL SECTION ── */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4 max-w-xl mx-auto w-full">
          {/* 1. WEBSITE LOGO IN GLASS PEDESTAL WITH GOLDEN HALO */}
          <div className="relative mb-5 sm:mb-6 group">
            <div className="absolute -inset-2.5 rounded-2xl border border-yellow-400/25 border-t-yellow-400/80 animate-spin [animation-duration:12s]" />
            <div className="absolute -inset-1 rounded-2xl border border-white/5" />

            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-yellow-400/15 p-3.5">
              <img
                src="/Logo.png"
                alt="Snitch Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* 2. KINETIC LETTER-BY-LETTER WEBSITE NAME "SNITCH" */}
          <div className="overflow-hidden flex items-center justify-center gap-1 sm:gap-2">
            {LETTERS.map((letter, idx) => (
              <span
                key={idx}
                className="overflow-hidden inline-block"
              >
                <span
                  style={{ animationDelay: `${idx * 70}ms` }}
                  className="letter-reveal text-white text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] luxury-gold-shimmer select-none inline-block"
                >
                  {letter}
                </span>
              </span>
            ))}
          </div>

          {/* 3. "LOADING FOR YOUR BETTER EXPERIENCE" BADGE & SUBTITLE */}
          <div className="mt-4 sm:mt-5 space-y-2 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/25 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
              <h2 className="text-yellow-400 font-bold text-xs sm:text-sm tracking-[0.2em] uppercase font-mono">
                Loading For Your Better Experience
              </h2>
            </div>
            <p className="text-zinc-400 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
              {PHASES[activePhase]}
            </p>
          </div>

          {/* ── 4. SWISS HOROLOGY INSPIRED GAUGE (PRECISION TICK RULER) ── */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center w-full max-w-xs sm:max-w-sm">
            {/* Massive Luxury Percentage Counter */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-white text-5xl sm:text-6xl font-extralight font-mono tracking-tighter">
                {formattedProgress}
              </span>
              <span className="text-yellow-400 font-mono tracking-widest text-xs uppercase">
                %
              </span>
            </div>

            {/* Precision Micro-Tick Dial Ruler */}
            <div className="w-full relative py-1.5">
              {/* Tick Marks Strip */}
              <div className="w-full flex justify-between items-center px-1 mb-1.5 opacity-40">
                {Array.from({ length: 21 }).map((_, i) => (
                  <span
                    key={i}
                    className={`block bg-zinc-600 transition-colors ${
                      i % 5 === 0
                        ? 'h-2.5 w-[1.5px] bg-yellow-400'
                        : 'h-1.5 w-[1px]'
                    }`}
                  />
                ))}
              </div>

              {/* Razor-Thin Gold Hairline Track */}
              <div className="w-full h-[1.5px] bg-zinc-900 rounded-full overflow-hidden relative border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-200 transition-all duration-150 ease-out shadow-[0_0_14px_rgba(250,204,21,0.9)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Minimalist Sub-Status */}
            <div className="mt-2 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span>{progress >= 100 ? 'ACCESS GRANTED' : 'CURATING COLLECTIONS...'}</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM FOOTER ROW ── */}
        <div className="relative z-10 flex items-center justify-between text-zinc-500 font-mono text-[9px] sm:text-[10px] tracking-[0.25em] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>AUTHENTICITY VERIFIED • BESPOKE QUALITY</span>
          </div>

          <div className="text-zinc-600 tracking-widest text-[9px] uppercase hidden sm:block">
            ALL RIGHTS RESERVED // 2026
          </div>
        </div>
      </div>
    </div>
  )
}

export default SiteLoader
