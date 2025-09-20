"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    fetchAvailableCourses,
    deleteCourse,
    Course,
} from "@/src/services/courseService";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Loader2,
    Plus,
    Edit,
    Trash2,
    MoreVertical,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteCourseDialog from "@/components/admin/DeleteCourseDialog";

const AddExam = () => {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete states
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);

    const handleCourseClick = (course: Course) => {
        // Navigate to course detail page using course code as slug
        const slug = course.code?.toLowerCase().replace(/\s+/g, '-') || course.id;
        router.push(`/admin/add-material/${slug}`);
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use direct axios call to bypass authentication
            const data = await fetchAvailableCourses();
            console.log('API Response:', data);

            setCourses(Array.isArray(data) ? data : []);
        } catch (e: unknown) {
            console.error('Error loading courses:', e);
            setError(e instanceof Error ? e.message : "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleAddExam = () => {
        // Navigate to the new exam page
        router.push("/admin/add-exam/new");
    };

    const handleEditCourse = (course: Course) => {
        router.push(`/admin/edit-course/${course.id}`);
    };

    const handleDeleteCourse = (course: Course) => {
        setDeletingCourse(course);
        setDeleteDialogOpen(true);
    };


    const handleConfirmDelete = async (courseId: string) => {
        setOperationLoading(true);
        try {
            await deleteCourse(courseId);
            // Refresh the courses list
            await loadCourses();
            setDeleteDialogOpen(false);
            setDeletingCourse(null);
        } catch (error) {
            console.error("Error deleting course:", error);
            setError("Failed to delete course");
        } finally {
            setOperationLoading(false);
        }
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeletingCourse(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
                <div className="flex gap-3">
                    <Button
                        onClick={handleAddExam}
                        className="bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Exam
                    </Button>
                    <Button
                        onClick={loadCourses}
                        className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Loader2 className="h-4 w-4" />
                        Refresh Courses
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading courses...</span>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">
                            No courses found. Check if the backend server is running.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="space-y-4">
                                <Card
                                    className="hover:shadow-md transition-all hover:ring-2 hover:ring-blue-500 cursor-pointer"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg flex-1">
                                                {course.title}
                                            </CardTitle>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteCourse(course)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        {course.sub_category && (
                                            <p className="text-sm text-gray-500">
                                                {course.sub_category}
                                            </p>
                                        )}
                                        {course.code && (
                                            <p className="text-xs text-gray-400">
                                                Code: {course.code}
                                            </p>
                                        )}
                                        {course.is_active === false && (
                                            <p className="text-xs text-red-500 font-medium">
                                                Inactive
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {course.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {course.description}
                                            </p>
                                        )}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">
                                                    {course.is_free ? "Free" : `$${course.price.toFixed(2)}`}
                                                </span>
                                                <div className="text-xs text-gray-500">
                                                    {Array.isArray(course.sections)
                                                        ? course.sections.length
                                                        : 0}{" "}
                                                    sections
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Course Dialog */}
            <DeleteCourseDialog
                isOpen={deleteDialogOpen}
                onClose={closeDeleteDialog}
                course={deletingCourse}
                onConfirm={handleConfirmDelete}
                loading={operationLoading}
            />
        </div>
    );
};

export default AddExam;
