"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        preferred_exam_categories: [],
    });
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
            const res = await api.post("/register", form);
            alert("Registered successfully! Please verify your email.");
            router.push("/login");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 mt-12">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                {/* Decorative gradient shape */}
                <div className="absolute top-0 -right-16 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Full Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+91 9876543210"
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
                            placeholder="Create a password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 font-semibold"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
