import React from 'react';
import Image from 'next/image';

interface ImageDisplayProps {
  imageUrls: string[];
  alt?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}

// Utility function to fix double bucket name issue
const fixImageUrl = (url: string): string => {
  if (!url) return url;
  
  // Check if URL contains double bucket name pattern
  // Pattern: https://domain.com/bucket/bucket/images/filename
  const doubleBucketPattern = /^https?:\/\/[^\/]+\/([^\/]+)\/\1\/(.+)$/;
  const match = url.match(doubleBucketPattern);
  
  if (match) {
    const bucketName = match[1];
    const path = match[2];
    // Reconstruct URL with single bucket name
    return url.replace(`/${bucketName}/${bucketName}/`, `/${bucketName}/`);
  }
  
  return url;
};

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrls,
  alt = "Question image",
  className = "",
  maxWidth = 600,
  maxHeight = 400,
}) => {
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {imageUrls.map((url, index) => {
        const fixedUrl = fixImageUrl(url);
        return (
          <div key={index} className="relative">
            <Image
              src={fixedUrl}
              alt={`${alt} ${index + 1}`}
              width={maxWidth}
              height={maxHeight}
              className="rounded-lg border border-gray-200 shadow-sm object-contain"
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: `${maxHeight}px`,
              }}
              unoptimized // For external URLs
              onError={(e) => {
                console.error('Image failed to load:', fixedUrl);
                // Hide the image on error
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ImageDisplay;
