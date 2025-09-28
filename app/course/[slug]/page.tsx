"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ExamContent,
  getExamContentByCode,
} from "@/src/services/examContentService";
import { Course, getCourseDetails, enrollInCourse } from "@/src/services/courseService"; // 👈 yeh service banana hoga

const CoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [examContent, setExamContent] = useState<ExamContent | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const examCode = slug as string;
        const content = await getExamContentByCode(examCode);
        if (!content) throw new Error("Exam content not found");

        console.log("Exam Content:", content);
        setExamContent(content);

        if (content.linked_course_id && content.linked_course_id !== "dummy") {
          console.log("Fetching course with id:", content.linked_course_id);
          const courseData = await getCourseDetails(content.linked_course_id); // <-- yahan fix
          console.log("Fetched course:", courseData);
          setCourse(courseData);
        }
      } catch (e) {
        console.error("Error loading exam content:", e);
        setError(e instanceof Error ? e.message : "Failed to load exam content");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadData();
  }, [slug]);

  const handleBuyNow = async () => {
    try {
      if (!course) {
        alert("Course details not found!");
        return;
      }

      // enroll API call
      await enrollInCourse(course.id);

      alert(`✅ Successfully enrolled in ${course.title}`);

      // redirect to "My Courses" page
      router.push("/my-courses");
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert("❌ Failed to enroll in course. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <span className="ml-3 text-gray-600 text-lg">
          Loading exam information...
        </span>
      </div>
    );
  }

  if (error || !examContent) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {(slug as string).replace(/-/g, " ").toUpperCase()}
        </h1>
        <h3 className="text-lg font-medium text-red-600 mb-2">
          {error || "Exam content not found"}
        </h3>
        <p className="text-gray-600 mb-4">
          {error
            ? "Failed to load exam content"
            : "No exam content has been added yet."}
        </p>
        <p className="text-sm text-gray-500">
          Admin can add exam information at:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">
            /admin/exam/{slug}
          </code>
        </p>
      </div>
    );
  }

  // helper: render syllabus in table if header has "syllabus"
  const renderSectionContent = (section: { header: string; content: string }) => {
    if (section.header.toLowerCase().includes("syllabus")) {
      const lines = section.content.split("\n").map((l) => l.trim()).filter(Boolean);

      if (lines.length >= 2) {
        const subjects = lines[0].split(",").map((s) => s.trim());
        const details = lines[1].split(",").map((d) => d.trim());

        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-gray-700">
              <thead className="bg-green-800 text-white">
                <tr>
                  <th className="px-4 py-2 border border-gray-300">Subject</th>
                  <th className="px-4 py-2 border border-gray-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 font-medium">
                      {subject}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {details[idx] || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    return (
      <div
        className="prose max-w-none text-black leading-relaxed"
        dangerouslySetInnerHTML={{ __html: section.content }}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Exam Title */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {examContent.title}
        </h1>
        {examContent.description && (
          <p className="text-xl text-left leading-relaxed text-gray-900 border-l-4 border-yellow-400 pl-4">
            {examContent.description}
          </p>
        )}
      </div>

      {/* Price + Buy Now */}
      <div className="text-center my-12">
        {course && (
          <div className="text-center my-6">
            <p className="text-2xl font-semibold text-gray-800">
              Price: ₹{course.price}
            </p>
          </div>
        )}
        <button
          onClick={handleBuyNow}
          className="px-10 py-4 text-xl font-bold 
               bg-gradient-to-r from-green-600 via-green-700 to-green-800 
               text-white rounded-xl shadow-2xl 
               hover:scale-105 hover:shadow-green-400/50 
               transition-all duration-300 ease-in-out"
        >
          🚀 Buy Now
        </button>
      </div>

      {/* Dynamic Sections */}
      <div className="space-y-12">
        {examContent.exam_info_sections
          .filter((section) => section.is_active)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-lg p-8 border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-green-800 mb-4 border-b-3 border-yellow-400 inline-block pb-1">
                {section.header}
              </h2>
              {renderSectionContent(section)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CoursePage;
