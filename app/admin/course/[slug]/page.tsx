"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAvailableCourses,
  deleteSectionFromCourse,
  updateSectionQuestionCount,
  Course,
} from "@/src/services/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  BookOpen,
  Check,
  DollarSign,
  Edit,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  MoreVertical,
  FileText,
  Eye,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteSectionDialog from "@/components/admin/DeleteSectionDialog";

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Section management states
  const [deletingSection, setDeletingSection] = useState<string | null>(null);
  const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null);
  const [tempQuestionCount, setTempQuestionCount] = useState<string>("0");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleUploadQuestions = (section: string) =>
    router.push(`/admin/course/${params.slug}/${encodeURIComponent(section)}`);

  const handleViewQuestions = (section: string) =>
    router.push(`/course/${params.slug}/${encodeURIComponent(section)}`);

  const handleManagePDFs = (section: string) =>
    router.push(
      `/admin/course/${params.slug}/${encodeURIComponent(section)}/pdfs`
    );

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const courses = await fetchAvailableCourses();
      const foundCourse = courses.find((c) => {
        const courseSlug = c.code?.toLowerCase().replace(/\s+/g, "-") || c.id;
        return courseSlug === params.slug;
      });
      if (foundCourse) setCourse(foundCourse);
      else setError("Course not found");
    } catch (e: unknown) {
      console.error("Error loading course:", e);
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    loadCourse();
  }, [params.slug, loadCourse]);

  const handleBackClick = () => router.push("/admin/add-exam");
  const handleAddSection = () =>
    course && router.push(`/admin/add-section/${course.id}`);
  const handleEditSection = (s: string) =>
    course && router.push(`/admin/edit-section/${course.id}/${encodeURIComponent(s)}`);
  const handleDeleteSection = (s: string) => {
    setDeletingSection(s);
    setDeleteSectionDialogOpen(true);
  };
  const handleConfirmDeleteSection = async (s: string) => {
    if (!course) return;
    setOperationLoading(true);
    try {
      await deleteSectionFromCourse(course.id, s);
      await loadCourse();
      setDeleteSectionDialogOpen(false);
      setDeletingSection(null);
    } catch (error: unknown) {
      console.error("Error deleting section:", error);
      setError(error instanceof Error ? error.message : "Failed to delete section");
    } finally {
      setOperationLoading(false);
    }
  };
  const closeDeleteDialog = () => {
    setDeleteSectionDialogOpen(false);
    setDeletingSection(null);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );

  if (error || !course)
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {error || "Course not found"}
        </h2>
        <Button
          onClick={handleBackClick}
          className="mt-4 bg-green-700 hover:bg-green-800 text-white rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f5fcf7] py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            onClick={handleBackClick}
            className="flex items-center gap-2 rounded-full bg-white px-4 sm:px-5 py-2 text-[#1f7a53] border border-[#d6f5e5] hover:bg-[#ebfaf2]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Courses
          </Button>
        </div>

        {/* Course Info */}
        <div className="mb-8">
          <div className="rounded-2xl border border-[#d6f5e5] bg-white shadow-sm p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#143f2a]">
                  {course.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {course.sub_category && (
                    <span className="px-3 py-1 text-sm bg-[#f0fbf4] border border-[#d6f5e5] rounded-full text-[#1f7a53]">
                      {course.sub_category}
                    </span>
                  )}
                  {course.code && (
                    <span className="px-3 py-1 text-xs bg-[#f0fbf4] border border-[#d6f5e5] rounded-full text-[#176344] font-mono uppercase">
                      {course.code}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-left lg:text-right">
                <div className="inline-flex items-center gap-3 bg-[#f0fbf4] border border-[#d6f5e5] rounded-xl px-4 py-3">
                  <div className="p-3 rounded-full bg-[#1f7a53] text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-semibold text-[#176344]">
                      {course.is_free ? "Free" : `₹${course.price.toFixed(2)}`}
                    </div>
                    <div className="text-xs uppercase text-[#2c8a62] font-medium">
                      {course.is_free ? "No payment" : "One-time payment"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {course.description && (
              <p className="mt-4 text-[#285d43] text-sm sm:text-base leading-relaxed">
                {course.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 text-sm bg-[#f0fbf4] border border-[#d6f5e5] px-3 py-2 rounded-full text-[#1f7a53]">
                <BookOpen className="h-4 w-4" />
                {course.sections?.length || 0} Sections
              </span>
              <span className="flex items-center gap-2 text-sm bg-[#f0fbf4] border border-[#d6f5e5] px-3 py-2 rounded-full text-[#1f7a53]">
                <Calendar className="h-4 w-4" />
                {course.validity_period_days || 365} Days validity
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#143f2a]">
                Course Sections
              </h2>
              <span className="px-3 py-1 text-sm bg-[#f0fbf4] border border-[#d6f5e5] rounded-full text-[#1f7a53]">
                {course.sections?.length || 0}
              </span>
            </div>
            <Button
              onClick={handleAddSection}
              className="flex items-center gap-2 rounded-full bg-[#1f7a53] px-4 py-2 text-white shadow-sm hover:bg-[#176344]"
            >
              <Plus className="h-5 w-5" /> Add Section
            </Button>
          </div>

          {!course.sections?.length ? (
            <div className="text-center py-12 border border-dashed border-[#d6f5e5] rounded-2xl bg-white shadow-sm">
              <BookOpen className="h-12 w-12 text-[#1f7a53] mx-auto mb-4" />
              <p className="text-[#285d43] text-base sm:text-lg mb-5">
                No sections available yet.
              </p>
              <Button
                onClick={handleAddSection}
                className="rounded-full bg-[#1f7a53] px-6 py-2.5 text-white hover:bg-[#176344]"
              >
                <Plus className="mr-2 h-4 w-4" /> Add First Section
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {course.sections.map((section, index) => (
                <Card
                  key={index}
                  className="group border border-[#e3f6ec] bg-white hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="flex justify-between items-center bg-[#f9fefb] border-b border-[#e3f6ec] px-5 py-3">
                    <CardTitle className="text-[#143f2a] text-base sm:text-lg font-semibold">
                      {section.name}
                    </CardTitle>
                    <DropdownMenu
                      open={dropdownOpen === section.name}
                      onOpenChange={(open) =>
                        setDropdownOpen(open ? section.name : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-[#1f7a53] hover:bg-[#e9f8f0]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditSection(section.name)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSection(section.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="p-5 flex flex-col gap-4">
                    {/* Questions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-[#285d43]">
                        Questions:
                      </span>
                      {isEditingSection === section.name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempQuestionCount}
                            onChange={(e) => setTempQuestionCount(e.target.value)}
                            className="border border-[#d6f5e5] rounded-md px-3 py-1 w-20 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (course) {
                                await updateSectionQuestionCount(
                                  course.id,
                                  section.name,
                                  tempQuestionCount
                                );
                                await loadCourse();
                                setIsEditingSection(null);
                              }
                            }}
                            className="bg-[#1f7a53] hover:bg-[#176344]"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingSection(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#143f2a]">
                            {section.question_count || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingSection(section.name);
                              setTempQuestionCount(
                                section.question_count?.toString() || "0"
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#d6f5e5] text-[#1f7a53]"
                        onClick={() => handleViewQuestions(section.name)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button
                        className="flex-1 bg-[#1f7a53] hover:bg-[#176344] text-white"
                        onClick={() => handleUploadQuestions(section.name)}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Upload
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-[#fbe6b2] text-[#b58102]"
                        onClick={() => handleManagePDFs(section.name)}
                      >
                        <FileText className="mr-2 h-4 w-4" /> PDFs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Section Dialog */}
        <DeleteSectionDialog
          isOpen={deleteSectionDialogOpen}
          onClose={closeDeleteDialog}
          sectionName={deletingSection || ""}
          onConfirm={handleConfirmDeleteSection}
          loading={operationLoading}
        />
      </div>
    </div>
  );
};

export default CourseDetailPage;
