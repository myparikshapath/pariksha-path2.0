"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/src/services/courseService";
import Image from "next/image";

// Dynamically import CoursesSection with no SSR
const CoursesSection = dynamic(
  () => import("@/src/components/courses/CoursesSection"),
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

export default function StudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";


  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (userData?.enrolled_courses?.length) {
        try {
          const responses = await Promise.all(
            userData.enrolled_courses.map((id) => api.get(`/courses/${id}`))
          );
          setEnrolledCourses(responses.map((res) => res.data));
        } catch (err) {
          console.error("Error fetching courses:", err);
        }
      }
    };

    fetchCourses();
  }, [userData]);
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
    } catch (error) {
      console.error("Error fetching user data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load user data. Please try again later.";
      setError(errorMessage);
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
              📘
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
              📄
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
            <div className="p-3 bg-purple-100 rounded-lg">👤</div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-12">
        <CoursesSection />
      </div>

      {/* Exam Categories */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Exam Categories</h2>

        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Preferred Categories
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Enrolled Courses as Cards */}
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Enrolled Courses
        </h3>
        {userData?.enrolled_courses?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.enrolled_courses.slice(0, 3).map((courseId, index) => (
              <Card key={index} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Course {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 break-all">
                    ID: {courseId}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No courses enrolled yet</p>
        )}

        {userData?.enrolled_courses?.length &&
          userData.enrolled_courses.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{userData.enrolled_courses.length - 3} more courses
            </p>
          )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-2">
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.thumbnail_url ? (
                <div className="relative w-full h-40 mb-2">
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md">
                  <span className="text-3xl text-gray-400">
                    {course.title.charAt(0)}
                  </span>
                </div>
              )}

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {course.description}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  View Material
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/mock/${course.id}`)}
                >
                  View Mock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => router.push("/mock/history")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Mock Test History
          </Button>
        </div>
      </div>

    </div>
  );
}
