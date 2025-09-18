"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { ImageAttachment } from "@/src/services/courseService";
import Image from "next/image";

interface ImageDisplayProps {
  images: ImageAttachment[];
  className?: string;
  maxDisplay?: number;
  onRemove?: (index: number) => void;
  editable?: boolean;
}

// Loading skeleton component
// const ImageSkeleton = () => (
//   <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
//     <div className="space-y-2">
//       <div className="relative">
//         <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 animate-pulse flex items-center justify-center">
//           <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
//         </div>
//       </div>
//       <div className="space-y-1">
//         <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
//         <div className="h-2 bg-gray-100 rounded animate-pulse w-3/4"></div>
//       </div>
//     </div>
//   </div>
// );

// Individual image component with loading state
const ImageItem = ({
  image,
  index,
  editable,
  onRemove
}: {
  image: ImageAttachment;
  index: number;
  editable: boolean;
  onRemove?: (index: number) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Debug logging
  console.log(`ImageItem ${index} - Image data:`, image);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative group">
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="space-y-2">
          <div className="relative">
            {isLoading && (
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 animate-pulse flex items-center justify-center absolute inset-0 z-10">
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              </div>
            )}
            {hasError ? (
              <div className="w-24 h-24 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-400 text-xs">Failed to load</div>
                </div>
              </div>
            ) : (
              <Image
                src={image.url}
                alt={image.alt_text || `Image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ opacity: isLoading ? 0 : 1 }}
              />
            )}
            {editable && onRemove && !isLoading && !hasError && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {!hasError && image.caption && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {image.caption}
            </p>
          )}
          {!hasError && image.dimensions && (
            <p className="text-xs text-gray-400">
              {image.dimensions.width} × {image.dimensions.height}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ImageDisplay({
  images,
  className = "",
  maxDisplay = 3,
  onRemove,
  editable = false,
}: ImageDisplayProps) {
  // Debug logging
  console.log('ImageDisplay - Received images:', images);

  if (!images || images.length === 0) {
    console.log('ImageDisplay - No images to display');
    return null;
  }

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-3">
        {displayImages.map((image, index) => (
          <ImageItem
            key={index}
            image={image}
            index={index}
            editable={editable}
            onRemove={onRemove}
          />
        ))}
        {remainingCount > 0 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">
                  +{remainingCount}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  more
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
