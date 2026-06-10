import { useState } from "react";
import { Eye, EyeOff, LogIn, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppLogo from "../components/AppLogo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login({
      login: form.username.trim(),
      password: form.password,
    });

    if (!success) {
      alert("Invalid credentials ❌");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl flex overflow-hidden min-h-[600px] border border-slate-200">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 to-blue-950 px-10 py-12 flex-col justify-center gap-10 relative">

          <div className="max-w-md">
            {/* Logo + Title */}
            <div className="flex items-center gap-4">
              <AppLogo size="xl" variant="dark" />
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Manage projects, reports, materials, machinery, labour and stock
              from one premium dashboard experience built for smooth daily operations.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span className="text-slate-300 text-sm">
                  Real-time inventory tracking
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span className="text-slate-300 text-sm">
                  Automated daily reports
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span className="text-slate-300 text-sm">
                  Secure role-based access control
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-10 lg:px-14">

          <div className="w-full max-w-sm mx-auto text-left">

            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <AppLogo size="xl" variant="light" />
            </div>

            {/* Heading */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Welcome back
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Sign in to your account
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  placeholder="Enter username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 pr-12 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full h-11 mt-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            </form>

            {/* Footer */}
            <p className="mt-4 text-sm text-center text-slate-500">
              Don’t have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </p>
            <p className="mt-2 text-sm text-center text-slate-500">
              Employee?{" "}
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={() => navigate("/employee")}
              >
                Download ID card
              </span>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}