"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "@/utils/api";

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

interface PDFUploadProps {
  courseId: string;
  sectionName: string;
  existingFiles?: PDFFile[];
  onFilesUpdate: (files: PDFFile[]) => void;
  maxFiles?: number;
  className?: string;
}

const PDFUpload: React.FC<PDFUploadProps> = ({
  courseId,
  sectionName,
  existingFiles = [],
  onFilesUpdate,
  maxFiles = 10,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Check if adding these files would exceed maxFiles
      if (existingFiles.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("description", "");

          const response = await api.post(
            `/admin/sections/${courseId}/${encodeURIComponent(sectionName)}/files`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          return response.data.data;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        onFilesUpdate([...existingFiles, ...uploadedFiles]);
        toast.success(`${uploadedFiles.length} PDF(s) uploaded successfully`);
      } catch (error: unknown) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload PDFs";
        toast.error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [courseId, sectionName, maxFiles, onFilesUpdate, existingFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: maxFiles - existingFiles.length,
    disabled: uploading || existingFiles.length >= maxFiles,
  });

  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.delete(
        `/admin/sections/${courseId}/${encodeURIComponent(sectionName)}/files/${fileId}`
      );

      const updatedFiles = existingFiles.filter((file) => file.id !== fileId);
      onFilesUpdate(updatedFiles);
      toast.success("PDF deleted successfully");
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete PDF";
      toast.error(errorMessage);
    }
  };

  const fixDoSpacesUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('/pariksha-path-bucket/')) return url;
    return url.replace(/^(https?:\/\/[^/]+)\/(courses\/.*)$/i, '$1/pariksha-path-bucket/$2');
  };

  const canUpload = existingFiles.length < maxFiles && !uploading;

  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    }
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
            ? "border-blue-500 bg-blue-50"
            : canUpload
              ? "border-gray-300 hover:border-blue-400"
              : "border-gray-200 bg-gray-50 cursor-not-allowed"
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <p className="text-gray-600">
            {uploading
              ? "Uploading PDFs..."
              : isDragActive
                ? "Drop the PDF files here"
                : canUpload
                  ? "Drag and drop PDF files here, or click to select"
                  : `Maximum ${maxFiles} files allowed`}
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF files up to 50MB each
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({existingFiles.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-red-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.file_size_kb)} •{" "}
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                        {file.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(fixDoSpacesUrl(file.file_url), "_blank")}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {existingFiles.length >= maxFiles && (
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">
            Maximum number of files reached. Delete some files to upload more.
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
