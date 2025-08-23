"use client";
import { useState } from "react";
import api from "@/utils/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err: any) {
            setMessage(err.response?.data?.detail || "Failed to send reset link");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
            {message && <p className="text-green-500 mb-3">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    Send Reset Link
                </button>
            </form>
        </div>
    );
}
