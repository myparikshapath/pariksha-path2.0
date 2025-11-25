"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Eye, Plus } from "lucide-react";
import api from "@/utils/api";
import { toast } from "react-hot-toast";

interface Banner {
    id: string;
    image_url: string;
    title?: string;
    position: number;
    is_active: boolean;
    created_at: string;
}


export default function BannerListPage() {
    const router = useRouter();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await api.get("/banner");   // ✅ backend route
            console.log(res);
            setBanners(res.data.banners || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleDelete = async (key: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            setDeleting(key);
            await api.delete(`/banner/${encodeURIComponent(key)}`);
            setBanners((prev) => prev.filter((b) => b.id !== key));
            toast.success("Banner deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete banner");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600 text-lg">Loading banners...</span>
            </div>
        );
    }
    const handleView = (fileUrl: string) => {
        window.open(fileUrl, "_blank");
    };

    const fixDoSpacesUrl = (url: string) => {
        if (!url) return url;
        if (url.includes('/pariksha-path-bucket/')) return url;
        return url.replace(/^(https?:\/\/[^/]+)\/(banner\/.*)$/i, '$1/pariksha-path-bucket/$2');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-[#2E4A3C]">
                        Manage Banners
                    </h1>

                    <Button
                        className="bg-[#2E4A3C] hover:bg-[#1f3126] text-white flex items-center gap-2"
                        onClick={() => router.push("/admin/banner/upload")}
                    >
                        <Plus className="w-4 h-4" />
                        Upload Banner
                    </Button>
                </div>

                {banners.length === 0 ? (
                    <div className="text-center mt-20">
                        <p className="text-xl text-gray-500">
                            No banners uploaded yet.
                        </p>
                        <Button
                            className="mt-6 bg-[#2E4A3C] text-white"
                            onClick={() => router.push("/admin/banner/upload")}
                        >
                            Upload first Banner
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {banners.map((banner) => (
                            <Card
                                key={banner.id}
                                className="p-4 rounded-xl shadow-lg bg-white"
                            >
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                    <Image
                                        src={fixDoSpacesUrl(banner.image_url)}
                                        alt="banner"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <p className="text-sm mt-2 text-gray-500 truncate">
                                    {banner.id}
                                </p>

                                <div className="flex justify-between items-center mt-4">
                                    <Button onClick={() => handleView(fixDoSpacesUrl(banner.image_url))}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                                        onClick={() => handleDelete(banner.id)}
                                        disabled={deleting === banner.id}
                                    >
                                        {deleting === banner.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        Delete
                                    </Button>
                                </div>

                                {banner.created_at && (
                                    <p className="text-xs mt-2 text-gray-400">
                                        Uploaded: {new Date(banner.created_at).toLocaleString()}
                                    </p>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
