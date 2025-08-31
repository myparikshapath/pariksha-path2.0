"use client";
import { useState } from "react";
import api from "@/utils/api";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useCursorGlow } from "@/hooks/useCursorGlow"; // 👈 import glow hook

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const { ref, cursorPos } = useCursorGlow(); // 👈 glow hook

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            setMessage(
                axiosError.response?.data?.detail || "Failed to send reset link"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <motion.div
                ref={ref} // 👈 attach glow
                style={{
                    background: `radial-gradient(circle 150px at ${cursorPos.x}px ${cursorPos.y}px, rgba(0,128,0,0.15), transparent 40%)`
                }}
                className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden transition-all"
            >
                {/* Header */}
                <div className="text-center mb-6 relative z-10">
                    <Mail className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                    <h2 className="text-3xl font-bold text-[#2E4A3C]">Forgot Password</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-4 text-center text-sm font-medium relative z-10 ${message.includes("Failed") ? "text-red-500" : "text-green-600"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3C] transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#2E4A3C] text-white py-3 rounded-md shadow-lg font-semibold transition-transform hover:scale-105 hover:bg-[#1d3328] ${loading && "bg-green-300 cursor-not-allowed hover:scale-100"
                            }`}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {/* Back to Login */}
                <p className="mt-6 text-center text-gray-600 relative z-10">
                    Remembered your password?{" "}
                    <Link
                        href="/login"
                        className="text-[#2E4A3C] font-medium hover:underline"
                    >
                        Go back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
