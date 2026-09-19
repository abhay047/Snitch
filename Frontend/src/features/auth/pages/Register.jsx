import { useState } from 'react'
import {useAuth} from "../hook/useAuth.js"
import { useNavigate, Link } from 'react-router'

const Register = () => {

  const { handleRegister } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false,
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleRegister({
      fullname: form.fullName,
      email: form.email,
      contact: form.contact,
      password: form.password,
      isSeller: form.isSeller,
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden">

        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.03)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_60%)]" />

        {/* Premium white partition line */}
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Top — Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <img src="/Logo.png" alt="Snitch" className="w-8 h-8 object-contain" />
            <span className="text-white font-bold text-xl tracking-[0.2em] uppercase">Snitch</span>
          </div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase">Fashion. Reimagined.</p>
        </div>

        {/* Middle — Editorial */}
        <div className="relative space-y-10">
          <div>
            <p className="text-yellow-400 text-xs tracking-[0.3em] uppercase mb-6">The New Standard</p>
            <h2 className="text-white font-black leading-none tracking-tight">
              <span className="block text-6xl xl:text-7xl">WEAR</span>
              <span className="block text-6xl xl:text-7xl text-zinc-700">WHAT</span>
              <span className="block text-6xl xl:text-7xl">YOU</span>
              <span className="block text-6xl xl:text-7xl text-yellow-400">ARE.</span>
            </h2>
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-yellow-400/50" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            {[
              { number: '50K+', label: 'Products' },
              { number: '120+', label: 'Brands' },
              { number: '1M+', label: 'Customers' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white text-2xl font-bold tracking-tight">{stat.number}</p>
                <p className="text-zinc-600 text-xs tracking-widest uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Categories */}
        <div className="relative">
          <p className="text-zinc-700 text-xs tracking-widest uppercase mb-4">Explore</p>
          <div className="flex flex-wrap gap-2">
            {['Men', 'Women', 'Streetwear', 'Luxury', 'Ethnic', 'Activewear'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 border border-zinc-800 text-zinc-500 text-xs tracking-widest uppercase rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 lg:py-0 lg:px-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <img src="/Logo.png" alt="Snitch" className="w-7 h-7 object-contain" />
            <span className="text-white font-bold text-lg tracking-[0.2em] uppercase">Snitch</span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <p className="text-yellow-400 text-xs tracking-[0.3em] uppercase mb-4">Step 1 of 1</p>
            <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3">
              JOIN<br />
              <span className="text-zinc-600">THE</span><br />
              CLUB.
            </h1>
            <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
              Create your free account and unlock exclusive drops, early access sales, and curated style picks.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">
                  Contact
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  required
                  className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="6 to 12 characters"
                  required
                  className="w-full bg-transparent border-b border-zinc-800 py-3 pr-16 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-0 bottom-3 text-zinc-600 hover:text-yellow-400 text-[10px] tracking-widest uppercase transition-colors duration-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* isSeller */}
            <div className="py-1">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    name="isSeller"
                    checked={form.isSeller}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border border-zinc-700 rounded-sm peer-checked:border-yellow-400 peer-checked:bg-yellow-400 transition-all duration-200 group-hover:border-zinc-500" />
                  <svg
                    className="absolute inset-0 w-4 h-4 p-0.5 text-zinc-950 opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-zinc-300 text-sm font-medium">I want to sell on Snitch</p>
                  <p className="text-zinc-600 text-xs mt-0.5 leading-relaxed">
                    List your clothing brand and reach over 1M+ fashion-forward shoppers.
                  </p>
                </div>
              </label>
            </div>

            {/* CTA */}
            <div className="pt-2 space-y-4">
              <button
                type="submit"
                className="group w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black py-4 text-xs tracking-[0.3em] uppercase transition-all duration-200 rounded-sm cursor-pointer flex items-center justify-center gap-3"
              >
                Create Account
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-900" />
                <span className="text-zinc-700 text-xs tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-900" />
              </div>

              <a
                href="/api/auth/google"
                className="w-full border border-zinc-800 hover:border-zinc-700 bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 hover:text-white font-medium py-3.5 text-xs tracking-wider uppercase transition-all duration-200 rounded-sm flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </a>

              <p className="text-zinc-600 text-sm">
                Already a member?{' '}
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200">
                  Sign in
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>

    </div>
  )
}

export default Register