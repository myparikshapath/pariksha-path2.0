"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Book, User, GraduationCap, Clipboard } from "lucide-react";

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

    return (
        <>
            <Navbar />
            <main className="pt-32 max-w-7xl mx-auto px-6 space-y-16">
                {/* ===== Page Title ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-[#002856] mb-3">
                        Mock Tests
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Prepare for your exams with categorized mock tests, free demos, and
                        detailed score tracking.
                    </p>
                </motion.section>

                {/* ===== Categories Section ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Test Categories
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {mockCategories.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                                }}
                                className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition"
                            >
                                <div className="text-[#0000D3] mb-3">{cat.icon}</div>
                                <h3 className="font-semibold text-lg">{cat.name}</h3>
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
                    className="bg-gray-50 rounded-xl shadow p-6"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Free Demo Tests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((demo) => (
                            <motion.div
                                key={demo}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-6 rounded-xl shadow hover:shadow-lg flex flex-col justify-between"
                            >
                                <h3 className="font-semibold mb-2">Demo Test {demo}</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Try a restricted set of questions for free and experience the
                                    test interface.
                                </p>
                                <Button className="bg-[#0000D3] hover:bg-blue-700 text-white w-full rounded-md">
                                    Attempt
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ===== Paid Test Series ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Paid Test Series
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((series) => (
                            <motion.div
                                key={series}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg flex flex-col justify-between"
                            >
                                <h3 className="font-semibold mb-2">
                                    Full-Length Test Series {series}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Sectional and full-length tests with detailed solutions.
                                </p>
                                <Button className="bg-[#0000D3] hover:bg-blue-700 text-white w-full rounded-md">
                                    Buy Now
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ===== Downloadable PDFs ===== */}
                <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gray-50 rounded-xl shadow p-6"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Downloadable PDFs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((pdf) => (
                            <motion.div
                                key={pdf}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center"
                            >
                                <div className="w-16 h-20 bg-gray-200 rounded mb-4" />
                                <h3 className="font-semibold mb-2">Study Notes {pdf}</h3>
                                <Button className="bg-[#0000D3] hover:bg-blue-700 text-white w-full mt-2 rounded-md">
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
                    className="bg-white rounded-xl shadow-md p-6"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Your Attempt History
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100">
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
                                            } hover:bg-blue-50 transition`}
                                    >
                                        <td className="px-6 py-3">Test {row}</td>
                                        <td className="px-6 py-3 font-semibold text-[#0000D3]">
                                            80%
                                        </td>
                                        <td className="px-6 py-3">2025-08-22</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </main>
        </>
    );
}
