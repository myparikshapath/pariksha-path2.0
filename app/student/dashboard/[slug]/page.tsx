"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import dynamic from "next/dynamic";
import { AxiosError } from "axios";

// Dynamically import the CoursesSection component with no SSR
const CoursesSection = dynamic(
  () => import('@/src/components/courses/CoursesSection'),
  { ssr: false }
);

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  enrolled_courses: string[];
  preferred_exam_categories: string[];
  purchased_test_series: string[];
  has_premium_access: boolean;
  created_at: string;
  last_login?: string;
}

// interface ApiResponse<T> {
//   data: T;
// }

// interface UserResponse extends UserData { }

export default function StudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    fetchUserData();
  }, [isLoggedIn, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<UserData>("/auth/me");

      if (response.data) {
        setUserData(response.data);
      } else {
        throw new Error("No user data received");
      }
    } catch (err: unknown) {
      console.error("Error fetching user data:", err);

      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
          "Failed to load user data. Please try again later."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0000D3]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading User Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-6 py-2 bg-[#0000D3] text-white rounded-lg hover:bg-blue-900 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
      {/* Welcome Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {userData?.name || "Student"}! 👋
              {userData?.has_premium_access && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Premium
                </span>
              )}
            </h1>
            <p className="text-gray-600">{userData?.email}</p>
            <p className="text-gray-500 text-sm">
              Member since{" "}
              {userData?.created_at
                ? new Date(userData.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {userData?.is_verified ? (
                  <span className="text-green-600">✓ Verified Account</span>
                ) : (
                  <span className="text-yellow-600">Unverified Account</span>
                )}
              </p>
              {userData?.last_login && (
                <p className="text-xs text-gray-400">
                  Last login: {new Date(userData.last_login).toLocaleString()}
                </p>
              )}
            </div>
            {slug && (
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Viewing: {slug}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Enrolled Courses
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {userData?.enrolled_courses?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Test Series */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Test Series</p>
              <p className="text-2xl font-bold text-gray-800">
                {userData?.purchased_test_series?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Account Status
              </p>
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${userData?.is_active ? "bg-green-500" : "bg-red-500"
                    } mr-2`}
                ></span>
                <span className="text-2xl font-bold text-gray-800">
                  {userData?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-12">
        <CoursesSection />
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">User ID</h3>
              <p className="text-gray-800 font-mono text-sm break-all">
                {userData?.id || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="text-gray-800">
                {userData?.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Email Status
              </h3>
              <p className="text-gray-800">
                {userData?.is_verified ? (
                  <span className="text-green-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-6a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Not Verified
                  </span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Subscription Plan
              </h3>
              <div className="flex items-center">
                {userData?.has_premium_access ? (
                  <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                    Premium Member
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                    Free Plan
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Categories */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Exam Categories</h2>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Preferred Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData?.preferred_exam_categories?.length ? (
              userData.preferred_exam_categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {category}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No preferred categories selected
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Enrolled Courses
            </h3>
            {userData?.enrolled_courses?.length ? (
              <div className="space-y-2">
                {userData.enrolled_courses
                  .slice(0, 3)
                  .map((courseId, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="truncate">Course ID: {courseId}</span>
                    </div>
                  ))}
                {userData.enrolled_courses.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{userData.enrolled_courses.length - 3} more courses
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No courses enrolled yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
