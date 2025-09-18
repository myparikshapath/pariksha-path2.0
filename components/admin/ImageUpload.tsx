"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Upload, X, Edit2 } from "lucide-react";
import { ImageAttachment } from "@/src/services/courseService";
import toast from "react-hot-toast";

interface ImageUploadProps {
  images: ImageAttachment[];
  onImagesChange: (images: ImageAttachment[]) => void;
  maxImages?: number;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  label = "Images",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageAttachment[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    // Validate files first
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }
    }

    if (filesToProcess === 0) return;

    try {
      // Create FormData for upload
      const formData = new FormData();
      for (let i = 0; i < filesToProcess; i++) {
        formData.append('files', files[i]);
      }

      // Upload to backend
      const response = await fetch('/api/v1/uploads/images', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();

      // Convert uploaded files to ImageAttachment format
      result.uploaded_files.forEach((uploadedFile: ImageAttachment) => {
        const newImage: ImageAttachment = {
          url: uploadedFile.url,
          alt_text: uploadedFile.alt_text?.replace(/\.[^/.]+$/, ""), // Remove extension
          caption: "",
          order: images.length + newImages.length,
          dimensions: {
            width: 0, // Could be extracted from image metadata
            height: 0
          }
        };
        newImages.push(newImage);
      });

      // Update images
      onImagesChange([...images, ...newImages]);
      setIsUploading(false);
      toast.success(`Uploaded ${newImages.length} image(s)`);

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: ImageAttachment) => {
          toast.error(`${error.alt_text}: ${error.alt_text}`);
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (files.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} images can be added. ${files.length - remainingSlots} images were skipped.`);
    }
  };

  const handleImageUpdate = (index: number, updatedImage: Partial<ImageAttachment>) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], ...updatedImage };
    onImagesChange(updatedImages);
  };

  const handleImageRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = updatedImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reorderedImages);
  };

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);

    // Update order values
    const reorderedImages = updatedImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reorderedImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {images.length}/{maxImages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={images.length >= maxImages || isUploading}
            className="h-8"
          >
            <Upload className="h-4 w-4 mr-1" />
            Add Image
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          setIsUploading(true);
          handleFileUpload(e.target.files);
          e.target.value = ""; // Reset input
        }}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              index={index}
              onUpdate={(updatedImage) => handleImageUpdate(index, updatedImage)}
              onRemove={() => handleImageRemove(index)}
              onMoveUp={index > 0 ? () => handleImageReorder(index, index - 1) : undefined}
              onMoveDown={index < images.length - 1 ? () => handleImageReorder(index, index + 1) : undefined}
            />
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              No images added yet. Click &quot;Add Image&quot; to upload images.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ImageCardProps {
  image: ImageAttachment;
  index: number;
  onUpdate: (updatedImage: Partial<ImageAttachment>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ImageCard({
  image,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ImageCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative">
            <div className="w-full h-32 relative">
              <Image
                src={image.url}
                alt={image.alt_text || `Image ${index + 1}`}
                fill
                className="object-cover rounded-md border"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Image Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Image {index + 1}
              </span>
              <div className="flex gap-1">
                {onMoveUp && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onMoveUp}
                    className="h-6 w-6 p-0"
                  >
                    ↑
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onMoveDown}
                    className="h-6 w-6 p-0"
                  >
                    ↓
                  </Button>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`alt-${index}`} className="text-xs">
                    Alt Text
                  </Label>
                  <Input
                    id={`alt-${index}`}
                    value={image.alt_text || ""}
                    onChange={(e) => onUpdate({ alt_text: e.target.value })}
                    placeholder="Describe the image for accessibility"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor={`caption-${index}`} className="text-xs">
                    Caption
                  </Label>
                  <Textarea
                    id={`caption-${index}`}
                    value={image.caption || ""}
                    onChange={(e) => onUpdate({ caption: e.target.value })}
                    placeholder="Optional caption for the image"
                    className="h-16 text-xs resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}