"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle, FileText, Eye, Download } from "lucide-react";
import api from "@/utils/api";
import {
  fetchAvailableCourses,
  Course,
  Section,
} from "@/src/services/courseService";

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
  const params = useParams<{ courseName: string; sectionName: string }>();
  const router = useRouter();

  const courseSlug = params.courseName; 
  const sectionName = decodeURIComponent(params.sectionName);

  const [course, setCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courses = await fetchAvailableCourses();

      const foundCourse = courses.find((c: Course) => {
        const courseSlugFromCode =
          c.id.toLowerCase() || c.code?.toLowerCase().replace(/\s+/g, "-");
        return courseSlugFromCode === courseSlug.toLowerCase();
      });

      if (!foundCourse) {
        setError("Course not found");
        return;
      }

      const sectionExists = foundCourse.sections?.some(
        (s: Section) => s.name?.toLowerCase() === sectionName.toLowerCase()
      );

      if (!sectionExists) {
        setError(`Section "${sectionName}" not found in course`);
        return;
      }

      setCourse(foundCourse);

      try {
        const filesResponse = await api.get(
          `/admin/sections/${foundCourse.id}/${encodeURIComponent(
            sectionName
          )}/files`
        );
        setFiles(filesResponse.data.data.files || []);
      } catch (fileError) {
        console.error("Error fetching section files:", fileError);
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
    if (courseSlug && sectionName) {
      loadCourse();
    }
  }, [loadCourse, courseSlug, sectionName]);

  const handleBack = () => {
    router.push(`/course/${courseSlug}`);
  };

  const fixDoSpacesUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('/pariksha-path-bucket/')) return url;
    return url.replace(/^(https?:\/\/[^/]+)\/(courses\/.*)$/i, '$1/pariksha-path-bucket/$2');
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
             
            className="flex items-center gap-2"
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
            The course or section you&apos;re looking for doesn&apos;t exist or
            has been removed.
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
           
           className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {sectionName} - PDFs
          </h1>
          <p className="text-gray-600">Course: {course.title}</p>
        </div>
      </div>

      {/* PDF Display Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <div className="space-y-6">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        {file.original_filename}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                           
                          onClick={() => window.open(fixDoSpacesUrl(file.file_url), "_blank")}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                           
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = fixDoSpacesUrl(file.file_url);
                            link.download = file.original_filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {file.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {file.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="w-full h-96 border rounded-lg overflow-hidden">
                      <iframe
                        src={fixDoSpacesUrl(file.file_url)}
                        className="w-full h-full"
                        title={`PDF: ${file.original_filename}`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>
                        Size: {(file.file_size_kb / 1024).toFixed(1)} MB
                      </span>
                      <span>
                        Uploaded:{" "}
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No PDFs available for this section yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionPDFsPage;
