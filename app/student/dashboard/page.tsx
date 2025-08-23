"use client";
import React from "react";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Mock Data - Replace with API integration
const categories = ["Defence", "State Exams", "Banking", "SSC"];
const purchased = [
    { name: "NDA Full Course", type: "Course", link: "/student/courses/nda" },
    { name: "CDS Mock Test 1", type: "Test", link: "/student/tests/cds-mock-1" },
];
const performance = [
    { subject: "Maths", accuracy: 75 },
    { subject: "English", accuracy: 60 },
    { subject: "Reasoning", accuracy: 85 },
];

export default function StudentDashboard() {
    const colors = ["#0000D3", "#FF6B6B", "#4CAF50"];

    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/login");
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) {
        return <p>Checking authentication...</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 pt-32">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-[#0000D3] to-[#4a4ae4] p-6 rounded-xl shadow-lg text-white"
            >
                <div>
                    <h1 className="text-3xl font-extrabold">Welcome, Student! 🎉</h1>
                    <p className="mt-1 text-sm text-blue-100">
                        Track your progress and continue learning.
                    </p>
                </div>
                <Link href="/student/profile">
                    <button className="mt-4 md:mt-0 px-6 py-2 bg-white text-[#0000D3] font-semibold rounded-lg shadow hover:shadow-md transition">
                        View Profile
                    </button>
                </Link>
            </motion.div>

            {/* Exam Categories */}
            <section>
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Explore Exam Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="p-6 rounded-xl shadow-md bg-white border border-gray-100 text-center font-semibold text-gray-800 hover:shadow-lg hover:bg-blue-50 cursor-pointer"
                        >
                            {cat}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Purchased Items */}
            <section>
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Your Courses & Tests
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {purchased.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex justify-between items-center hover:shadow-lg transition"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.type}</p>
                            </div>
                            <Link href={item.link}>
                                <button className="px-4 py-2 bg-[#0000D3] text-white rounded-sm shadow hover:bg-blue-900 transition">
                                    Start
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Performance Analytics */}
            <section>
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Performance Analytics
                </h2>
                <div className="bg-white shadow-md rounded-sm p-6 w-full h-80 md:h-96">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={performance}
                                dataKey="accuracy"
                                nameKey="subject"
                                outerRadius={120} /* bigger chart */
                                innerRadius={50}
                                label
                            >
                                {performance.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={colors[index % colors.length]}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Quick Actions
                </h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/student/tests">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="px-6 py-3 bg-[#0000D3] text-white font-semibold rounded-sm shadow hover:bg-blue-900 transition"
                        >
                            Attempt a Test
                        </motion.button>
                    </Link>
                    <Link href="/student/analysis">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="px-6 py-3 border border-[#0000D3] text-[#0000D3] font-semibold rounded-sm hover:bg-blue-50 transition"
                        >
                            View Detailed Analysis
                        </motion.button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
