"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";

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

interface ApiResponse<T> {
  data: T;
}

interface UserResponse extends UserData {}

export default function StudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";

  useEffect(() => {
    // Redirect to login if not authenticated
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

      const response = await api.get<UserResponse>("/auth/me");

      if (response.data) {
        setUserData(response.data);
      } else {
        throw new Error("No user data received");
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load user data. Please try again later."
      );
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
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-start">
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
        </div>

        {slug && (
          <div className="mt-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Viewing: {slug}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">User ID</h3>
              <p className="text-gray-800 font-mono text-sm">
                {userData?.id || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="text-gray-800">
                {userData?.phone || "Not provided"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Account Status
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    userData?.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span>{userData?.is_active ? "Active" : "Inactive"}</span>
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
    </div>
  );
}
