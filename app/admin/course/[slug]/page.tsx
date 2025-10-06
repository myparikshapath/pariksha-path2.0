"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAvailableCourses,
  deleteSectionFromCourse,
  updateSectionQuestionCount,
  Course
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
  Eye
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
    router.push(`/admin/course/${params.slug}/${encodeURIComponent(section)}/pdfs`);
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
    router.push(`/admin/edit-section/${course.id}/${encodeURIComponent(sectionName)}`);
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
      setError(error instanceof Error ? error.message : "Failed to delete section");
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
            The course you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={handleBackClick}
           className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </div>

      {/* Course Info */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg border border-slate-200/50 p-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text ">{course.title}</h1>
              {course.sub_category && (
                <p className="text-xl text-slate-600 mb-3 font-medium">{course.sub_category}</p>
              )}
              {course.code && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-mono">
                  <span className="opacity-75">Code:</span> {course.code}
                </div>
              )}
            </div>
            <div className="text-left lg:text-right">
              <div className="flex items-center gap-3 text-3xl font-bold text-emerald-600 mb-2">
                <div className="p-2 rounded-full bg-emerald-100">
                  <DollarSign className="h-8 w-8" />
                </div>
                {course.is_free ? "Free" : `Rs.${course.price.toFixed(2)}`}
              </div>
              <div className="text-sm text-slate-500 font-medium">
                {course.is_free ? "No payment required" : "One-time payment"}
              </div>
            </div>
          </div>
          {course.description && <p className="text-slate-700 text-lg leading-relaxed mb-6">{course.description}</p>}

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm">
              <div className="p-2 rounded-full bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-700">
                {Array.isArray(course.sections) ? course.sections.length : 0} Sections
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm">
              <div className="p-2 rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <span className="font-semibold text-slate-700">Self-paced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div>
        <div className="flex justify-between itemscenter mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900">Course Sections</h2>
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {Array.isArray(course.sections) ? course.sections.length : 0} sections
            </div>
          </div>
          <Button onClick={handleAddSection} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-5 w-5" />
            Add Section
          </Button>
        </div>

        {!course.sections || course.sections.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
            <div className="p-4 rounded-full bg-blue-100 w-fit mx-auto mb-6">
              <BookOpen className="h-16 w-16 text-blue-500" />
            </div>
            <p className="text-slate-600 text-lg mb-6 font-medium">No sections available for this course yet.</p>
            <Button onClick={handleAddSection} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
              <Plus className="h-5 w-5" />
              Add First Section
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
            {course.sections.map((section, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-lg hover:-translate-y-1 backdrop-blur-sm bg-gradient-to-br from-white to-slate-50/50"
              >
                <CardHeader className="pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-slate-200/50 min-h-[80px]">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex-1">{section.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DropdownMenu open={dropdownOpen === section.name} onOpenChange={(open) => setDropdownOpen(open ? section.name : null)}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-white/50 transition-colors">
                          <MoreVertical className="h-5 w-5 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl min-w-[160px]">
                        <DropdownMenuItem onClick={() => handleEditSection(section.name)} className="hover:bg-emerald-50 cursor-pointer py-3 px-4">
                          <Edit className="mr-3 h-4 w-4 text-emerald-600" />
                          <span className="font-medium">Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSection(section.name)}
                          className="text-red-600 hover:bg-red-50 cursor-pointer py-3 px-4"
                        >
                          <Trash2 className="mr-3 h-4 w-4" />
                          <span className="font-medium">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-6 p-6">
                  {/* Number of Questions */}
                  <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg bg-slate-50/50 border border-slate-200/50">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Questions:
                    </label>
                    {isEditingSection === section.name ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number"
                          min={0}
                          value={tempQuestionCount}
                          onChange={(e) => setTempQuestionCount(e.target.value)}
                          className="border border-blue-200 rounded-lg px-3 py-2 w-20 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <button
                          className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
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
                                console.error("Failed to update question count", err);
                                setError("Failed to update question count");
                              }
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors"
                          onClick={() => setIsEditingSection(null)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-slate-800 px-2 py-1 rounded bg-white border border-slate-200">{section.question_count || 0}</span>
                        <button
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                          onClick={(e) => {
                            setIsEditingSection(section.name);
                            setTempQuestionCount(section.question_count.toString() || "0");
                            e.stopPropagation();
                          }}
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 flex-1 min-w-[120px] border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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
                      className="flex items-center gap-2 flex-1 min-w-[120px] border-slate-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
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
                      className="flex items-center gap-2 flex-1 min-w-[120px] border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
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
  );
};

export default CourseDetailPage;
