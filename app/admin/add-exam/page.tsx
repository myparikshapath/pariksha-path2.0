"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAvailableCourses,
  deleteCourse,
  Course,
} from "@/src/services/courseService";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteCourseDialog from "@/components/admin/DeleteCourseDialog";
const AddExam = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete states
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  const handleCourseClick = (course: Course) => {
    // Navigate to course detail page using course code as slug
    const slug = course.code?.toLowerCase().replace(/\s+/g, "-") || course.id;
    router.push(`/admin/course/${slug}`);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use direct axios call to bypass authentication
      const data = await fetchAvailableCourses();
      console.log("API Response:", data);

      setCourses(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      console.error("Error loading courses:", e);
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = () => {
    // Navigate to the new exam page
    router.push("/admin/add-exam/new");
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/admin/edit-course/${course.id}`);
  };

  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (courseId: string) => {
    setOperationLoading(true);
    try {
      await deleteCourse(courseId);
      // Refresh the courses list
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Main Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-8 backdrop-blur-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Available Courses
            </h1>
            <p className="text-lg text-slate-600">
              Manage and organize your exam courses
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleAddExam}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5" />
              Add Exam
            </Button>
            <Button
              onClick={loadCourses}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Loader2 className="h-4 w-4" />
              Refresh Courses
            </Button>
          </div>
        </div>
      </div>

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
              <div className="text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="p-4 rounded-full bg-emerald-100 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
            <span className="text-slate-600 text-lg font-medium">
              Loading courses...
            </span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
            <div className="p-4 rounded-full bg-emerald-100 w-fit mx-auto mb-6">
              <Plus className="h-16 w-16 text-emerald-500" />
            </div>
            <p className="text-slate-600 text-lg mb-6 font-medium">
              No courses found
            </p>
            <p className="text-slate-500 mb-6">
              Check if the backend server is running or add your first course.
            </p>
            <Button
              onClick={handleAddExam}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5" />
              Add Your First Course
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-lg hover:-translate-y-1 backdrop-blur-sm bg-gradient-to-br from-white to-slate-50/50"
                onClick={() => handleCourseClick(course)}
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2">
                        {course.title}
                      </CardTitle>
                      {course.sub_category && (
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          {course.sub_category}
                        </p>
                      )}
                      {course.code && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono mb-2">
                          {course.code}
                        </div>
                      )}
                      {course.is_active === false && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 hover:bg-white/50 transition-colors"
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
                            <span className="font-medium">Edit Course</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourse(course)}
                            className="text-red-600 hover:bg-red-50 cursor-pointer py-3 px-4"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            <span className="font-medium">Delete Course</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {course.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            course.is_free ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-lg font-bold text-slate-800">
                          {course.is_free
                            ? "Free"
                            : `₹${course.price.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 font-medium">
                        {Array.isArray(course.sections)
                          ? course.sections.length
                          : 0}{" "}
                        sections
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Course Dialog */}
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
