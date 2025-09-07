"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Book, User, GraduationCap, Clipboard, FileText } from "lucide-react";
import { useState, useEffect } from "react"
import api from "@/utils/api";
import Link from "next/link";

const mockCategories = [
    { name: "Medical", icon: <Book size={28} /> },
    { name: "Engineering", icon: <GraduationCap size={28} /> },
    { name: "SSC", icon: <Clipboard size={28} /> },
    { name: "Banking", icon: <User size={28} /> },
    { name: "Defence", icon: <GraduationCap size={28} /> },
    { name: "Teaching", icon: <Book size={28} /> },
    { name: "State", icon: <Clipboard size={28} /> },
];

export default function MockPage() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    // 🔥 Free Tests state
    const [freeTests, setFreeTests] = useState<any[]>([]);
    const [paidTests, setPaidTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                // ✅ free tests
                const freeRes = await api.get("/tests?is_free=true");
                setFreeTests(freeRes.data.items || []);

                // ✅ paid tests
                const paidRes = await api.get("/tests?is_free=false");
                setPaidTests(paidRes.data.items || []);
            } catch (err) {
                console.error("Error fetching tests:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);


    return (
        <>
            <Navbar />
            <main className="pt-28 max-w-7xl mx-auto px-6 space-y-20">
                {/* ===== Hero Section ===== */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7 }}
                    className="rounded-3xl bg-gradient-to-r from-[#2E4A3C] to-[#869C51] text-white py-20 px-6 text-center shadow-lg"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Boost Your Prep with Mock Tests 🚀
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg opacity-90 mb-8">
                        Attempt free demos, unlock full-length test series, and track your
                        progress with detailed insights.
                    </p>
                    <Button className="bg-yellow-400 text-[#2E4A3C] font-semibold px-8 py-6 rounded-xl shadow hover:bg-yellow-300 transition">
                        Start Practicing
                    </Button>
                </motion.section>

                {/* ===== Categories Section ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative"
                >
                    <h2 className="text-3xl font-bold mb-14 text-center text-[#2E4A3C]">
                        Test Categories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                        {mockCategories.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition"
                            >
                                <div className="bg-yellow-400 p-4 rounded-full mb-4 shadow">
                                    {cat.icon}
                                </div>
                                <h3 className="font-semibold text-lg text-[#2E4A3C]">
                                    {cat.name}
                                </h3>

                                {/* timeline connector */}
                                {idx < mockCategories.length - 1 && (
                                    <span className="hidden md:block absolute right-[-20px] top-1/2 w-10 h-1 bg-yellow-400"></span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ===== Free Demo Tests ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold mb-10 text-center text-[#2E4A3C]">
                        Free Demo Tests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {freeTests.length > 0 ? (
                            freeTests.map((test) => (
                                <motion.div
                                    key={test.id}
                                    whileHover={{ scale: 1.03 }}
                                    className="bg-white rounded-2xl shadow hover:shadow-lg transition-all p-6 flex flex-col justify-between"
                                >
                                    <h3 className="font-semibold mb-2 text-[#2E4A3C]">
                                        {test.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {test.description || "Try a free demo to experience the test interface."}
                                    </p>
                                    <Link href={`/mock/${test.id}`}>
                                        <Button className="bg-[#869C51] hover:bg-[#6e8343] text-white w-full rounded-lg">
                                            Attempt
                                        </Button>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-center col-span-3 text-gray-500">
                                No free tests available right now.
                            </p>
                        )}
                    </div>
                </motion.section>


                {/* ===== Paid Test Series ===== */}
                {/* ===== Paid Test Series ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <h2 className="text-3xl font-bold mb-10 text-center text-[#2E4A3C]">
                        Paid Test Series
                    </h2>

                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : paidTests.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No paid test series available right now.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {paidTests.map((test) => (
                                <motion.div
                                    key={test.id}
                                    whileHover={{ scale: 1.03 }}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col justify-between"
                                >
                                    <h3 className="font-semibold mb-2 text-[#2E4A3C]">
                                        {test.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{test.description}</p>
                                    <Button className="bg-[#869C51] hover:bg-[#6e8343] text-white w-full rounded-lg">
                                        Buy Now
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* ===== Downloadable PDFs ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gray-50 rounded-3xl shadow p-10"
                >
                    <h2 className="text-3xl font-bold mb-10 text-center text-[#2E4A3C]">
                        Downloadable PDFs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((pdf) => (
                            <motion.div
                                key={pdf}
                                whileHover={{ scale: 1.03 }}
                                className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center hover:shadow-lg transition"
                            >
                                <FileText size={40} className="text-[#869C51] mb-4" />
                                <h3 className="font-semibold mb-2">Study Notes {pdf}</h3>
                                <Button className="bg-[#2E4A3C] hover:bg-[#22382d] text-white w-full mt-2 rounded-lg">
                                    Download
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ===== Attempt History ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white rounded-3xl shadow-md p-10"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center text-[#2E4A3C]">
                        Your Attempt History
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-[#f7f9f7]">
                                <tr className="text-left text-gray-700">
                                    <th className="px-6 py-3 font-semibold">Test Name</th>
                                    <th className="px-6 py-3 font-semibold">Score</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3].map((row, idx) => (
                                    <tr
                                        key={row}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-green-50 transition`}
                                    >
                                        <td className="px-6 py-3">Test {row}</td>
                                        <td className="px-6 py-3 font-semibold text-[#869C51]">
                                            80%
                                        </td>
                                        <td className="px-6 py-3">2025-08-22</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* ===== CTA Banner ===== */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    className="rounded-3xl bg-gradient-to-r from-[#869C51] to-[#2E4A3C] py-16 px-6 text-center text-white shadow-lg mb-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Ace Your Exams?
                    </h2>
                    <p className="max-w-2xl mx-auto mb-8 opacity-90">
                        Join thousands of learners, attempt unlimited mock tests, and track
                        your progress like never before.
                    </p>
                    <Button className="bg-yellow-400 text-[#2E4A3C] font-semibold px-10 py-6 rounded-xl shadow hover:bg-yellow-300 transition">
                        Get Started
                    </Button>
                </motion.section>
            </main>
        </>
    );
}
