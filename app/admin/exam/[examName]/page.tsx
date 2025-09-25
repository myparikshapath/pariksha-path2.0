"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import api from "@/utils/api";

interface ExamInfoSection {
    id: string;
    header: string;
    content: string;
}

interface ExamContent {
    exam_code: string;
    title: string;
    description: string;
    linked_course_id: string;
    exam_info_sections: ExamInfoSection[];
}

export default function AdminExamDetailPage({ params }: { params: Promise<{ examName: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ✅ unwrap params (since it's a promise in Next.js 15+)
    const resolvedParams = use(params);
    const examNameRaw = resolvedParams.examName;

    const action = searchParams.get("action") || "add";

    const examName = examNameRaw
        ? decodeURIComponent(examNameRaw).replace(/-/g, " ")
        : "Unknown Exam";

    const [examContent, setExamContent] = useState<ExamContent>({
        exam_code: examNameRaw || "",
        title: examName,
        description: "",
        linked_course_id: "dummy-course-id", // TODO: replace with real course id
        exam_info_sections: [
            { id: uuidv4(), header: "Syllabus", content: "Maths, Reasoning, GK, English..." },
            { id: uuidv4(), header: "Exam Pattern", content: "Tier 1, Tier 2, descriptive etc..." },
        ],
    });

    const [newSectionHeader, setNewSectionHeader] = useState("");
    const [newSectionContent, setNewSectionContent] = useState("");

    useEffect(() => {
        if (action === "edit") {
            fetch(`/api/admin/exams/${encodeURIComponent(examNameRaw)}`)
                .then(res => res.json())
                .then(data => {
                    setExamContent({
                        exam_code: data.exam_code || examNameRaw,
                        title: data.title || examName,
                        description: data.description || "",
                        linked_course_id: data.linked_course_id || "dummy-course-id",
                        exam_info_sections: data.exam_info_sections || [],
                    });
                })
                .catch(console.error);
        }
    }, [examNameRaw, action, examName]);

    const addSection = () => {
        if (!newSectionHeader.trim() && !newSectionContent.trim()) return;

        setExamContent(prev => ({
            ...prev,
            exam_info_sections: [
                ...prev.exam_info_sections,
                { id: uuidv4(), header: newSectionHeader.trim(), content: newSectionContent.trim() },
            ],
        }));

        setNewSectionHeader("");
        setNewSectionContent("");
    };

    const removeSection = (id: string) => {
        setExamContent(prev => ({
            ...prev,
            exam_info_sections: prev.exam_info_sections.filter(s => s.id !== id),
        }));
    };

    const saveContent = async () => {
        const url =
            action === "edit"
                ? `/exam-contents/${encodeURIComponent(examNameRaw)}`
                : `/exam-contents/`;

        try {
            console.log("📤 Sending payload:", examContent);

            const response =
                action === "edit"
                    ? await api.put(url, examContent, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    })
                    : await api.post(url, examContent, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

            console.log("✅ Saved:", response.data);
            alert("Content saved successfully!");
            router.push("/admin/add-content");
        } catch (e) {
            console.error("❌ Error saving content:", e);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between">
            <div className="max-w-5xl mx-auto p-6 w-full flex-1">
                <h1 className="text-3xl font-bold mb-6 text-green-900">
                    {action === "edit" ? "Edit" : "Add"} Content for {examContent.title}
                </h1>

                {/* Title */}
                <input
                    type="text"
                    placeholder="Exam Title"
                    value={examContent.title}
                    onChange={(e) => setExamContent(prev => ({ ...prev, title: e.target.value }))}
                    className="border px-3 py-2 rounded w-full mb-3"
                />

                {/* Description */}
                <textarea
                    placeholder="Exam Description"
                    value={examContent.description}
                    onChange={(e) => setExamContent(prev => ({ ...prev, description: e.target.value }))}
                    className="border px-3 py-2 rounded w-full mb-6 resize-none"
                />

                {/* Linked Course */}
                <input
                    type="text"
                    placeholder="Linked Course ID"
                    value={examContent.linked_course_id}
                    onChange={(e) => setExamContent(prev => ({ ...prev, linked_course_id: e.target.value }))}
                    className="border px-3 py-2 rounded w-full mb-6"
                />

                {/* Add New Section */}
                <div className="mb-6 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                    <input
                        type="text"
                        placeholder="Section Header"
                        value={newSectionHeader}
                        onChange={(e) => setNewSectionHeader(e.target.value)}
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <textarea
                        placeholder="Section Content"
                        value={newSectionContent}
                        onChange={(e) => setNewSectionContent(e.target.value)}
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                    <button
                        onClick={addSection}
                        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition cursor-pointer"
                    >
                        Add Section
                    </button>
                </div>

                {/* Section List */}
                <div className="space-y-4">
                    {examContent.exam_info_sections.map((section) => (
                        <motion.div
                            key={section.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-100 p-4 rounded shadow-md flex flex-col md:flex-row md:justify-between"
                        >
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={section.header}
                                    onChange={(e) => {
                                        setExamContent(prev => ({
                                            ...prev,
                                            exam_info_sections: prev.exam_info_sections.map(s =>
                                                s.id === section.id ? { ...s, header: e.target.value } : s
                                            ),
                                        }));
                                    }}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                <textarea
                                    value={section.content}
                                    onChange={(e) => {
                                        setExamContent(prev => ({
                                            ...prev,
                                            exam_info_sections: prev.exam_info_sections.map(s =>
                                                s.id === section.id ? { ...s, content: e.target.value } : s
                                            ),
                                        }));
                                    }}
                                    className="w-full border px-3 py-2 rounded resize-none"
                                />
                            </div>
                            <div className="flex items-start mt-2 md:mt-0 md:ml-4">
                                <button
                                    onClick={() => removeSection(section.id)}
                                    className="text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={saveContent}
                        className="bg-[#2E4A3C] text-white px-6 py-2 rounded hover:bg-[#1a2821] transition cursor-pointer"
                    >
                        Save Content
                    </button>
                </div>
            </div>
        </div>
    );
}
