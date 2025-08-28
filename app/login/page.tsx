"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCursorGlow } from "@/hooks/useCursorGlow";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const { ref, cursorPos } = useCursorGlow();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
                login(res.data.tokens.access_token);
                localStorage.setItem(
                    "refresh_token",
                    res.data.tokens.refresh_token
                );
                router.push(res.data.dashboard_url || "/student/dashboard");
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            setError(axiosError.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div
                ref={ref}
                className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden"
            >
                {/* Glow effect */}
                <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{
                        background: `radial-gradient(200px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(0,0,255,0.12), transparent 80%)`,
                    }}
                />

                <h2 className="text-3xl font-bold mb-6 text-center text-[#002856]">
                    Login
                </h2>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                        <Link
                            href="/forgot-password"
                            className="text-sm text-[#0000D3] mt-1 hover:underline self-end"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0000D3] text-white py-3 rounded-sm shadow-lg hover:bg-[#030397] transition-transform hover:scale-105 font-semibold"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 relative z-10">
                    Not a user?{" "}
                    <Link
                        href="/register"
                        className="text-[#0000D3] font-medium hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
