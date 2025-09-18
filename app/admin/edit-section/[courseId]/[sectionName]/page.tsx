"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  updateSectionInCourse,
  deleteSectionFromCourse,
  getCourseDetails,
  Course
} from "@/src/services/courseService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Trash2
} from "lucide-react";
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

      const courseData = await getCourseDetails(courseId);
      setCourse(courseData);

      // Check if section exists
      if (!courseData.sections?.some(s => s.name)) {
        setError(`Section "${sectionName}" not found in this course`);
      }
    } catch (e: unknown) {
      console.error('Error loading course:', e);
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
      router.push(`/admin/course/${course.code?.toLowerCase().replace(/\s+/g, '-') || course.id}`);
    } catch (error: unknown) {
      console.error("Error updating section:", error);
      setError(error instanceof Error ? error.message : "Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!course) return;

    setDeleting(true);
    try {
      await deleteSectionFromCourse(courseId, sectionName);
      router.push(`/admin/course/${course.code?.toLowerCase().replace(/\s+/g, '-') || course.id}`);
    } catch (error: unknown) {
      console.error("Error deleting section:", error);
      setError(error instanceof Error ? error.message : "Failed to delete section");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    if (course) {
      router.push(`/admin/course/${course.code?.toLowerCase().replace(/\s+/g, '-') || course.id}`);
    } else {
      router.push("/admin/add-exam");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading section...</span>
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
            variant="outline"
            className="flex items-center gap-2"
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
            The section you&apos;re trying to edit doesn&apos;t exist or has been removed.
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
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Section</h1>
          <p className="text-gray-600">Course: {course.title}</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Section Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Enter section name"
                  required
                />
                <p className="text-sm text-gray-500">
                  Current name: {sectionName}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={saving || deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Section
                </Button>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || deleting || !newSectionName.trim() || newSectionName.trim() === sectionName}
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
              Are you sure you want to delete the section &quot;{sectionName}&quot;? This action will remove
              the section and all its associated questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditSectionPage;
