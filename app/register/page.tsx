"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useCursorGlow } from "@/hooks/useCursorGlow";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { ref, cursorPos } = useCursorGlow();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      const email = res.data.user?.email;

      alert("Registered successfully! Verify your email with the OTP sent.");

      if (email) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(email)}&type=email`
        );
      } else {
        router.push("/login");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      setError(axiosError.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 flex justify-center items-start pt-12 pb-12">
      <div
        ref={ref}
        className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(200px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(0,128,0,0.12), transparent 40%)`,
          }}
        />

        <h2 className="text-3xl font-bold mb-6 text-center text-[#2E4A3C]">
          Register
        </h2>
        <div className="mt-[-10px] h-1 w-24 mx-auto bg-yellow-400 rounded-full" />
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Name */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              autoComplete="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label className="mb-1 font-medium text-gray-700">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-600 hover:text-gray-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col relative">
            <label className="mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-600 hover:text-gray-900"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E4A3C] text-white py-3 rounded-md shadow-lg hover:bg-[#1d3328] hover:cursor-pointer transition-transform hover:scale-105 font-semibold"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 relative z-10">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#2E4A3C] font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
