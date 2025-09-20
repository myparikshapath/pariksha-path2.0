"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, MoreVertical, Trash2, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

type Material = {
    id: string;
    filename: string;
    url: string;
    file_path: string;
    uploaded_at?: string;
};

export default function ViewMaterialsPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [deleting, setDeleting] = useState<string | null>(null);

    const slug = params.slug as string;
    const section = decodeURIComponent(params.section as string);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const res = await api.get(
                `/uploads/courses/${slug}/sections/${section}/materials`
            );
            console.log(res);
            setMaterials(res.data.materials || []);
        } catch (err) {
            console.error("Error fetching materials", err);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [slug, section]);

    const handleDelete = async (filePath: string) => {
        try {
            setDeleting(filePath);
            await api.delete(`/files/${filePath}`);
            toast.success("File deleted");
            fetchMaterials();
        } catch (err) {
            console.error("Delete error", err);
            toast.error("Failed to delete file");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Back button */}
            <div className="mb-6">
                <Link href={`/admin/add-material/${slug}`} passHref>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sections
                    </Button>
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">
                Materials for <span className="text-blue-600">{section}</span>
            </h1>

            {materials.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No materials uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((mat) => (
                        <Card key={mat.id} className="hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg truncate">
                                    {mat.filename}
                                </CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(mat.file_path)}
                                            className="text-red-600"
                                            disabled={deleting === mat.file_path}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {deleting === mat.file_path ? "Deleting..." : "Delete"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <Link
                                    href={mat.url}
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                >
                                    Open PDF
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
