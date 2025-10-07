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
  Clock,
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

  const handleUploadQuestions = (section: string) => {
    router.push(`/admin/course/${params.slug}/${encodeURIComponent(section)}`);
  };

  const handleViewQuestions = (section: string) => {
    router.push(`/course/${params.slug}/${encodeURIComponent(section)}`);
  };

  const handleManagePDFs = (section: string) => {
    router.push(
      `/admin/course/${params.slug}/${encodeURIComponent(section)}/pdfs`
    );
  };

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courses = await fetchAvailableCourses();

      const foundCourse = courses.find((c) => {
        const courseSlug = c.code?.toLowerCase().replace(/\s+/g, "-") || c.id;
        return courseSlug === params.slug;
      });

      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError("Course not found");
      }
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

  const handleBackClick = () => {
    router.push("/admin/add-exam");
  };

  const handleAddSection = () => {
    if (!course) return;
    router.push(`/admin/add-section/${course.id}`);
  };

  const handleEditSection = (sectionName: string) => {
    if (!course) return;
    router.push(
      `/admin/edit-section/${course.id}/${encodeURIComponent(sectionName)}`
    );
  };

  const handleDeleteSection = (sectionName: string) => {
    setDeletingSection(sectionName);
    setDeleteSectionDialogOpen(true);
  };

  const handleConfirmDeleteSection = async (sectionName: string) => {
    if (!course) return;

    setOperationLoading(true);
    try {
      await deleteSectionFromCourse(course.id, sectionName);
      await loadCourse();
      setDeleteSectionDialogOpen(false);
      setDeletingSection(null);
    } catch (error: unknown) {
      console.error("Error deleting section:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete section"
      );
    } finally {
      setOperationLoading(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteSectionDialogOpen(false);
    setDeletingSection(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleBackClick}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Course not found"}
          </h2>
          <p className="text-gray-600">
            The course you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5fcf7] py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={handleBackClick}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[#1f7a53] shadow-sm border border-[#d6f5e5] hover:bg-[#ebfaf2] hover:text-[#176344]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Courses
          </Button>
        </div>

        {/* Course Info */}
        <div className="mb-10">
          <div className="rounded-2xl border border-[#d6f5e5] bg-white shadow-sm">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 p-8">
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl lg:text-4xl font-semibold text-[#143f2a]">
                  {course.title}
                </h1>
                {course.sub_category && (
                  <p className="inline-flex rounded-full bg-[#f0fbf4] px-4 py-1.5 text-[#1f7a53] text-sm font-medium border border-[#d6f5e5]">
                    {course.sub_category}
                  </p>
                )}
                {course.code && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0fbf4] text-[#176344] text-xs font-semibold uppercase tracking-wide border border-[#d6f5e5]">
                    <span className="opacity-70">Code</span>
                    <span className="font-mono text-sm">{course.code}</span>
                  </div>
                )}
              </div>
              <div className="text-left lg:text-right space-y-3">
                <div className="inline-flex items-center gap-3 rounded-xl bg-[#f0fbf4] px-4 py-3 shadow-sm border border-[#d6f5e5]">
                  <div className="p-3 rounded-full bg-[#1f7a53] text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-semibold text-[#176344]">
                      {course.is_free
                        ? "Free"
                        : `Rs.${course.price.toFixed(2)}`}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-[#2c8a62] font-medium">
                      {course.is_free
                        ? "No payment required"
                        : "One-time payment"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {course.description && (
              <p className="px-8 pb-8 text-base leading-relaxed text-[#285d43]">
                {course.description}
              </p>
            )}

            <div className="px-8 pb-8 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-3 rounded-full bg-[#f0fbf4] px-4 py-2 border border-[#d6f5e5]">
                <div className="p-2 rounded-full bg-[#d6f5e5]">
                  <BookOpen className="h-4 w-4 text-[#1f7a53]" />
                </div>
                <span className="font-medium text-[#1f7a53]">
                  {Array.isArray(course.sections) ? course.sections.length : 0}{" "}
                  Sections
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-[#f0fbf4] px-4 py-2 border border-[#d6f5e5]">
                <div className="p-2 rounded-full bg-[#d6f5e5]">
                  <Calendar className="h-4 w-4 text-[#1f7a53]" />
                </div>
                <span className="font-medium text-[#1f7a53]">
                  {course.validity_period_days || 365} days validity
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-[#143f2a]">
                Course Sections
              </h2>
              <div className="px-3 py-1 rounded-full bg-[#f0fbf4] text-[#1f7a53] text-sm font-medium border border-[#d6f5e5]">
                {Array.isArray(course.sections) ? course.sections.length : 0}{" "}
                sections
              </div>
            </div>
            <Button
              onClick={handleAddSection}
              className="flex items-center gap-2 rounded-full bg-[#1f7a53] px-4 py-2 text-white shadow-sm hover:bg-[#176344]"
            >
              <Plus className="h-5 w-5" />
              Add Section
            </Button>
          </div>

          {!course.sections || course.sections.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-[#d6f5e5] rounded-2xl bg-white shadow-sm">
              <div className="p-4 rounded-full bg-[#f0fbf4] w-fit mx-auto mb-4">
                <BookOpen className="h-14 w-14 text-[#1f7a53]" />
              </div>
              <p className="text-[#285d43] text-lg mb-5 font-medium">
                No sections available for this course yet.
              </p>
              <Button
                onClick={handleAddSection}
                className="flex items-center gap-2 rounded-full bg-[#1f7a53] px-6 py-3 text-white shadow-sm hover:bg-[#176344]"
              >
                <Plus className="h-5 w-5" />
                Add First Section
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
              {course.sections.map((section, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden border border-[#e3f6ec] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardHeader className="pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f9fefb] border-b border-[#e3f6ec]">
                    <div className="flex items-center gap-4 flex-wrap w-full">
                      <CardTitle className="text-lg font-semibold text-[#143f2a] group-hover:text-[#1f7a53] transition-colors flex-1 -mb-6">
                        {section.name}
                      </CardTitle>
                    </div>
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
                          className="h-9 w-9 p-0 rounded-full text-[#1f7a53] hover:bg-[#e9f8f0]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border border-[#e3f6ec] shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditSection(section.name)}
                          className="hover:bg-[#f0fbf4] cursor-pointer py-2.5 px-4 text-[#1f7a53]"
                        >
                          <Edit className="mr-3 h-4 w-4" />
                          <span className="font-medium">Edit Section</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSection(section.name)}
                          className="text-red-600 hover:bg-red-50 cursor-pointer py-2.5 px-4"
                        >
                          <Trash2 className="mr-3 h-4 w-4" />
                          <span className="font-medium">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-5 p-5">
                    {/* Number of Questions */}
                    <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg bg-[#f5fbf7] border border-[#e3f6ec]">
                      <label className="text-sm font-medium text-[#285d43] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#1f7a53]"></div>
                        Questions:
                      </label>
                      {isEditingSection === section.name ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="number"
                            min={0}
                            value={tempQuestionCount}
                            onChange={(e) =>
                              setTempQuestionCount(e.target.value)
                            }
                            className="border border-[#d6f5e5] rounded-md px-3 py-1.5 w-20 text-sm focus:ring-1 focus:ring-[#1f7a53] focus:border-[#1f7a53]"
                          />
                          <button
                            className="p-2 rounded-md bg-[#1f7a53] text-white hover:bg-[#176344]"
                            onClick={async () => {
                              if (tempQuestionCount && course) {
                                try {
                                  await updateSectionQuestionCount(
                                    course.id,
                                    section.name,
                                    tempQuestionCount
                                  );
                                  await loadCourse();
                                  setIsEditingSection(null);
                                } catch (err) {
                                  console.error(
                                    "Failed to update question count",
                                    err
                                  );
                                  setError("Failed to update question count");
                                }
                              }
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 rounded-md border border-[#d6f5e5] text-[#285d43] hover:bg-[#e9f8f0]"
                            onClick={() => setIsEditingSection(null)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-semibold text-[#143f2a] px-3 py-1.5 rounded-md bg-white border border-[#e3f6ec]">
                            {section.question_count || 0}
                          </span>
                          <button
                            className="p-2 rounded-md border border-[#e3f6ec] text-[#1f7a53] hover:bg-[#f0fbf4]"
                            onClick={(e) => {
                              setIsEditingSection(section.name);
                              setTempQuestionCount(
                                section.question_count.toString() || "0"
                              );
                              e.stopPropagation();
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        className="flex items-center gap-2 flex-1 min-w-[120px] justify-center rounded-md border border-[#d6f5e5] bg-white text-[#1f7a53] hover:bg-[#f0fbf4]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewQuestions(section.name);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">View Questions</span>
                      </Button>
                      <Button
                        size="sm"
                        className="flex items-center gap-2 flex-1 min-w-[120px] justify-center rounded-md bg-[#1f7a53] text-white hover:bg-[#176344]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadQuestions(section.name);
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="font-medium">Upload Questions</span>
                      </Button>
                      <Button
                        size="sm"
                        className="flex items-center gap-2 flex-1 min-w-[120px] justify-center rounded-md border border-[#fbe6b2] bg-white text-[#b58102] hover:bg-[#fff6e0]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManagePDFs(section.name);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Manage PDFs</span>
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
