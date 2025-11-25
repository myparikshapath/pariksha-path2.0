"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import Image from "next/image";

const BannerUploadPage = () => {
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const image = acceptedFiles[0];
        if (!image) return;

        if (!image.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            return;
        }

        setFile(image);
        setUploadedUrl(null);

        const localPreview = URL.createObjectURL(image);
        setPreviewUrl(localPreview);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 1,
        multiple: false,
        noKeyboard: true,
    });

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select an image first");
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("banner_name", "homepage"); // you can make dynamic

        try {
            const res = await api.post("/banner/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Banner uploaded successfully!");
            setUploadedUrl(res.data.url);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload banner");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 p-6">
            <div className="max-w-4xl mx-auto">

                {/* Back Button */}
                <div className="mb-8">
                    <Button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 bg-white/80 hover:bg-white text-emerald-700 border border-emerald-200 rounded-full px-6 py-3 shadow-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Go Back</span>
                    </Button>
                </div>

                {/* Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full border border-emerald-200 shadow-lg mb-6">
                        <ImageIcon className="h-6 w-6 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Banner Upload</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Upload Website Banner
                    </h1>
                </div>

                {/* Main Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <Upload className="h-6 w-6" />
                            </div>
                            Upload Image
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">

                        {/* Drop Area */}
                        <div
                            {...getRootProps()}
                            className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                                ? "border-emerald-500 bg-emerald-50 scale-105"
                                : "border-emerald-300 hover:border-emerald-500"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700">
                                {isDragActive ? "Drop image here" : "Drag & drop image here"}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                or click to browse (png, jpg, webp)
                            </p>
                        </div>

                        {/* Preview */}
                        {previewUrl && (
                            <div className="text-center mt-6">
                                <h3 className="text-lg font-semibold mb-3 text-emerald-700">
                                    Preview
                                </h3>

                                <div className="relative mx-auto w-full max-w-lg h-64 rounded-xl overflow-hidden shadow-xl border border-emerald-200">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-contain bg-white"
                                    />
                                </div>

                                <p className="mt-3 text-sm text-gray-600">
                                    {file?.name} — {(file?.size! / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        )}

                        {/* Uploaded URL */}
                        {uploadedUrl && (
                            <div className="bg-emerald-50 p-4 border border-emerald-200 rounded-lg">
                                <p className="text-sm font-medium text-emerald-700">
                                    ✅ Uploaded URL:
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <input
                                        value={uploadedUrl}
                                        readOnly
                                        className="w-full border px-3 py-2 text-sm rounded"
                                    />
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(uploadedUrl);
                                            toast.success("Copied!");
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="text-right">
                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg px-8 py-4 text-lg"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 mr-2" />
                                        Upload Banner
                                    </>
                                )}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BannerUploadPage;
