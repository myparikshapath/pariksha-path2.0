"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCursorGlow } from "@/hooks/useCursorGlow";
import { Eye, EyeOff } from "lucide-react"; // 👈 eye icons

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { ref, cursorPos } = useCursorGlow();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggle

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      if (res.data.requires_verification) {
        router.push(`/verify-otp?email=${form.email}&type=login`);
      } else {
        const userRole = res.data.user?.role === "admin" ? "admin" : "student";
        const { access_token, refresh_token } = res.data.tokens;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        login(access_token, refresh_token, userRole);

        if (res.data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      setError(axiosError.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-12 pb-12">
      <div
        ref={ref}
        className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(200px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(50,150,50,0.15), transparent 40%)`,
          }}
        />

        <h2 className="text-3xl font-bold mb-6 text-center text-[#2E4A3C]">
          Login
        </h2>
        <div className="mt-[-10px] h-1 w-24 mx-auto bg-yellow-400 rounded-full" />
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              required
            />
          </div>

          <div className="flex flex-col relative">
            <label className="mb-1 font-medium text-gray-700">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"} 
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-12"
              required
            />
            {/* Eye toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-600 hover:text-gray-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <Link
              href="/forgot-password"
              className="text-sm text-green-700 mt-1 hover:underline self-end"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E4A3C] text-white py-3 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105 font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 relative z-10">
          Not a user?{" "}
          <Link
            href="/register"
            className="text-[#2E4A3C] font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
