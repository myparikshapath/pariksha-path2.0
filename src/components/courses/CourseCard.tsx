import React from "react";
import { Course } from "@/src/services/courseService";
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  isEnrolled = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
          <span className="text-4xl text-gray-400">
            {course.title.charAt(0)}
          </span>
        </div>

        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {course.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 h-14">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
          {course.description}
        </p>

        <div className="flex justify-between items-center mt-4">
          {isEnrolled ? (
            <Link
              href={`/courses/${course.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Learning
            </Link>
          ) : (
            <button
              onClick={() => onEnroll?.(course.id)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Enroll Now
            </button>
          )}

          <span className="font-semibold text-gray-800">
            {course.price > 0 ? `₹${course.price}` : "Free"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
