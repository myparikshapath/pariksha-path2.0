"use client";

import { useState, useEffect } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteCourse, Course } from "@/src/services/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteCourseDialog from "@/components/admin/DeleteCourseDialog";
import { useCoursesStore } from "@/stores/courses";
import { useStoreSelector } from "@/hooks/useStoreSelector";

const AddExam = () => {
  const router = useRouter();
  const byId = useStoreSelector(useCoursesStore, (s) => s.byId);
  const allIds = useStoreSelector(useCoursesStore, (s) => s.allIds);
  const fetchAll = useStoreSelector(useCoursesStore, (s) => s.fetchAll);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Delete state
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchAll();
    } catch (e: unknown) {
      console.error("Error loading courses:", e);
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const handleCourseClick = (course: Course) => {
    const slug = course.code?.toLowerCase().replace(/\s+/g, "-") || course.id;
    router.push(`/admin/course/${slug}`);
  };

  const handleAddExam = () => router.push("/admin/add-exam/new");
  const handleEditCourse = (course: Course) =>
    router.push(`/admin/edit-course/${course.id}`);

  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (courseId: string) => {
    setOperationLoading(true);
    try {
      await deleteCourse(courseId);
      await loadCourses();
      setDeleteDialogOpen(false);
      setDeletingCourse(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course");
    } finally {
      setOperationLoading(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingCourse(null);
  };

  // Frontend Pagination Logic
  const filteredCourses = allIds
    .map((id) => byId[id])
    .filter(Boolean)
    .filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.code?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCourses.length / limit);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-6 sm:p-8 mb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
              Available Courses
            </h1>
            <p className="text-sm sm:text-lg text-slate-600">
              Manage and organize your exam courses
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleAddExam}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-5 sm:px-6 py-2 sm:py-3"
            >
              <Plus className="h-5 w-5" />
              Add Exam
            </Button>
            <Button
              onClick={loadCourses}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-5 sm:px-6 py-2 sm:py-3"
            >
              <Loader2 className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 max-w-9xl mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-gray-700"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Error Loading Courses
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
          <span className="text-slate-600 text-lg font-medium">
            Loading courses...
          </span>
        </div>
      ) : paginatedCourses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
          <Plus className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <p className="text-slate-600 text-lg mb-6 font-medium">
            No courses found
          </p>
        </div>
      ) : (
        <>
          {/* Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {paginatedCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-lg hover:-translate-y-1"
                onClick={() => handleCourseClick(course)}
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl mt-4 font-bold text-slate-900 group-hover:text-emerald-700 mb-1 sm:mb-2 line-clamp-2">
                        {course.title}
                      </CardTitle>
                      {course.sub_category && (
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mb-1">
                          {course.sub_category}
                        </p>
                      )}
                      {course.code && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono mb-1">
                          {course.code}
                        </div>
                      )}
                      {!course.is_active && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-white/50 transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl min-w-[160px]"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEditCourse(course)}
                            className="hover:bg-emerald-50 cursor-pointer py-3 px-4"
                          >
                            <Edit className="mr-3 h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourse(course)}
                            className="text-red-600 hover:bg-red-50 cursor-pointer py-3 px-4"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            <span className="font-medium">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {course.description && (
                    <p className="text-sm sm:text-base text-slate-600 mb-2 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

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
                  className={`px-3 sm:px-4 py-2 rounded-full border ${currentPage === page
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
        </>
      )}

      <DeleteCourseDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        course={deletingCourse}
        onConfirm={handleConfirmDelete}
        loading={operationLoading}
      />
    </div>
  );
};

export default AddExam;
