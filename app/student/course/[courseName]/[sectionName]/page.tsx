"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle, FileText } from "lucide-react";
import PDFDisplay from "@/components/admin/PDFDisplay";
import api from "@/utils/api";
import { fetchAvailableCourses, Course, Section } from "@/src/services/courseService";

interface PDFFile {
    id: string;
    filename: string;
    original_filename: string;
    file_url: string;
    file_size_kb: number;
    file_type: string;
    uploaded_at: string;
    uploaded_by: string;
    description?: string;
    is_active: boolean;
}

const SectionPDFsPage = () => {
    const params = useParams<{ courseName: string; sectionName: string }>();
    const router = useRouter();

    const courseSlug = params.courseName; // 👈 consistent naam
    const sectionName = decodeURIComponent(params.sectionName);

    const [course, setCourse] = useState<Course | null>(null);
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCourse = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const courses = await fetchAvailableCourses();

            const foundCourse = courses.find((c: Course) => {
                const courseSlugFromCode = c.id.toLowerCase() ||
                    c.code?.toLowerCase().replace(/\s+/g, "-");
                return courseSlugFromCode === courseSlug.toLowerCase();
            });

            if (!foundCourse) {
                setError("Course not found");
                return;
            }

            const sectionExists = foundCourse.sections?.some(
                (s: Section) =>
                    s.name?.toLowerCase() === sectionName.toLowerCase()
            );

            if (!sectionExists) {
                setError(`Section "${sectionName}" not found in course`);
                return;
            }

            setCourse(foundCourse);

            try {
                const filesResponse = await api.get(
                    `/admin/sections/${foundCourse.id}/${encodeURIComponent(sectionName)}/files`
                );
                setFiles(filesResponse.data.data.files || []);
            } catch (fileError) {
                console.error("Error fetching section files:", fileError);
                setFiles([]);
            }
        } catch (e: unknown) {
            console.error("Error loading course:", e);
            setError(e instanceof Error ? e.message : "Failed to load course");
        } finally {
            setLoading(false);
        }
    }, [courseSlug, sectionName]);

    useEffect(() => {
        if (courseSlug && sectionName) {
            loadCourse();
        }
    }, [loadCourse, courseSlug, sectionName]);

    const handleBack = () => {
        router.push(`/course/${courseSlug}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading section PDFs...</span>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Course
                    </Button>
                </div>

                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error || "Course not found"}
                    </h2>
                    <p className="text-gray-600">
                        The course or section you&apos;re looking for doesn&apos;t exist or has been removed.
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
                    onClick={handleBack}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Course
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {sectionName} - PDFs
                    </h1>
                    <p className="text-gray-600">Course: {course.title}</p>
                </div>
            </div>

            {/* PDF Display Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Available PDF Files
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {files.length > 0 ? (
                        <PDFDisplay files={files} showActions={false} />
                    ) : (
                        <p className="text-gray-500 text-center py-6">
                            No PDFs available for this section yet.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SectionPDFsPage;
