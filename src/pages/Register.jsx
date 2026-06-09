import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppLogo from "../components/AppLogo";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.password) {
      alert("All fields required ❗");
      return;
    }

    const success = await register(form);

    if (!success) {
      alert("Registration Failed ❌");
      return;
    }

    alert("Registered Successfully ✅");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl flex overflow-hidden min-h-[600px] border border-slate-200">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-center">

          {/* LOGO + TEXT */}
          <div className="flex items-center gap-4">
            <AppLogo size="lg" variant="dark" />

            <div>
              <h1 className="text-2xl xl:text-3xl font-bold text-white leading-tight">
               Towers
              </h1>
              <p className="text-sm text-slate-300">Build Smarter</p>
            </div>
          </div>

          <h2 className="text-white text-3xl mt-10 font-bold">
            Create Admin Account
          </h2>

        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex items-center justify-center bg-white">
          
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
              <AppLogo size="md" variant="light" />

              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Srilaxmi
                </h1>
                <p className="text-xs text-slate-500">Build Smarter</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <input
                placeholder="Name"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />

              <input
                placeholder="Email"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />

              <input
                placeholder="Phone"
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Register
              </button>

              <p className="text-sm text-center text-slate-500">
                Already have an account?{" "}
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}