"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
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
  thumbnail_url?: string | null;
  banner_url?: string | null;
  exam_info_sections: ExamInfoSection[];
}

export default function AdminExamDetailPage({
  params,
}: {
  params: Promise<{ examName: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const examNameRaw = resolvedParams.examName;

  const examName = examNameRaw
    ? decodeURIComponent(examNameRaw).replace(/-/g, " ")
    : "Unknown Exam";

  const [examContent, setExamContent] = useState<ExamContent>({
    exam_code: examNameRaw || "",
    title: examName,
    description: "",
    thumbnail_url: null,
    banner_url: null,
    exam_info_sections: [
      {
        id: uuidv4(),
        header: "Syllabus",
        content: "Maths, Reasoning, GK, English...",
      },
      {
        id: uuidv4(),
        header: "Exam Pattern",
        content: "Tier 1, Tier 2, descriptive etc...",
      },
    ],
  });

  const [mode, setMode] = useState<"add" | "edit">("add");
  const [isLoading, setIsLoading] = useState(true);

  const [debugInfo, setDebugInfo] = useState<string>("");

  const [newSectionHeader, setNewSectionHeader] = useState<string>("");
  const [newSectionContent, setNewSectionContent] = useState<string>("");

  // Auto-detect mode and load appropriate data
  useEffect(() => {
    const initializeContent = async () => {
      setIsLoading(true);
      try {
        // Try to fetch existing content
        const response = await api.get(
          `/exam-contents/${encodeURIComponent(examNameRaw)}`
        );
        console.log(`/exam-contents/${encodeURIComponent(examNameRaw)}`);
        setMode("edit");
        setExamContent({
          exam_code: response.data.exam_code || examNameRaw,
          title: response.data.title || examName,
          description: response.data.description || "",
          thumbnail_url: response.data.thumbnail_url || null,
          banner_url: response.data.banner_url || null,
          exam_info_sections: response.data.exam_info_sections || [],
        });
      } catch (error) {
        const is404Error =
          error &&
          (error as unknown as { response: { status: number } }).response
            ?.status === 404;
        if (!is404Error) {
          console.error("Error fetching exam content:", error);
        }
        setMode("add");
        setExamContent({
          exam_code: examNameRaw || "",
          title: examName,
          description: "",
          thumbnail_url: null,
          banner_url: null,
          exam_info_sections: [
            {
              id: uuidv4(),
              header: "Syllabus",
              content: "Maths, Reasoning, GK, English...",
            },
            {
              id: uuidv4(),
              header: "Exam Pattern",
              content: "Tier 1, Tier 2, descriptive etc...",
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeContent();
  }, [examNameRaw, examName]);

  // Update debug info
  useEffect(() => {
    setDebugInfo(
      `Mode: ${mode.toUpperCase()}, Exam Code: ${examNameRaw}, Status: ${
        isLoading ? "Loading..." : "Ready"
      }`
    );
  }, [mode, examNameRaw, isLoading]);

  const addSection = () => {
    if (!newSectionHeader.trim() && !newSectionContent.trim()) return;

    setExamContent((prev: ExamContent) => ({
      ...prev,
      exam_info_sections: [
        ...prev.exam_info_sections,
        {
          id: uuidv4(),
          header: newSectionHeader.trim(),
          content: newSectionContent.trim(),
        },
      ],
    }));

    setNewSectionHeader("");
    setNewSectionContent("");
  };

  const removeSection = (id: string) => {
    setExamContent((prev: ExamContent) => ({
      ...prev,
      exam_info_sections: prev.exam_info_sections.filter(
        (s: ExamInfoSection) => s.id !== id
      ),
    }));
  };

  const saveContent = async () => {
    // Validate required fields before sending
    if (!examContent.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!examContent.description || !examContent.description.trim()) {
      alert("Please enter a description");
      return;
    }

    // Ensure we're using the correct exam_code for the URL
    const examCodeForUrl = examContent.exam_code || examNameRaw;
    const url =
      mode === "edit"
        ? `/exam-contents/${encodeURIComponent(examCodeForUrl)}`
        : `/exam-contents/`;

    console.log("🔍 Mode Detection:", {
      mode,
      examNameRaw,
      examCodeForUrl,
      url,
      isEditMode: mode === "edit",
    });

    // Prepare data for backend - ensure all fields are properly formatted
    const dataToSend = {
      exam_code: examCodeForUrl,
      title: examContent.title.trim(),
      description: examContent.description.trim(),
      thumbnail_url: examContent.thumbnail_url || null,
      banner_url: examContent.banner_url || null,
      exam_info_sections: examContent.exam_info_sections.map(
        (section: ExamInfoSection) => ({
          id: section.id,
          header: section.header.trim(),
          content: section.content.trim(),
          order: 0,
          is_active: true,
        })
      ),
    };

    try {
      console.log("📤 Sending payload:", dataToSend);
      console.log("📤 HTTP Method:", mode === "edit" ? "PUT" : "POST");

      const response =
        mode === "edit"
          ? await api.put(url, dataToSend)
          : await api.post(url, dataToSend);

      console.log("✅ Response received:", response.status, response.data);
      alert("Content saved successfully!");
      router.push("/admin/manage-content");
    } catch (error: unknown) {
      console.error("❌ Error saving content:", error);
      console.error(
        "❌ Error response:",
        error
          ? (error as { response?: { data?: unknown } }).response?.data
          : "Unknown error"
      );
      const errorMessage =
        (
          error as {
            response?: { data?: { detail?: string } };
            message?: string;
          }
        )?.response?.data?.detail ||
        (error as { message?: string })?.message ||
        "Failed to save content. Please try again.";
      alert(`Failed to save content: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <div className="max-w-5xl mx-auto p-6 w-full flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E4A3C] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="max-w-5xl mx-auto p-6 w-full flex-1">
        <h1 className="text-3xl font-bold mb-6 text-green-900">
          {mode === "edit" ? "Edit" : "Add"} Content for {examContent.title}
        </h1>

        {/* Debug Info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Debug:</strong> {debugInfo}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Exam Title"
          value={examContent.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setExamContent((prev: ExamContent) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className="border px-3 py-2 rounded w-full mb-3"
        />

        {/* Description */}
        <textarea
          placeholder="Exam Description"
          value={examContent.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setExamContent((prev: ExamContent) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className="border px-3 py-2 rounded w-full mb-6 resize-none"
        />

        {/* Linked Course */}
        {/* <input
          type="text"
          placeholder="Linked Course ID"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setExamContent((prev: ExamContent) => ({
              ...prev,
              linked_course_id: e.target.value,
            }))
          }
          className="border px-3 py-2 rounded w-full mb-6"
        /> */}

        {/* Thumbnail URL */}
        {/* <input
          type="url"
          placeholder="Thumbnail URL (optional)"
          value={examContent.thumbnail_url || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setExamContent((prev: ExamContent) => ({
              ...prev,
              thumbnail_url: e.target.value || null,
            }))
          }
          className="border px-3 py-2 rounded w-full mb-6"
        /> */}

        {/* Banner URL */}
        {/* <input
          type="url"
          placeholder="Banner URL (optional)"
          value={examContent.banner_url || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setExamContent((prev: ExamContent) => ({
              ...prev,
              banner_url: e.target.value || null,
            }))
          }
          className="border px-3 py-2 rounded w-full mb-6"
        /> */}

        {/* Add New Section */}
        <div className="mb-6 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="Section Header"
            value={newSectionHeader}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSectionHeader(e.target.value)
            }
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Section Content"
            value={newSectionContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewSectionContent(e.target.value)
            }
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
          {examContent.exam_info_sections.map((section: ExamInfoSection) => (
            <motion.div
              key={section.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-100 p-4 rounded shadow-md flex flex-col md:flex-row md:justify-between"
            >
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={section.header}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setExamContent((prev: ExamContent) => ({
                      ...prev,
                      exam_info_sections: prev.exam_info_sections.map(
                        (s: ExamInfoSection) =>
                          s.id === section.id
                            ? { ...s, header: e.target.value }
                            : s
                      ),
                    }));
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
                <textarea
                  value={section.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setExamContent((prev: ExamContent) => ({
                      ...prev,
                      exam_info_sections: prev.exam_info_sections.map(
                        (s: ExamInfoSection) =>
                          s.id === section.id
                            ? { ...s, content: e.target.value }
                            : s
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
