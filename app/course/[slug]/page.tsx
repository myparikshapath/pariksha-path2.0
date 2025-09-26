"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ExamContent, getExamContentByCode } from "@/src/services/examContentService";

const CoursePage = () => {
  const params = useParams();
  const { slug } = params;
  
  const [examContent, setExamContent] = useState<ExamContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExamContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the slug directly as exam_code (admin form saves with hyphens)
        const examCode = slug as string;
        
        const content = await getExamContentByCode(examCode);
        
        if (!content) {
          throw new Error("Exam content not found");
        }
        
        setExamContent(content);
      } catch (e) {
        console.error("Error loading exam content:", e);
        setError(e instanceof Error ? e.message : "Failed to load exam content");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadExamContent();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading exam information...</span>
        </div>
      </div>
    );
  }

  if (error || !examContent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {(slug as string).replace(/-/g, " ").toUpperCase()}
          </h1>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || "Exam content not found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {error ? "Failed to load exam content" : "No exam content has been added yet."}
          </p>
          <p className="text-sm text-gray-500">
            Admin can add exam information at: <code className="bg-gray-100 px-2 py-1 rounded">/admin/exam/{slug}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Exam Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{examContent.title}</h1>
        {examContent.description && (
          <p className="text-lg text-gray-600">{examContent.description}</p>
        )}
      </div>

      {/* Dynamic Headers and Content from Admin */}
      {examContent.exam_info_sections
        .filter(section => section.is_active)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.header}</h2>
            <div className="text-gray-700 leading-relaxed">
              <p>{section.content}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default CoursePage;
