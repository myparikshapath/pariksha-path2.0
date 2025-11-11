"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Course } from "@/src/services/courseService";
import { get as cachedGet } from "@/utils/request";
import { useCoursesStore } from "@/stores/courses";
import { useStoreSelector } from "@/hooks/useStoreSelector";

// Dynamically import CoursesSection with no SSR
// const CoursesSection = dynamic(
//   () => import("@/src/components/courses/CoursesSection"),
//   { ssr: false }
// );

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
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn) as boolean;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";

  const enrolledIds = useStoreSelector(useCoursesStore, (s) => s.enrolledIds);
  const byId = useStoreSelector(useCoursesStore, (s) => s.byId);
  const fetchEnrolled = useStoreSelector(useCoursesStore, (s) => s.fetchEnrolled);

  useEffect(() => {
    if (userData) {
      void fetchEnrolled();
    }
  }, [userData, fetchEnrolled]);
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
      const data = await cachedGet<UserData>("/auth/me", undefined, { ttlMs: 2 * 60 * 1000 });

      if (data) {
        setUserData(data as UserData);
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
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
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-lg transition"
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolledIds.map((id) => byId[id]).map((course) =>
          course && course.title ? (
            <Card
              key={course.id}
              className="hover:shadow-md transition-all py-4"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-2">
                  {course.title || "Untitled Course"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md py-8">
                  <span className="text-3xl text-gray-400">
                    {course.title ? course.title.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {course.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800"
                    onClick={() => router.push(`/student/course/${course.id}`)}
                  >
                    View Material
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/mock/${course.id}/attempt`)}
                  >
                    View Mock
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 my-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => router.push("/mock/history")}
            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white"
          >
            View Mock Test History
          </Button>
        </div>
      </div>
    </div>
  );
}
