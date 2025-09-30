"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ExamData {
    [category: string]: {
        [subCategory: string]: string[] | {
            [state: string]: string[];
        };
    };
}

interface Exam {
    name: string;
    category: string;
    sub_category?: string;
    state?: string;
}

export default function AdminExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const examsPerPage = 15;

    // Flatten JSON recursively
    function flattenExams(data: ExamData): Exam[] {
        const result: Exam[] = [];
        for (const category in data) {
            const subCats = data[category];
            for (const subCat in subCats) {
                const examsOrObj = subCats[subCat];
                if (Array.isArray(examsOrObj)) {
                    examsOrObj.forEach((exam: string) =>
                        result.push({ name: exam, category: subCat })
                    );
                } else if (typeof examsOrObj === "object") {
                    for (const state in examsOrObj) {
                        const stateExams = examsOrObj[state];
                        if (Array.isArray(stateExams)) {
                            stateExams.forEach((exam: string) =>
                                result.push({ name: exam, category: subCat, state })
                            );
                        }
                    }
                }
            }
        }
        return result;
    }

    useEffect(() => {
        fetch("/data/exams.json")
            .then((res) => res.json())
            .then((data) => {
                const examsArray = flattenExams(data);
                setExams(examsArray);
            })
            .catch(console.error);
    }, []);

    // Filter exams
    const filteredExams = exams.filter((exam) =>
        exam.name.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredExams.length / examsPerPage);
    const paginatedExams = filteredExams.slice(
        (currentPage - 1) * examsPerPage,
        currentPage * examsPerPage
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-green-900">Manage Exam Content</h1>

            {/* Back Button */}
            <Button
                onClick={() => router.push("/admin/manage-content")}
                className="mb-6 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-4 py-2 shadow-sm"
            >
                <ArrowLeft size={18} /> Back
            </Button>

            {/* Search */}
            <input
                type="text"
                placeholder="Search exams..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
                className="w-full md:w-full mb-6 border rounded-full px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />

            {/* Exams Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedExams.map((exam, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ type: "spring", stiffness: 250 }}
                        className="bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-black shadow-md rounded-2xl p-6 cursor-pointer flex flex-col justify-between transition-all min-h-[180px]"
                        onClick={() =>
                            router.push(
                                `/admin/exam/${encodeURIComponent(
                                    exam.name.toLowerCase().replace(/\s+/g, "-")
                                )}`
                            )
                        }
                    >
                        <div>
                            <h2 className="text-xl font-semibold">{exam.name}</h2>
                            <p className="text-gray-600 mt-2">
                                {exam.sub_category || exam.category}
                                {exam.state ? ` - ${exam.state}` : ""}
                            </p>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex space-x-2 mt-4">
                            <button
                                className="bg-[#2E4A3C] text-white px-4 py-2 rounded-full hover:bg-[#22362c] transition cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                        `/admin/exam/${encodeURIComponent(
                                            exam.name.toLowerCase().replace(/\s+/g, "-")
                                        )}`
                                    );
                                }}
                            >
                                Manage Content
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 space-x-3 items-center">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full border border-gray-300 hover:bg-green-50 disabled:opacity-50 transition"
                >
                    <ChevronLeft size={20} className="text-green-700" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-full border ${currentPage === page
                            ? "bg-[#2E4A3C] text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-green-100"
                            } transition`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full border border-gray-300 hover:bg-green-50 disabled:opacity-50 transition"
                >
                    <ChevronRight size={20} className="text-green-700" />
                </button>
            </div>
        </div>
    );
}
