import React from "react";
import { Course } from "@/src/services/courseService";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
  showProgress?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  isEnrolled = false,
  showProgress = false,
}) => {
  const progress = course.progress || 0;
  const progressPercentage = Math.min(100, Math.max(0, progress));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
            <span className="text-4xl text-gray-400">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
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

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>⏱️ {course.duration} hours</span>
          <span>👨‍🏫 {course.instructor}</span>
        </div>

        {showProgress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {course.completedModules} of {course.totalModules} modules
              completed
            </div>
          </div>
        )}

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
