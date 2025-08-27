"use client";
import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        preferred_exam_categories: [] as string[],
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
            const res = await api.post("/auth/register", form);
            const email = res.data.user?.email;

            alert("Registered successfully! Verify your email with the OTP sent.");

            // Redirect to verify-otp page with the user's email
            if (email) {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=email`);
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
        <div className="min-h-screen bg-gray-100 px-4 flex justify-center items-start pt-36 pb-10">
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                {/* Decorative gradient shape */}
                <div className="absolute top-0 -right-16 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

                <h2 className="text-3xl font-bold mb-6 text-center text-[#002856]">Register</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Full Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            autoComplete="name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030397] transition"
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
                            autoComplete="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030397] transition"
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
                            autoComplete="tel"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030397] transition"
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
                            autoComplete="new-password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030397] transition"
                            required
                        />
                    </div>

                    {/* ✅ Fixed Exam Categories */}
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium text-gray-700">
                            Preferred Exam Categories
                        </label>

                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {[
                                { label: "Medical", value: "medical" },
                                { label: "Engineering", value: "engineering" },
                                { label: "Teaching", value: "teaching" },
                                { label: "Govt Exams", value: "govt_exams" },
                                { label: "Banking", value: "banking" },
                                { label: "Defence", value: "defence" },
                                { label: "State Exams", value: "state_exams" },
                            ].map((category) => {
                                const selected = form.preferred_exam_categories.includes(category.value);

                                return (
                                    <button
                                        type="button"
                                        key={category.value}
                                        onClick={() => {
                                            if (selected) {
                                                setForm({
                                                    ...form,
                                                    preferred_exam_categories:
                                                        form.preferred_exam_categories.filter(
                                                            (c) => c !== category.value
                                                        ),
                                                });
                                            } else {
                                                setForm({
                                                    ...form,
                                                    preferred_exam_categories: [
                                                        ...form.preferred_exam_categories,
                                                        category.value,
                                                    ],
                                                });
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-full hover:cursor-pointer border flex-shrink-0 transition ${selected
                                            ? "bg-[#0000D3] text-white border-blue-600"
                                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                            }`}
                                    >
                                        {category.label}
                                    </button>
                                );
                            })}
                        </div>

                        <small className="text-gray-500 mt-2">
                            Tap to select one or more categories
                        </small>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0000D3] text-white py-3 rounded-sm shadow-lg hover:bg-[#030397] hover:cursor-pointer transition-transform hover:scale-105 font-semibold"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#0000D3] font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
