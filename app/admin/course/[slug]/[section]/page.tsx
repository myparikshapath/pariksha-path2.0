"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Course, fetchCourseBySlug } from "@/src/services/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowLeft, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const SectionUploadPage = () => {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const sectionName = decodeURIComponent(params.section as string);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchCourseBySlug(params.slug as string);
      if (response) {
        setCourse(response);
      } else {
        throw new Error("Course not found");
      }
    } catch (error: unknown) {
      console.error("Error loading course:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [params.slug]);


  useEffect(() => {
    loadCourse();
  }, [params.slug, loadCourse]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csv = acceptedFiles[0];
    if (!csv) {
      setPreviewError("No file selected");
      return;
    }

    if (!csv.name.toLowerCase().endsWith(".csv")) {
      setPreviewError("Invalid file type. Please upload a .csv file.");
      return;
    }

    setFile(csv);
    setPreviewError(null);

    Papa.parse<Record<string, string>>(csv, {
      header: true,
      skipEmptyLines: true,
      preview: 6, // Show first 5 rows for preview
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error("CSV parse errors:", results.errors);
          setPreviewError("Error parsing CSV. Check file format.");
          setPreview([]);
          return;
        }
        const rows = results.data ?? [];
        setPreview(rows.slice(0, 5));
      },
      error: (err) => {
        console.error("Papa parse error:", err);
        setPreviewError("Failed to read CSV file.");
        setPreview([]);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    multiple: false,
    noKeyboard: true,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", course?.id || "");
    formData.append("section", sectionName);

    try {
      await api.post(
        "/courses/upload-questions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Questions uploaded successfully!");
      router.push(`/admin/course/${params.slug}`);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload questions";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    router.push(`/admin/course/${params.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700 font-medium text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 p-6">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="p-6 bg-red-50 rounded-full w-fit mx-auto mb-6 border-2 border-red-100">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Course not found
          </h2>
          <p className="text-gray-600 mb-8">
            The course you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button
            onClick={handleBack}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={handleBack}
            className="flex items-center gap-3 bg-white/80 hover:bg-white/90 text-emerald-700 border border-emerald-200 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Course</span>
          </Button>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full border border-emerald-200 shadow-lg mb-6">
            <Upload className="h-6 w-6 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Upload Questions</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-emerald-800 to-green-800 bg-clip-text">
            Upload Questions for
          </h1>
          <h2 className="text-3xl font-semibold text-emerald-600 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text">
            {sectionName}
          </h2>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Upload className="h-6 w-6" />
              </div>
              Upload Questions CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Enhanced Drag & Drop Zone */}
              <div
                {...getRootProps()}
                className={`relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${isDragActive
                  ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 scale-105 shadow-2xl"
                  : "border-emerald-300 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-25 hover:to-green-25 hover:shadow-xl"
                  }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className={`p-6 rounded-full transition-all duration-300 ${isDragActive
                    ? "bg-emerald-100 scale-110"
                    : "bg-gradient-to-br from-emerald-100 to-green-100 group-hover:scale-105"
                    }`}>
                    <Upload className={`w-12 h-12 transition-colors duration-300 ${isDragActive
                      ? "text-emerald-600"
                      : "text-emerald-500"
                      }`} />
                  </div>
                  <div className="space-y-2">
                    <p className={`text-xl font-semibold transition-colors duration-300 ${isDragActive
                      ? "text-emerald-700"
                      : "text-gray-700"
                      }`}>
                      {isDragActive
                        ? "Drop your CSV file here!"
                        : "Drag & drop your CSV file here"}
                    </p>
                    <p className="text-emerald-600 font-medium">
                      or click to browse files
                    </p>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Upload a CSV file containing your questions with proper formatting
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">Supports CSV files only</span>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>

              {file && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <Upload className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800 text-lg">{file.name}</p>
                        <p className="text-sm text-emerald-600 font-medium">
                          {(file.size / 1024).toFixed(2)} KB • Ready to upload
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>

                  {previewError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {previewError}
                      </p>
                    </div>
                  )}

                  {preview.length > 0 && (
                    <div className="bg-white rounded-lg border border-emerald-200 shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          CSV Preview (First 5 rows)
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-200">
                          <thead className="bg-emerald-50">
                            <tr>
                              {Object.keys(preview[0]).map((header) => (
                                <th
                                  key={header}
                                  className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-emerald-100">
                            {preview.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-emerald-25 transition-colors">
                                {Object.values(row).map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap truncate max-w-xs"
                                    title={cell}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end pt-6 border-t border-emerald-200">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading Questions...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload Questions</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SectionUploadPage;
