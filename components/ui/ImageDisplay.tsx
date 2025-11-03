import React, { useMemo } from 'react';
import Image from 'next/image';

interface ImageDisplayProps {
  imageUrls: string[];
  alt?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}

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
    const domain = url.split('/images/')[0];
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
    const domain = url.split('/questions/')[0];
    const filename = oldPathMatch[1];
    // Convert to new path structure
    return `${domain}/pariksha-path-bucket/images/${filename}`;
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
  const fixedUrls = useMemo(() => imageUrls.map((u) => fixImageUrl(u)), [imageUrls]);

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {fixedUrls.map((fixedUrl, index) => (
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
            unoptimized
            loading="lazy"
            decoding="async"
            sizes={`(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageDisplay;
