"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";

interface Exam {
  id: string;
  title: string;
  code: string;
  category: string;
  sub_category: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Optional: define API response type
interface CourseResponse {
  id?: string;
  title?: string;
  code?: string;
  category?: string;
  sub_category?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 10; // items per page

  const loadExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/courses", {
        params: { limit: 1000, show_all: true },
      });

      const allCourses: CourseResponse[] = Array.isArray(response.data)
        ? response.data
        : response.data.courses || response.data.data || [];

      const courses: Exam[] = allCourses.map((c) => ({
        id: c.id || "",
        title: c.title || "",
        code: c.code || "",
        category: c.category || "",
        sub_category: c.sub_category || "",
        description: c.description || "",
        is_active: Boolean(c.is_active),
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
      }));

      setExams(courses);
    } catch (err) {
      console.error(err);
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExams.length / limit);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const toggleVisibility = async (examId: string) => {
    try {
      const response = await api.put(`/courses/${examId}/toggle-visibility`);
      if (response.status === 200 && response.data.course) {
        const updatedCourse: CourseResponse = response.data.course;
        setExams((prev) =>
          prev.map((exam) =>
            exam.id === examId
              ? { ...exam, is_active: Boolean(updatedCourse.is_active) }
              : exam
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to toggle course visibility.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-600">
        Loading courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-red-600">
        <p>{error}</p>
        <Button onClick={loadExams} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        onClick={() => router.push("/admin/dashboard")}
        className="mb-6 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      {/* Page Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
              Manage Exam Content
            </h1>
            <p className="text-sm sm:text-lg text-slate-600">
              View and manage your exam courses
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={loadExams}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-5 sm:px-6 py-2 sm:py-3"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full mb-8 border rounded-full px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
      />

      {/* Exams Grid */}
      {paginatedExams.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
          <p className="text-slate-600 text-lg mb-6 font-medium">
            No exams found
          </p>
          <Button onClick={loadExams}>Reload</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {paginatedExams.map((exam) => (
            <motion.div
              key={exam.id}
              whileHover={{ scale: 1.0, y: -1 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="bg-white shadow-md rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl border-b border-emerald-200/50 flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-2">
                    {exam.title}
                  </h2>
                  {exam.sub_category && (
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {exam.sub_category}
                    </p>
                  )}
                  {exam.code && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono mt-1">
                      {exam.code}
                    </div>
                  )}
                </div>

                {/* Active/Inactive Toggle */}
                <span title={exam.is_active ? "Active" : "Inactive"}>
                  {exam.is_active ? (
                    <Eye className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-4 flex flex-col justify-between">
                {exam.description && (
                  <p className="text-sm sm:text-base text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {exam.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(exam.id);
                    }}
                    className={`px-4 py-2 cursor-pointer rounded-full text-xs font-medium ${
                      exam.is_active
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-red-200 text-gray-800 hover:bg-red-300"
                    } transition`}
                  >
                    {exam.is_active ? "Active" : "Inactive"}
                  </button>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/admin/exam/${encodeURIComponent(
                          exam.code.toLowerCase().replace(/\s+/g, "-")
                        )}`
                      );
                    }}
                    className="bg-[#2E4A3C] text-white hover:bg-[#22362c] px-4 py-2 rounded-full transition"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-8 gap-2 sm:gap-3 items-center">
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
              className={`px-3 sm:px-4 py-2 rounded-full border ${
                currentPage === page
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
      )}
    </div>
  );
}
