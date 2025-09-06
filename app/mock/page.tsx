"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Book, User, GraduationCap, Clipboard, FileText } from "lucide-react";

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
    const [freeCourses, setFreeCourses] = useState<any[]>([]);
    const [paidCourses, setPaidCourses] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCourses() {
            try {
                // free courses
                const freeRes = await fetch("/api/courses?is_free=true");
                const freeData = await freeRes.json();
                setFreeCourses(freeData.data || []);

                // paid courses
                const paidRes = await fetch("/api/courses?is_free=false");
                const paidData = await paidRes.json();
                setPaidCourses(paidData.data || []);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        }

        fetchCourses();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <>
            <Navbar />
            <main className="pt-28 max-w-7xl mx-auto px-6 space-y-20">
                {/* ===== Hero Section (same as before) ===== */}
                {/* ===== Categories Section (same as before) ===== */}

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
                        {freeCourses.map((course) => (
                            <motion.div
                                key={course.id}
                                whileHover={{ scale: 1.03 }}
                                className="bg-white rounded-2xl shadow hover:shadow-lg transition-all p-6 flex flex-col justify-between"
                            >
                                <h3 className="font-semibold mb-2 text-[#2E4A3C]">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {course.description || "Try this free mock test."}
                                </p>
                                <Button className="bg-[#869C51] hover:bg-[#6e8343] text-white w-full rounded-lg">
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
                    <h2 className="text-3xl font-bold mb-10 text-center text-[#2E4A3C]">
                        Paid Test Series
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paidCourses.map((course) => (
                            <motion.div
                                key={course.id}
                                whileHover={{ scale: 1.03 }}
                                className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col justify-between"
                            >
                                <h3 className="font-semibold mb-2 text-[#2E4A3C]">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {course.description || "Full-length test series."}
                                </p>
                                <Button className="bg-[#869C51] hover:bg-[#6e8343] text-white w-full rounded-lg">
                                    Buy Now
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ===== Baaki sections same rahenge ===== */}
            </main>
        </>
    );
}
