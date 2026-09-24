import { useState } from "react";
import { useAuth } from "../hook/useAuth.js";
import { useNavigate, Link } from "react-router";
import ContinueWithGooglel from "../components/ContinueWithGooglel.jsx";

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await handleLogin({ email: form.email, password: form.password });
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
            <p className="text-yellow-400 text-xs tracking-[0.3em] uppercase mb-6">Welcome Back</p>
            <h2 className="text-white font-black leading-none tracking-tight">
              <span className="block text-6xl xl:text-7xl">BACK</span>
              <span className="block text-6xl xl:text-7xl text-zinc-700">IN</span>
              <span className="block text-6xl xl:text-7xl text-yellow-400">STYLE.</span>
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
            <p className="text-yellow-400 text-xs tracking-[0.3em] uppercase mb-4">Account Access</p>
            <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3">
              SIGN<br />
              <span className="text-zinc-600">IN</span><br />
              AGAIN.
            </h1>
            <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
              Enter your credentials to access your bag, saved items, and personalized feed.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300" />
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required className="w-full bg-transparent border-b border-zinc-800 py-3 pr-16 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-300" />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-0 bottom-3 text-zinc-600 hover:text-yellow-400 text-[10px] tracking-widest uppercase transition-colors duration-200">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <button type="submit" className="group w-full bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-zinc-950 font-black py-4 text-xs tracking-[0.3em] uppercase transition-all duration-200 rounded-sm cursor-pointer flex items-center justify-center gap-3">
                Sign In
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-900" />
                <span className="text-zinc-700 text-xs tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-900" />
              </div>

              <ContinueWithGooglel />

              <p className="text-zinc-600 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200">Create account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
