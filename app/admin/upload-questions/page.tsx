"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { FiUpload, FiX, FiFileText } from "react-icons/fi";
import api from "@/utils/api";

/**
 * Validation schema
 * - z.enum requires `as const` for literal tuple typing
 */
const formSchema = z.object({
  testTitle: z.string().min(3, "Test title is required").max(100),
  examCategory: z.string().min(1, "Exam category is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"] as const),
  durationMinutes: z
    .number()
    .int()
    .positive("Duration must be a positive integer"),
  isFree: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const UploadQuestions = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      difficulty: "medium",
      durationMinutes: 60,
      isFree: false,
    },
  });

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
      preview: 6, // read small amount for preview (header + 5 rows)
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

  const removeFile = () => {
    setFile(null);
    setPreview([]);
    setPreviewError(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast.error("Please attach a CSV file");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("test_title", data.testTitle);
    // backend expects exam_category as lowercase enum values
    formData.append("exam_category", data.examCategory.toLowerCase());
    formData.append("exam_subcategory", data.examCategory);
    formData.append("subject", data.subject);
    if (data.topic) formData.append("topic", data.topic);
    formData.append("difficulty", data.difficulty.toLowerCase());
    formData.append("duration_minutes", String(data.durationMinutes));
    formData.append("is_free", String(Boolean(data.isFree)).toLowerCase());

    try {
      const resp = await api.post("/admin/import-questions", formData);
      console.log("import response:", resp?.data);
      toast.success("Questions imported successfully");
      reset();
      removeFile();
    } catch (err: unknown) {
      console.error("upload error:", err);

      let message = "Failed to import questions";

      if (typeof err === "object" && err !== null) {
        if ("response" in err) {
          message =
            (err as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail ?? message;
        }
        if ("message" in err) {
          message =
            (err as { message?: string }).message ??
            message;
        }
      }

      toast.error(message);
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Upload Questions</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>

            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
                  }`}
                data-testid="dropzone"
              >
                <input {...getInputProps()} className="hidden" />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FiUpload className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-600">
                    {isDragActive
                      ? "Drop CSV here"
                      : "Drag and drop a CSV file here"}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="flex justify-center">
                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Select CSV File
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onDrop(Array.from(e.target.files));
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>

              <p className="text-xs text-center text-gray-500">
                Supported: CSV with question rows (Question, Option A-D, Correct
                Answer, etc.)
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
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)} KB
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
                      {Object.keys(preview[0] || {}).map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, ri) => (
                      <tr key={ri}>
                        {Object.values(row).map((cell, ci) => (
                          <td
                            key={ci}
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

          {/* Test details */}
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
                      placeholder="Enter test title"
                      className={`w-full rounded-md border p-2 ${errors.testTitle ? "border-red-500" : "border-gray-300"
                        }`}
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
                      className={`w-full rounded-md border p-2 ${errors.examCategory
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
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
                      placeholder="e.g., Physics, Mathematics"
                      className={`w-full rounded-md border p-2 ${errors.subject ? "border-red-500" : "border-gray-300"
                        }`}
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
                      placeholder="e.g., Thermodynamics, Algebra"
                      className="w-full rounded-md border border-gray-300 p-2"
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
                      className={`w-full rounded-md border p-2 ${errors.difficulty ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  )}
                />
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <Controller
                  name="durationMinutes"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={1}
                      step={1}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        // prevent NaN assignment; keep controlled as number
                        field.onChange(Number.isNaN(v) ? undefined : v);
                      }}
                      className={`w-full rounded-md border p-2 ${errors.durationMinutes
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                  )}
                />
                {errors.durationMinutes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.durationMinutes.message}
                  </p>
                )}
              </div>

              <div className="flex items-center mt-6">
                <Controller
                  name="isFree"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                />

                <label className="ml-2 block text-sm text-gray-700">
                  Free Test
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                removeFile();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isLoading || !file}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading || !file
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
};

export default UploadQuestions;
