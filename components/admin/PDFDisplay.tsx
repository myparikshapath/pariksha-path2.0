"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface PDFDisplayProps {
  files: PDFFile[];
  onDelete?: (fileId: string) => void;
  onView?: (fileUrl: string) => void;
  onDownload?: (fileUrl: string, filename: string) => void;
  showActions?: boolean;
  className?: string;
}

const PDFDisplay: React.FC<PDFDisplayProps> = ({
  files,
  onDelete,
  onView,
  onDownload,
  showActions = true,
  className = "",
}) => {
  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    }
    return `${(sizeInKB / 1024).toFixed(3)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleView = (fileUrl: string) => {
    if (onView) {
      onView(fileUrl);
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const fixDoSpacesUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('/pariksha-path-bucket/')) return url;
    return url.replace(/^(https?:\/\/[^/]+)\/(courses\/.*)$/i, '$1/pariksha-path-bucket/$2');
  };

  const handleDownload = (fileUrl: string, filename: string) => {
    if (onDownload) {
      onDownload(fileUrl, filename);
    } else {
      // Default download behavior
      const link = document.createElement("a");
      link.href = fixDoSpacesUrl(fileUrl);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No PDF files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          PDF Files ({files.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-medium text-gray-900 truncate">
                      {file.original_filename}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.file_size_kb)}
                    </p>
                  </div>
                </div>
                {showActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(fixDoSpacesUrl(file.file_url))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownload(fixDoSpacesUrl(file.file_url), file.original_filename)
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(file.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {file.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {file.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(file.uploaded_at)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  <span>Admin</span>
                </div>
              </div>

              {showActions && (
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(fixDoSpacesUrl(file.file_url))}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDownload(fixDoSpacesUrl(file.file_url), file.original_filename)
                    }
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PDFDisplay;
