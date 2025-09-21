"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addSectionToCourse,
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
  Plus
} from "lucide-react";

const AddSectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseData = await getCourseDetails(courseId);
      setCourse(courseData);
    } catch (e: unknown) {
      console.error('Error loading course:', e);
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, loadCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !sectionName.trim()) return;

    setSaving(true);
    try {
      await addSectionToCourse(courseId, sectionName.trim());
      router.push(`/admin/course/${course.code?.toLowerCase().replace(/\s+/g, '-') || course.id}`);
    } catch (error) {
      console.error("Error adding section:", error);
      setError("Failed to add section");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (course) {
      router.push(`/admin/course/${course.code?.toLowerCase().replace(/\s+/g, '-') || course.id}`);
    } else {
      router.push("/admin/add-exam");
    }
  };

  const isDuplicate = course?.sections?.some(s => s.name) || false;

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
            {error || "Course not found"}
          </h2>
          <p className="text-gray-600">
            The course you&apos;re trying to add a section to doesn&apos;t exist or has been removed.
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Section</h1>
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
            <CardTitle>Section Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g., Physics, Chemistry, Mathematics"
                  required
                />
                {isDuplicate && sectionName.trim() && (
                  <p className="text-sm text-red-600">
                    A section with this name already exists.
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Enter a descriptive name for the new section.
                </p>
              </div>

              {course.sections && course.sections.length > 0 && (
                <div className="space-y-2">
                  <Label>Existing Sections:</Label>
                  <div className="flex flex-wrap gap-2">
                    {course.sections.map((section, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md 
                        text-sm"
                      >
                        {section.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !sectionName.trim() || isDuplicate}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddSectionPage;
