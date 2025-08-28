"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCursorGlow } from "@/hooks/useCursorGlow"; // 👈 import glow hook

export default function VerifyOtp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpType, setOtpType] = useState<"login" | "email">("email");

    const { ref, cursorPos } = useCursorGlow(); // 👈 glow hook

    useEffect(() => {
        const emailParam = searchParams.get("email");
        const typeParam = searchParams.get("type");
        if (emailParam) setEmail(emailParam);
        if (typeParam === "login" || typeParam === "email") setOtpType(typeParam);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const endpoint = otpType === "login" ? "/auth/verify-login" : "/auth/verify-registration";
            const res = await api.post(endpoint, { email, otp });

            if (res.data.tokens) {
                login(res.data.tokens.access_token);
                localStorage.setItem("refresh_token", res.data.tokens.refresh_token);
                router.push("/student/dashboard");
            } else {
                setMessage("Email verified successfully! Please login.");
                router.push("/login");
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            setMessage(
                axiosError.response?.data?.detail || "Failed to verify OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setLoading(true);
            const endpoint =
                otpType === "login"
                    ? "/auth/resend-login-otp"
                    : "/auth/resend-verification-email";
            const res = await api.post(endpoint, { email });
            setMessage(res.data.message || "OTP resent successfully");
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            setMessage(
                axiosError.response?.data?.detail || "Failed to resend OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <motion.div
                ref={ref} // 👈 attach glow
                style={{
                    background: `radial-gradient(circle 150px at ${cursorPos.x}px ${cursorPos.y}px, rgba(0,0,211,0.15), transparent 80%)`
                }}
                className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden transition-all"
            >
                {/* Decorative gradient pulse shape */}
                <div className="absolute top-0 -right-16 w-48 h-48 "></div>

                {/* Header */}
                <div className="text-center mb-6 relative z-10">
                    <KeyRound className="w-12 h-12 mx-auto text-[#0000D3] mb-2" />
                    <h2 className="text-3xl font-bold text-[#002856]">Verify OTP</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter the OTP sent to your email <span className="font-medium text-[#0000D3]">{email}</span>.
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-4 text-center text-sm font-medium relative z-10 ${message.toLowerCase().includes("failed")
                            ? "text-red-500"
                            : "text-green-600"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">OTP</label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition tracking-widest text-center font-semibold text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#0000D3] text-white py-3 rounded-sm shadow-lg font-semibold transition-transform hover:scale-105 hover:bg-[#030397] ${loading && "bg-blue-300 cursor-not-allowed hover:scale-100"
                            }`}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                {/* Resend OTP */}
                <p className="mt-6 text-center text-gray-600 relative z-10 text-sm">
                    Didn&apos;t get the code?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-[#0000D3] font-medium hover:underline disabled:opacity-50"
                    >
                        Resend OTP
                    </button>
                </p>

                {/* Back to Login */}
                <p className="mt-4 text-center text-gray-600 relative z-10 text-sm">
                    Entered wrong email?{" "}
                    <a
                        href="/login"
                        className="text-[#0000D3] font-medium hover:underline"
                    >
                        Go back to Login
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
