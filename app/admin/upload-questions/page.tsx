"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { FiUpload, FiX, FiFileText } from "react-icons/fi";
// import api from "@/utils/api";

// Schema for form validation
const formSchema = z.object({
  testTitle: z.string().min(3, "Test title is required").max(100),
  examCategory: z.string().min(1, "Exam category is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional(),
  difficulty: z.string().min(1, "Difficulty is required"),
  durationMinutes: z
    .number()
    .int()
    .positive("Duration must be a positive number"),
  isFree: z.boolean().default(false).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function UploadQuestions() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Define available exam categories
  // const examCategories = [
  //   { value: "medical", label: "Medical (NEET)" },
  //   { value: "engineering", label: "Engineering (JEE)" },
  //   { value: "teaching", label: "Teaching (HTET, CTET, DSSSB, KVS)" },
  //   { value: "govt_exams", label: "Government Exams (SSC, UPSC)" },
  // ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testTitle: "",
      examCategory: "",
      subject: "",
      topic: undefined,
      difficulty: "MEDIUM",
      durationMinutes: 60,
      isFree: false,
    },
  });

  // const selectedExamCategory = watch("examCategory");

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files received:", acceptedFiles);
    const csvFile = acceptedFiles[0];

    if (!csvFile) {
      console.log("No file received");
      return;
    }

    console.log("File details:", {
      name: csvFile.name,
      type: csvFile.type,
      size: csvFile.size,
      lastModified: csvFile.lastModified,
    });

    // Validate file type by extension
    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      const errorMsg = `Invalid file type: ${csvFile.name}. Please upload a .csv file`;
      console.error(errorMsg);
      setPreviewError(errorMsg);
      return;
    }

    console.log("File is valid, setting state...");
    setFile(csvFile);
    setPreviewError(null);

    // Preview first 5 rows
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split("\n").slice(0, 6); // First 5 rows + header
        const headers = rows[0].split(",").map((h) => h.trim());

        const previewData = rows.slice(1).map((row) => {
          const values = row.split(",");
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim() || "";
            return obj;
          }, {} as Record<string, string>);
        });

        setPreview(previewData);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setPreviewError("Error parsing CSV file. Please check the format.");
      }
    };
    reader.readAsText(csvFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Be more permissive with accepted files
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
      "application/csv": [".csv"],
      "text/plain": [".csv"],
      "application/octet-stream": [".csv"],
      "": [".csv"], // Fallback for any file type
    },
    maxFiles: 1,
    multiple: false,
    // Add error handling
    onError: (err) => {
      console.error("Dropzone error:", err);
      setPreviewError("Error processing file. Please try again.");
    },
    // Disable click-to-upload to force drag and drop
    // noClick: true,
    // Disable keyboard navigation
    noKeyboard: true,
    // Disable click on the dropzone container
    noClick: false,
  });

  const removeFile = () => {
    setFile(null);
    setPreview([]);
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    // Validate exam category
    if (!data.examCategory) {
      toast.error("Please select an exam category");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("test_title", data.testTitle);
    formData.append("exam_category", data.examCategory.toUpperCase());
    formData.append("exam_subcategory", data.examCategory); // Using same as category for now
    formData.append("subject", data.subject);
    if (data.topic) formData.append("topic", data.topic);
    formData.append("difficulty", data.difficulty.toUpperCase());
    formData.append("duration_minutes", data.durationMinutes.toString());
    formData.append("is_free", String(data?.isFree || false));

    try {
      // const response = await api.post(
      //   "/admin/tests/import-questions",
      //   formData,
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   }
      // );

      toast.success("Questions imported successfully!");
      reset();
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to import questions";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Upload Questions</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <input {...getInputProps()} className="hidden" />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FiUpload className="w-8 h-8 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop the CSV file here</p>
                  ) : (
                    <p className="text-gray-600">
                      Drag and drop a CSV file here
                    </p>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="flex justify-center">
                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Select CSV File
                  <input
                    type="file"
                    className="sr-only"
                    accept=".csv,text/csv,application/vnd.ms-excel,application/csv,text/plain"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onDrop(Array.from(e.target.files));
                        // Reset the input value to allow selecting the same file again
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>

              <p className="text-xs text-center text-gray-500">
                Supports .csv files with question data
              </p>
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-md">
                    <FiFileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file ? Math.round(file.size / 1024) : 0} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                  title="Remove file"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            )}

            {previewError && (
              <p className="mt-2 text-sm text-red-600">{previewError}</p>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview (first 5 rows)
              </h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((cell, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 text-sm text-gray-900 truncate max-w-xs"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Test Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Title *
                </label>
                <Controller
                  name="testTitle"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full rounded-md border ${
                        errors.testTitle ? "border-red-500" : "border-gray-300"
                      } p-2`}
                      placeholder="Enter test title"
                    />
                  )}
                />
                {errors.testTitle && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.testTitle.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Category *
                </label>
                <Controller
                  name="examCategory"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full rounded-md border ${
                        errors.examCategory
                          ? "border-red-500"
                          : "border-gray-300"
                      } p-2`}
                    >
                      <option value="">Select category</option>
                      <option value="medical">Medical (NEET)</option>
                      <option value="engineering">Engineering (JEE)</option>
                      <option value="teaching">
                        Teaching (HTET, CTET, DSSSB, KVS)
                      </option>
                      <option value="govt_exams">
                        Government Exams (SSC, UPSC)
                      </option>
                      <option value="banking">Banking (IBPS, SBI, RBI)</option>
                      <option value="defence">
                        Defence (NDA, CDS, Airforce)
                      </option>
                      <option value="state_exams">State Level Exams</option>
                    </select>
                  )}
                />
                {errors.examCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.examCategory.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full rounded-md border ${
                        errors.subject ? "border-red-500" : "border-gray-300"
                      } p-2`}
                      placeholder="e.g., Physics, Mathematics"
                    />
                  )}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic (Optional)
                </label>
                <Controller
                  name="topic"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2"
                      placeholder="e.g., Thermodynamics, Algebra"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty *
                </label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full rounded-md border `}
                    />
                  )}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFree"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isFree"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Free Test
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setFile(null);
                setPreview([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading || !file}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || !file
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Uploading..."
                : file
                ? `Upload ${file.name}`
                : "Upload Questions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

