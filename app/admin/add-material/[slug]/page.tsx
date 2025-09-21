"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    fetchAvailableCourses,
    deleteSectionFromCourse,
    Course,
} from "@/src/services/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Upload,
    BookOpen,
    Edit,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Plus,
    Trash2,
    MoreVertical,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteSectionDialog from "@/components/admin/DeleteSectionDialog";
import Link from 'next/link';

const MaterialDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deletingSection, setDeletingSection] = useState<string | null>(null);
    const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);

    const loadCourse = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const courses = await fetchAvailableCourses();
            const foundCourse = courses.find((c) => {
                const courseSlug = c.code?.toLowerCase().replace(/\s+/g, "-") || c.id;
                return courseSlug === params.slug;
            });

            if (foundCourse) {
                setCourse(foundCourse);
            } else {
                setError("Course not found");
            }
        } catch (e: unknown) {
            console.error("Error loading course:", e);
            setError(e instanceof Error ? e.message : "Failed to load course");
        } finally {
            setLoading(false);
        }
    }, [params.slug]);

    useEffect(() => {
        loadCourse();
    }, [params.slug, loadCourse]);

    const handleBackClick = () => {
        router.push("/admin/add-material");
    };

    const handleAddSection = () => {
        if (!course) return;
        router.push(`/admin/add-section/${course.id}`);
    };

    const handleEditSection = (sectionName: string) => {
        if (!course) return;
        router.push(
            `/admin/edit-section/${course.id}/${encodeURIComponent(sectionName)}`
        );
    };

    const handleDeleteSection = (sectionName: string) => {
        setDeletingSection(sectionName);
        setDeleteSectionDialogOpen(true);
    };

    const handleConfirmDeleteSection = async (sectionName: string) => {
        if (!course) return;

        setOperationLoading(true);
        try {
            await deleteSectionFromCourse(course.id, sectionName);
            await loadCourse();
            setDeleteSectionDialogOpen(false);
            setDeletingSection(null);
        } catch (error: unknown) {
            console.error("Error deleting section:", error);
            setError(
                error instanceof Error ? error.message : "Failed to delete section"
            );
        } finally {
            setOperationLoading(false);
        }
    };

    const closeDeleteDialog = () => {
        setDeleteSectionDialogOpen(false);
        setDeletingSection(null);
    };

    // const handleUploadMaterial = (section: string) => {
    //     router.push(`/admin/add-material/${params.slug}/${encodeURIComponent(section)}`);
    // };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading course...</span>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        onClick={handleBackClick}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Courses
                    </Button>
                </div>

                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error || "Course not found"}
                    </h2>
                    <p className="text-gray-600">
                        The course you&apos;re looking for doesn&apos;t exist or has been
                        removed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    onClick={handleBackClick}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Courses
                </Button>
            </div>

            {/* Course Info */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {course.title}
                    </h1>
                    {course.sub_category && (
                        <p className="text-lg text-gray-600 mb-2">{course.sub_category}</p>
                    )}
                    {course.code && (
                        <p className="text-sm text-gray-500">Course Code: {course.code}</p>
                    )}
                </div>
            </div>

            {/* Sections Grid */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Course Sections</h2>
                    <Button onClick={handleAddSection} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Section
                    </Button>
                </div>

                {!course.sections || course.sections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            No sections available for this course yet.
                        </p>
                        <Button onClick={handleAddSection} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add First Section
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {course.sections.map((section, index) => (
                            <Card key={index} className="hover:shadow-md transition-all">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg flex-1">
                                                {section.name}
                                            </CardTitle>
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEditSection(section.name)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteSection(section.name)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex justify-end gap-2">
                                        {/* View Materials Button */}
                                        <Link
                                            href={`/admin/view-material/${params.slug}/${encodeURIComponent(section.name)}`}
                                            passHref
                                        >
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                            >
                                                <span>
                                                    <BookOpen className="h-4 w-4 mr-1" />
                                                    View Materials
                                                </span>
                                            </Button>
                                        </Link>

                                        {/* Upload Material Button */}
                                        <Link
                                            href={`/admin/add-material/${params.slug}/${encodeURIComponent(section.name)}`}
                                            passHref
                                        >
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                            >
                                                <span>
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Upload Material
                                                </span>
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>

                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Section Dialog */}
            <DeleteSectionDialog
                isOpen={deleteSectionDialogOpen}
                onClose={closeDeleteDialog}
                sectionName={deletingSection || ""}
                onConfirm={handleConfirmDeleteSection}
                loading={operationLoading}
            />
        </div>
    );
};

export default MaterialDetailPage;
