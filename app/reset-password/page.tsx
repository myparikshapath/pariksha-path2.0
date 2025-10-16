"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { AxiosError } from "axios";

import api from "@/utils/api";
import { useCursorGlow } from "@/hooks/useCursorGlow";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { ref, cursorPos } = useCursorGlow();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });
      setMessage(res.data.message || "Password reset successful");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const detail = axiosError.response?.data?.detail;

      if (detail && detail.toLowerCase().includes("invalid or expired reset code")) {
        setMessage("The OTP you entered is incorrect. Please try again.");
      } else {
        setMessage(detail || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading ? "Resetting..." : "Reset Password";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <motion.div
        ref={ref}
        style={{
          background: `radial-gradient(circle 150px at ${cursorPos.x}px ${cursorPos.y}px, rgba(46,74,60,0.15), transparent 80%)`,
        }}
        className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden transition-all"
      >
        <div className="text-center mb-6 relative z-10">
          <KeyRound className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
          <h2 className="text-3xl font-bold text-[#2E4A3C]">Reset Password</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Enter the OTP sent to your email and choose a new password.
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 text-center text-sm font-medium relative z-10 ${
              message.toLowerCase().includes("fail")
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Reset Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#2E4A3C] text-white py-3 rounded-md shadow-lg font-semibold transition-transform hover:scale-105 hover:bg-[#1d3328] ${
              loading && "bg-green-300 cursor-not-allowed hover:scale-100"
            }`}
          >
            {buttonLabel}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
