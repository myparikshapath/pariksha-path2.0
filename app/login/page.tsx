"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";

export default function Login() {
    const router = useRouter();
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
            localStorage.setItem("access_token", res.data.tokens.access_token);
            localStorage.setItem("refresh_token", res.data.tokens.refresh_token);
            router.push("/dashboard");
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            setError(axiosError.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                {/* Decorative gradient shape */}
                <div className="absolute top-0 -right-16 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                        <Link href="/forgot-password" className="text-sm text-blue-600 mt-1 hover:underline self-end">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 font-semibold"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Not a user?{" "}
                    <Link href="/register" className="text-blue-600 font-medium hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
