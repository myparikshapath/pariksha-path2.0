"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Course,
  CourseListPagination,
  CourseSummary,
  fetchCoursesAdmin,
  getCourseSummary,
  toggleCourseVisibility,
} from "@/src/services/courseService";

export default function AdminExamsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<CourseListPagination>({
    total: 0,
    page: 1,
    limit: 12,
    total_pages: 1,
  });
  const [summary, setSummary] = useState<CourseSummary | null>(null);

  const limit = 12;

  const loadSummary = useCallback(async () => {
    try {
      const data = await getCourseSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCoursesAdmin({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        show_all: true,
        sort_order: "desc",
      });

      setCourses(result.courses);
      setPagination(result.pagination);
      if (result.pagination.page && result.pagination.page !== currentPage) {
        setCurrentPage(result.pagination.page);
      }
    } catch (err) {
      console.error("Failed to load exams", err);
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchQuery]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = useMemo(
    () => pagination.total_pages ?? Math.max(1, Math.ceil(pagination.total / limit)),
    [pagination.total_pages, pagination.total, limit]
  );

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    const { total, active, inactive, last_updated_at } = summary;
    const lastUpdatedLabel = last_updated_at
      ? new Date(last_updated_at).toLocaleString()
      : "-";
    return [
      {
        label: "Total Exams",
        value: total,
        accent: "text-emerald-700",
      },
      {
        label: "Active",
        value: active,
        accent: "text-green-600",
      },
      {
        label: "Inactive",
        value: inactive,
        accent: "text-amber-600",
      },
      {
        label: "Last Updated",
        value: lastUpdatedLabel,
        accent: "text-slate-600",
      },
    ];
  }, [summary]);

  const toggleVisibility = async (examId: string) => {
    try {
      const response = await toggleCourseVisibility(examId);
      if (response?.course) {
        setCourses((prev) =>
          prev.map((exam) =>
            exam.id === examId
              ? { ...exam, is_active: Boolean(response.course.is_active) }
              : exam
          )
        );
        loadSummary();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to toggle course visibility.");
    }
  };

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
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setCurrentPage(1);
                loadCourses();
                loadSummary();
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-5 sm:px-6 py-2 sm:py-3"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                {error}
              </h3>
              <Button
                variant="ghost"
                onClick={loadCourses}
                className="px-0 text-red-600 hover:text-red-700"
              >
                Retry loading
              </Button>
            </div>
          </div>
        </div>
      )}

      {summaryCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {summaryCards.map(({ label, value, accent }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-emerald-100 shadow-md px-5 py-4 flex flex-col gap-1"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </span>
              <span className={`text-2xl font-semibold ${accent}`}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search exams..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full mb-8 border rounded-full px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
      />

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="h-48 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
          <p className="text-slate-600 text-lg mb-6 font-medium">
            No exams found
          </p>
          <Button onClick={loadCourses}>Reload</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {courses.map((exam) => (
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
                    className={`px-4 py-2 cursor-pointer rounded-full text-xs font-medium ${exam.is_active
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
                          (exam.code || exam.title)
                            .toLowerCase()
                            .replace(/\s+/g, "-")
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
      {!loading && totalPages > 1 && (
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
