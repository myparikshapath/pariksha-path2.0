"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";

// Types
interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    preferred_exam_categories: string[];
    enrolled_courses: any[];
    purchased_test_series: any[];
  };
  analytics: {
    performance: Array<{ subject: string; accuracy: number }>;
    total_tests: number;
    avg_score: number;
    study_time: number;
  };
  recent_activity: any[];
  exam_categories: string[];
}

export default function DynamicStudentDashboard() {
  const { slug } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colors = ["#0000D3", "#FF6B6B", "#4CAF50"];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [isLoggedIn, slug]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch multiple data sources in parallel
      const [userResponse, analyticsResponse, coursesResponse, testsResponse, categoriesResponse] = await Promise.all([
        api.get('/auth/me'),
        api.get('/analytics/user'),
        api.get('/courses/enrolled'),
        api.get('/tests/attempts?limit=5'),
        api.get('/exam-categories/')
      ]);

      const [userData, analyticsData, coursesData, testsData, categoriesData] = await Promise.all([
        userResponse.data,
        analyticsResponse.data,
        coursesResponse.data,
        testsResponse.data,
        categoriesResponse.data
      ]);

      // Transform data for dashboard
      const transformedData: DashboardData = {
        user: userData.user,
        analytics: {
          performance: analyticsData.analytics?.subject_performance ?
            Object.entries(analyticsData.analytics.subject_performance).map(([subject, data]: [string, any]) => ({
              subject,
              accuracy: Math.round(data.accuracy * 100)
            })) : [
              { subject: "Maths", accuracy: 75 },
              { subject: "English", accuracy: 60 },
              { subject: "Reasoning", accuracy: 85 }
            ],
          total_tests: analyticsData.analytics?.tests_taken || 0,
          avg_score: analyticsData.analytics?.avg_test_score || 0,
          study_time: analyticsData.analytics?.total_study_time_minutes || 0
        },
        recent_activity: testsData.attempts || [],
        exam_categories: categoriesData.structure ?
          Object.keys(categoriesData.structure) :
          ["Defence", "State Exams", "Banking", "SSC"]
      };

      setDashboardData(transformedData);
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // The API interceptor will handle redirect
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load dashboard data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <p>Checking authentication...</p>;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0000D3]"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load dashboard data'}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-[#0000D3] text-white rounded-lg hover:bg-blue-900 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 pt-32">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-[#0000D3] to-[#4a4ae4] p-6 rounded-xl shadow-lg text-white"
      >
        <div>
          <h1 className="text-3xl font-extrabold">
            Welcome, {dashboardData.user.name}! 🎉
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Track your progress and continue learning.
          </p>
          {slug && (
            <p className="mt-2 text-xs text-blue-200">
              Dashboard View: {slug}
            </p>
          )}
        </div>
        <Link href="/student/profile">
          <button className="mt-4 md:mt-0 px-6 py-2 bg-white text-[#0000D3] font-semibold rounded-lg shadow hover:shadow-md transition">
            View Profile
          </button>
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          >
            <h3 className="text-sm font-medium text-gray-500">Tests Taken</h3>
            <p className="text-3xl font-bold text-[#0000D3]">{dashboardData.analytics.total_tests}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          >
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className="text-3xl font-bold text-green-600">{Math.round(dashboardData.analytics.avg_score)}%</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          >
            <h3 className="text-sm font-medium text-gray-500">Study Time</h3>
            <p className="text-3xl font-bold text-purple-600">{Math.round(dashboardData.analytics.study_time / 60)}h</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          >
            <h3 className="text-sm font-medium text-gray-500">Courses Enrolled</h3>
            <p className="text-3xl font-bold text-orange-600">{dashboardData.user.enrolled_courses.length}</p>
          </motion.div>
        </div>
      </section>

      {/* Exam Categories */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Explore Exam Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {dashboardData.exam_categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-6 rounded-xl shadow-md bg-white border border-gray-100 text-center font-semibold text-gray-800 hover:shadow-lg hover:bg-blue-50 cursor-pointer"
            >
              {cat}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enrolled Courses & Recent Tests */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Your Courses & Recent Tests
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {dashboardData.user.enrolled_courses.slice(0, 4).map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{course.title || course.name}</p>
                <p className="text-sm text-gray-500">Course</p>
              </div>
              <Link href={`/student/courses/${course.id || course.code}`}>
                <button className="px-4 py-2 bg-[#0000D3] text-white rounded-sm shadow hover:bg-blue-900 transition">
                  Continue
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Performance Analytics */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Performance Analytics
        </h2>
        <div className="bg-white shadow-md rounded-sm p-6 w-full h-80 md:h-96">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dashboardData.analytics.performance}
                dataKey="accuracy"
                nameKey="subject"
                outerRadius={120}
                innerRadius={50}
                label
              >
                {dashboardData.analytics.performance.map((_, index) => (
                  <Cell
                    key={index}
                    fill={colors[index % colors.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/student/tests">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-[#0000D3] text-white font-semibold rounded-sm shadow hover:bg-blue-900 transition"
            >
              Attempt a Test
            </motion.button>
          </Link>
          <Link href="/student/analysis">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 border border-[#0000D3] text-[#0000D3] font-semibold rounded-sm hover:bg-blue-50 transition"
            >
              View Detailed Analysis
            </motion.button>
          </Link>
          <Link href="/student/materials">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 border border-[#0000D3] text-[#0000D3] font-semibold rounded-sm hover:bg-blue-50 transition"
            >
              Study Materials
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}