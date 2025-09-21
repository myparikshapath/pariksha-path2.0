import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import Image from "next/image";

// Utility function to fix image URL issues
const fixImageUrl = (url: string): string => {
  if (!url) return url;

  // Check if URL contains double bucket name pattern
  // Pattern: https://domain.com/bucket/bucket/images/filename
  const doubleBucketPattern = /^https?:\/\/[^\/]+\/([^\/]+)\/\1\/(.+)$/;
  const match = url.match(doubleBucketPattern);

  if (match) {
    const bucketName = match[1];
    // const path = match[2];
    // Reconstruct URL with single bucket name
    return url.replace(`/${bucketName}/${bucketName}/`, `/${bucketName}/`);
  }

  // Check if URL is missing bucket name before /images
  // Pattern: https://domain.com/images/filename
  const missingBucketPattern = /^https?:\/\/[^\/]+\/images\/(.+)$/;
  const missingMatch = url.match(missingBucketPattern);

  if (missingMatch) {
    // Extract domain and filename
    const domain = url.split("/images/")[0];
    const filename = missingMatch[1];
    // Add bucket name before /images
    return `${domain}/pariksha-path-bucket/images/${filename}`;
  }

  // Check if URL uses old path structure (questions/{id}/{type}/filename)
  // Pattern: https://domain.com/questions/{id}/{type}/filename
  const oldPathPattern = /^https?:\/\/[^\/]+\/questions\/[^\/]+\/[^\/]+\/(.+)$/;
  const oldPathMatch = url.match(oldPathPattern);

  if (oldPathMatch) {
    // Extract domain and filename
    const domain = url.split("/questions/")[0];
    const filename = oldPathMatch[1];
    // Convert to new path structure
    return `${domain}/pariksha-path-bucket/images/${filename}`;
  }

  return url;
};

interface ImageUploadProps {
  questionId: string;
  imageType: "question" | "option" | "explanation" | "remarks";
  optionIndex?: number;
  existingImages: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  questionId,
  imageType,
  optionIndex,
  existingImages = [],
  onImagesUpdate,
  maxImages = 5,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Check if adding these files would exceed maxImages
      if (existingImages.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("question_id", questionId);
          formData.append("image_type", imageType);
          if (optionIndex !== undefined) {
            formData.append("option_index", optionIndex.toString());
          }

          const response = await api.post("/admin/images/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          return response.data.data.image_url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        onImagesUpdate([...existingImages, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      } catch (error: unknown) {
        console.error("Upload error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload images"
        );
      } finally {
        setUploading(false);
      }
    },
    [
      questionId,
      imageType,
      optionIndex,
      maxImages,
      onImagesUpdate,
      existingImages
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: maxImages - existingImages.length,
    disabled: uploading || existingImages.length >= maxImages,
  });

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const formData = new FormData();
      formData.append("question_id", questionId);
      formData.append("image_url", imageUrl);
      formData.append("image_type", imageType);
      if (optionIndex !== undefined) {
        formData.append("option_index", optionIndex.toString());
      }

      await api.delete("/admin/images/delete", { data: formData });

      const updatedImages = existingImages.filter((url) => url !== imageUrl);
      onImagesUpdate(updatedImages);
      toast.success("Image deleted successfully");
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const errorMessage = error && 
        typeof error === 'object' && 
        'response' in error && 
        error.response && 
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'detail' in error.response.data &&
        typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : "Failed to delete image";
      toast.error(errorMessage);
    }
  };

  const canUpload = existingImages.length < maxImages && !uploading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
            <p className="text-gray-600">
              {uploading
                ? "Uploading..."
                : isDragActive
                ? "Drop the images here"
                : "Drag and drop images here, or click to select"}
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WebP (max {maxImages} images)
            </p>
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {imageType === "question" && "Question Images"}
            {imageType === "option" &&
              `Option ${String.fromCharCode(65 + (optionIndex || 0))} Images`}
            {imageType === "explanation" && "Explanation Images"}
            {imageType === "remarks" && "Remarks Images"}(
            {existingImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingImages.map((imageUrl, index) => {
              const fixedUrl = fixImageUrl(imageUrl);
              return (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="relative">
                      <Image
                        src={fixedUrl}
                        alt={`${imageType} image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(imageUrl)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Limit Message */}
      {existingImages.length >= maxImages && (
        <div className="text-center text-sm text-gray-500">
          Maximum {maxImages} images reached
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
