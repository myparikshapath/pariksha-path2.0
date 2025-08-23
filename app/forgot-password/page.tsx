"use client";
import { useState } from "react";
import api from "@/utils/api";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
        <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
            >
                {/* Title */}
                <div className="text-center mb-6">
                    <Mail className="w-12 h-12 mx-auto text-[#0000D3] mb-2" />
                    <h2 className="text-3xl font-bold text-[#002856]">Forgot Password</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <div
                        className={`mb-4 text-center text-sm font-medium ${message.includes("Failed") ? "text-red-500" : "text-green-600"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0000D3] focus:outline-none transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl text-white font-semibold transition hover:cursor-pointer ${loading
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-[#0000D3] hover:bg-[#030397]"
                            }`}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Remembered your password?{" "}
                    <a
                        href="/login"
                        className="text-[#0000D3] font-semibold hover:underline"
                    >
                        Go back to Login
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
