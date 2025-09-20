"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowLeft, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const MaterialUploadPage = () => {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    // Handle drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        multiple: true,
        noKeyboard: true,
    });

    // Remove file
    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Upload PDFs
    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("Please select at least one PDF");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            const res = await api.post("/uploads/pdfs", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(res.data.message);
            console.log("Uploaded files:", res.data.uploaded_files);

            router.push("/admin/add-material"); // go back or wherever you need
        } catch (error: unknown) {
            console.error("Upload error:", error);
            toast.error("Failed to upload PDFs");
        } finally {
            setUploading(false);
        }
    };

    const handleBack = () => {
        router.push("/admin/add-material");
    };

    return (
        <div className="container mx-auto p-6">
            {/* Back Button */}
            <div className="mb-6">
                <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-6">Upload Materials (PDFs)</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Upload PDF Files</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Dropzone */}
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
                                        ? "Drop the PDFs here"
                                        : "Drag and drop PDFs here, or click to select"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supports multiple PDF files
                                </p>
                            </div>
                        </div>

                        {/* File Preview */}
                        {files.length > 0 && (
                            <ul className="mt-4 space-y-2">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Upload Button */}
                        <div className="flex justify-end mt-6">
                            <Button
                                onClick={handleUpload}
                                disabled={files.length === 0 || uploading}
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
                                        Upload PDFs
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

export default MaterialUploadPage;
