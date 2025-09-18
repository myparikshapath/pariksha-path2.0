import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, Plus } from 'lucide-react';
import { ImageAttachment } from '@/src/services/courseService';
import toast from 'react-hot-toast';

interface AddImageButtonProps {
  onImagesAdd: (images: ImageAttachment[]) => void;
  maxImages?: number;
  currentImageCount?: number;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

interface UploadedFile {
  url: string;
  filename: string;
  metadata: {
    file_size?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

interface UploadError {
  filename: string;
  error: string;
}

interface UploadResponse {
  uploaded_files: UploadedFile[];
  errors?: UploadError[];
}

const AddImageButton: React.FC<AddImageButtonProps> = ({
  onImagesAdd,
  maxImages = 3,
  currentImageCount = 0,
  className = '',
  size = 'sm',
  variant = 'outline'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - currentImageCount;
    const filesToProcess = Math.min(files.length, remainingSlots);

    if (filesToProcess === 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate files first
    const validFiles = [];
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

      // Check for supported image types
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type. Use JPEG, PNG, GIF, or WebP`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    try {
      // Create FormData for upload
      const formData = new FormData();
      for (let i = 0; i < validFiles.length; i++) {
        formData.append('files', validFiles[i]);
      }

      // Upload to backend
      const baseURL = 'http://localhost:8000/api/v1';
      const uploadUrl = `${baseURL}/uploads/images`;
      console.log('Uploading to:', uploadUrl);
      console.log('FormData files:', Array.from(formData.entries()));

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          console.log('Error response JSON:', error);
          errorMessage = error.detail || error.message || 'Upload failed';
        } catch (e) {
          // If JSON parsing fails, try to get text
          console.error('Could not parse error response as JSON:', e);
          try {
            const text = await response.text();
            console.log('Error response text:', text);
            errorMessage = `Server error: ${response.status} - ${text.substring(0, 200)}`;
          } catch (textError) {
            console.error('Could not read response text:', textError);
            errorMessage = `Server error: ${response.status} - ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json() as UploadResponse;
      console.log('Upload result:', result);

      // Convert uploaded files to ImageAttachment format
      const newImages: ImageAttachment[] = result.uploaded_files.map((uploadedFile) => ({
        url: uploadedFile.url,
        alt_text: uploadedFile.filename.replace(/\.[^/.]+$/, ""), // Remove extension
        caption: "",
        order: currentImageCount + result.uploaded_files.indexOf(uploadedFile),
        file_size: uploadedFile.metadata.file_size,
        dimensions: uploadedFile.metadata.dimensions || { width: 0, height: 0 }
      }));

      // Add new images to existing ones
      onImagesAdd(newImages);
      toast.success(`Added ${newImages.length} image(s)`);

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error) => {
          toast.error(`${error.filename}: ${error.error}`);
        });
      }

    } catch (error) {
      console.error('Upload error:', error);

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please make sure the backend is running.');
      } else if (error instanceof Error && error.message.includes('JSON.parse')) {
        toast.error('Server returned invalid response. Please check if the upload endpoint is working.');
      } else {
        toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (files.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more image(s) allowed. ${files.length - remainingSlots} images were skipped.`);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isDisabled = currentImageCount >= maxImages;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isDisabled}
        className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${className} ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-md hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
          }`}
        title={isDisabled ? `Maximum ${maxImages} images allowed` : 'Add images'}
      >
        <div className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <Plus className="h-3 w-3" />
        </div>
        <span className="text-xs font-medium">Add Image</span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </>
  );
};

export default AddImageButton;