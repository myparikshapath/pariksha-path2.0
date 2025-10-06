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
  const [questionCount, setQuestionCount] = useState<number>(3);
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
      await addSectionToCourse(courseId, sectionName.trim(), questionCount);
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
          <div className="p-4 rounded-full bg-emerald-100">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <span className="ml-3 text-slate-600 text-lg font-medium">
            Loading course...
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
                  Add New Section
                </h1>
                <p className="text-lg text-slate-600">
                  Create a new section for your course content
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
                  <span className="text-sm text-slate-600">Course: </span>
                  <span className="font-semibold text-emerald-700">
                    {course?.title || 'Loading...'}
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
              Section Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g., Physics, Chemistry, Mathematics"
                  className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
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
              
              <div className="space-y-2">
                <Label htmlFor="questionCount">Mock Test Question Count</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                  placeholder="Number of questions to show in mock test"
                />
                <p className="text-sm text-gray-500">
                  How many questions should be randomly selected for this section in mock tests?
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
                <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-6 py-3 shadow-sm transition-all duration-200">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !sectionName.trim() || isDuplicate}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Section
                    </>
                  )}
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
