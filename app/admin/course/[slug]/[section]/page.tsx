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
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Course not found
          </h2>
          <Button onClick={handleBack}  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200">
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          onClick={handleBack}
           className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        Upload Questions for {sectionName}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Questions CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-gray-600">
                  {isDragActive
                    ? "Drop the CSV file here"
                    : "Drag and drop a CSV file here, or click to select"}
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV files with question data
                </p>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>

                {previewError && (
                  <p className="mt-2 text-sm text-red-500">{previewError}</p>
                )}

                {preview.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(preview[0]).map((header) => (
                              <th
                                key={header}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {preview.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap truncate max-w-xs"
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

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionUploadPage;
