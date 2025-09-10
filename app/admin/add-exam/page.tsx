"use client";

import { useState, useEffect } from "react";
import { fetchAvailableCourses } from "@/src/services/courseService";
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
  ChevronDown,
} from "lucide-react";
import { Course } from "@/src/services/courseService";

const AddExam = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
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
    } catch (e: any) {
      console.error('Error loading courses:', e);
      setError(e?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
        <Button
          onClick={loadCourses}
          className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Loader2 className="h-4 w-4" />
          Refresh Courses
        </Button>
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
                  onClick={() => toggleCourseExpansion(course.id)}
                  className={`hover:shadow-md transition-all cursor-pointer ${expandedCourseId === course.id ? "ring-2 ring-blue-500" : ""
                    }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${expandedCourseId === course.id
                            ? "transform rotate-180"
                            : ""
                          }`}
                      />
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
    </div>
  );
};

export default AddExam;
