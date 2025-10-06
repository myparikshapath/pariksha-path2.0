"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  updateSectionInCourse,
  deleteSectionFromCourse,
  getCourseDetails,
  Course,
} from "@/src/services/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EditSectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const sectionName = decodeURIComponent(params.sectionName as string);

  console.log("EditSectionPage - URL params:", params);
  console.log("EditSectionPage - courseId:", courseId);
  console.log("EditSectionPage - sectionName:", sectionName);

  const [course, setCourse] = useState<Course | null>(null);
  const [newSectionName, setNewSectionName] = useState(sectionName);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading course with ID:", courseId);
      console.log("Section name:", sectionName);

      const courseData = await getCourseDetails(courseId);
      console.log("Course data loaded:", courseData);
      console.log("Course sections:", courseData.sections);
      console.log("Course sections type:", typeof courseData.sections);
      console.log("Course sections length:", courseData.sections?.length);

      // Debug: Check each section individually
      if (courseData.sections) {
        courseData.sections.forEach((section, index) => {
          console.log(`Section ${index}:`, section);
          console.log(`Section ${index} type:`, typeof section);
          console.log(`Section ${index} name:`, section?.name);
          console.log(
            `Section ${index} has name:`,
            !!(section && section.name)
          );
        });
      }

      setCourse(courseData);

      // Check if section exists using multiple approaches
      let validSections: Array<{ name: string }> = [];

      // Handle both string sections and object sections
      if (courseData.sections && courseData.sections.length > 0) {
        if (typeof courseData.sections[0] === "string") {
          // Sections are stored as strings - convert to objects
          validSections = courseData.sections.map(
            (sectionName: string, index: number) => ({
              name: sectionName,
              description: `Section ${index + 1}: ${sectionName}`,
              order: index + 1,
              question_count: 0,
              is_active: true,
            })
          );
        } else {
          // Sections are proper objects - filter valid ones
          validSections = courseData.sections.filter((s) => s && s.name);
        }
      }

      console.log("Valid sections count:", validSections.length);
      console.log(
        "Valid sections:",
        validSections.map((s) => s.name)
      );

      // Exact match
      const exactMatch = validSections.find((s) => s.name === sectionName);

      // Case-insensitive match
      const caseInsensitiveMatch = validSections.find(
        (s) => s.name.toLowerCase() === sectionName.toLowerCase()
      );

      console.log("Exact match:", exactMatch?.name);
      console.log("Case insensitive match:", caseInsensitiveMatch?.name);

      if (!exactMatch) {
        if (caseInsensitiveMatch) {
          setError(
            `Section "${sectionName}" not found (case-sensitive). Did you mean "${caseInsensitiveMatch.name}"?`
          );
        } else if (validSections.length === 0) {
          setError(
            `Section "${sectionName}" not found. This course has no valid sections. Course sections: ${JSON.stringify(
              courseData.sections
            )}`
          );
        } else {
          setError(
            `Section "${sectionName}" not found in this course. Available sections: ${validSections
              .map((s) => s.name)
              .join(", ")}`
          );
        }
      }
    } catch (e: unknown) {
      console.error("Error loading course:", e);
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId, sectionName]);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, loadCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || newSectionName.trim() === sectionName) return;

    setSaving(true);
    try {
      await updateSectionInCourse(courseId, sectionName, newSectionName.trim());
      router.push(
        `/admin/course/${
          course.code?.toLowerCase().replace(/\s+/g, "-") || course.id
        }`
      );
    } catch (error: unknown) {
      console.error("Error updating section:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update section"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!course) return;

    setDeleting(true);
    try {
      await deleteSectionFromCourse(courseId, sectionName);
      router.push(
        `/admin/course/${
          course.code?.toLowerCase().replace(/\s+/g, "-") || course.id
        }`
      );
    } catch (error: unknown) {
      console.error("Error deleting section:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete section"
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    if (course) {
      router.push(
        `/admin/course/${
          course.code?.toLowerCase().replace(/\s+/g, "-") || course.id
        }`
      );
    } else {
      router.push("/admin/add-exam");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="p-4 rounded-full bg-emerald-100">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <span className="ml-3 text-slate-600 text-lg font-medium">
            Loading section...
          </span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleBack}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Section not found"}
          </h2>
          <p className="text-gray-600">
            The section you&apos;re trying to edit doesn&apos;t exist or has
            been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={handleBack}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>

        <div className="mt-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Edit Section
                </h1>
                <p className="text-lg text-slate-600">
                  Update section name and manage course content
                </p>
                {course && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {course.code}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      {course.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-200/50">
                  <span className="text-sm text-slate-600">Current: </span>
                  <span className="font-semibold text-emerald-700">
                    {sectionName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b border-emerald-200/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Section Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Enter section name"
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                  required
                />
                <p className="text-sm text-slate-500">
                  Current name:{" "}
                  <span className="font-medium text-slate-700">
                    {sectionName}
                  </span>
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={saving || deleting}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Section
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-6 py-3 shadow-sm transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      deleting ||
                      !newSectionName.trim() ||
                      newSectionName.trim() === sectionName
                    }
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the section &quot;{sectionName}
              &quot;? This action will remove the section and all its associated
              questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Section
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditSectionPage;
