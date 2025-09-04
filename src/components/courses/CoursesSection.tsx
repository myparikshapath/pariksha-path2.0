import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import { Course, fetchEnrolledCourses, fetchAvailableCourses, enrollInCourse } from '@/src/services/courseService';

const CoursesSection: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'enrolled') {
          const courses = await fetchEnrolledCourses();
          setEnrolledCourses(courses);
        } else {
          const courses = await fetchAvailableCourses();
          // Filter out already enrolled courses
          const enrolledIds = new Set(enrolledCourses.map(c => c.id));
          const available = courses.filter(course => !enrolledIds.has(course.id));
          setAvailableCourses(available);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [activeTab, enrolledCourses.length]);

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId);
      // Refresh the enrolled courses
      const courses = await fetchEnrolledCourses();
      setEnrolledCourses(courses);
      // Remove the enrolled course from available courses
      setAvailableCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in the course. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Learning</h2>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'enrolled'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'available'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Browse Courses
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTab === 'enrolled' ? (
        <>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={true}
                  showProgress={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No courses yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't enrolled in any courses yet. Browse our available courses to get started.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('available')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              isEnrolled={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesSection;
