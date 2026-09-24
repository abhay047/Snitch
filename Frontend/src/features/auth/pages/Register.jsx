import { useState } from "react";
import { useAuth } from "../hook/useAuth.js";
import { useNavigate, Link } from "react-router";
import ContinueWithGooglel from "../components/ContinueWithGooglel.jsx";

const Register = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    isSeller: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await handleRegister({
      fullname: form.fullName,
      email: form.email,
      contact: form.contact,
      password: form.password,
      isSeller: form.isSeller,
    });
    if(user.role == "buyer"){
      navigate("/");
    } else if (user.role == "seller"){
      navigate("/seller/dashboard")
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.03)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.02)_0%,transparent_60%)]" />
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
          <div className="w-16 h-px bg-yellow-400/50" />
          <div className="grid grid-cols-3 gap-8">
            {[
              { number: "50K+", label: "Products" },
              { number: "120+", label: "Brands" },
              { number: "1M+", label: "Customers" },
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
            {["Men", "Women", "Streetwear", "Luxury", "Ethnic", "Activewear"].map((tag) => (
              <span key={tag} className="px-3 py-1 border border-zinc-800 text-zinc-500 text-xs tracking-widest uppercase rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">Full Name</label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300" />
              </div>
              <div className="space-y-2">
                <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">Contact</label>
                <input type="tel" name="contact" value={form.contact} onChange={handleChange} placeholder="+91 00000 00000" required className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300" />
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="6 to 12 characters" required className="w-full bg-transparent border-b border-zinc-800 py-3 pr-16 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300" />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-0 bottom-3 text-zinc-600 hover:text-yellow-400 text-[10px] tracking-widest uppercase transition-colors duration-200">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="py-1">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" name="isSeller" checked={form.isSeller} onChange={handleChange} className="sr-only peer" />
                  <div className="w-4 h-4 border border-zinc-700 rounded-sm peer-checked:border-yellow-400 peer-checked:bg-yellow-400 transition-all duration-200 group-hover:border-zinc-500" />
                  <svg className="absolute inset-0 w-4 h-4 p-0.5 text-zinc-950 opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-zinc-300 text-sm font-medium">I want to sell on Snitch</p>
                  <p className="text-zinc-600 text-xs mt-0.5 leading-relaxed">List your clothing brand and reach over 1M+ fashion-forward shoppers.</p>
                </div>
              </label>
            </div>

            <div className="pt-2 space-y-4">
              <button type="submit" className="group w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black py-4 text-xs tracking-[0.3em] uppercase transition-all duration-200 rounded-sm cursor-pointer flex items-center justify-center gap-3">
                Create Account
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-900" />
                <span className="text-zinc-700 text-xs tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-900" />
              </div>

              <ContinueWithGooglel />

              <p className="text-zinc-600 text-sm">
                Already a member?{" "}
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
