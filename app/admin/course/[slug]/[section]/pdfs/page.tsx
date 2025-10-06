"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";
import PDFUpload from "@/components/admin/PDFUpload";
import PDFDisplay from "@/components/admin/PDFDisplay";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import { fetchAvailableCourses, Course, Section } from "@/src/services/courseService";

interface PDFFile {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_size_kb: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
  description?: string;
  is_active: boolean;
}

const SectionPDFsPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.slug as string;
  const sectionName = decodeURIComponent(params.section as string);

  const [course, setCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get course by slug using the course service
      const courses = await fetchAvailableCourses();
      console.log("All courses:", courses);
      console.log("Looking for course slug:", courseSlug);
      
      const foundCourse = courses.find((c: Course) => {
        const courseSlugFromCode = c.code?.toLowerCase().replace(/\s+/g, "-") || c.id;
        console.log("Checking course:", c.title, "slug:", courseSlugFromCode);
        return courseSlugFromCode === courseSlug;
      });

      if (!foundCourse) {
        setError("Course not found");
        return;
      }

      // Check if section exists
      const sectionExists = foundCourse.sections?.some((s: Section) => 
        s.name?.toLowerCase() === sectionName.toLowerCase()
      );
      
      if (!sectionExists) {
        setError(`Section "${sectionName}" not found in course`);
        return;
      }

      setCourse(foundCourse);

      // Get section files
      try {
        const filesResponse = await api.get(
          `/admin/sections/${foundCourse.id}/${encodeURIComponent(sectionName)}/files`
        );
        console.log("Files response:", filesResponse.data);
        setFiles(filesResponse.data.data.files || []);
      } catch (fileError) {
        console.error("Error fetching section files:", fileError);
        // Don't fail the entire load if files can't be fetched
        setFiles([]);
      }
    } catch (e: unknown) {
      console.error("Error loading course:", e);
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseSlug, sectionName]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleFilesUpdate = (updatedFiles: PDFFile[]) => {
    setFiles(updatedFiles);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!course) return;
    try {
      await api.delete(
        `/admin/sections/${course.id}/${encodeURIComponent(sectionName)}/files/${fileId}`
      );

      const updatedFiles = files.filter((file) => file.id !== fileId);
      setFiles(updatedFiles);
      toast.success("PDF deleted successfully");
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete PDF";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    router.push(`/admin/course/${courseSlug}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading section PDFs...</span>
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
            Back to Course
          </Button>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Course not found"}
          </h2>
          <p className="text-gray-600">
            The course or section you&apos;re looking for doesn&apos;t exist or has been
            removed.
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
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            PDF Management - {sectionName}
          </h1>
          <p className="text-gray-600">Course: {course.title}</p>
        </div>
      </div>

      {/* PDF Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PDFUpload
            courseId={course.id}
            sectionName={sectionName}
            existingFiles={files}
            onFilesUpdate={handleFilesUpdate}
            maxFiles={20}
          />
        </CardContent>
      </Card>

      {/* PDF Display Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PDFDisplay
            files={files}
            onDelete={handleDeleteFile}
            showActions={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionPDFsPage;
