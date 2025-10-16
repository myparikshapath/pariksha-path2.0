"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  Eye,
  X,
  Trash2,
} from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AdminRoute } from "@/components/AdminRoute";
import { getCourseById } from "@/src/services/courseService";

interface CourseEnrollment {
  id: string;
  course_id: string;
  course_title: string;
  course_code: string;
  course_category: string;
  enrolled_at: string;
  expires_at?: string;
  is_active: boolean;
  is_expired: boolean;
  days_remaining?: number;
  enrollment_source: string;
  validity_period_days: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  course_enrollments?: CourseEnrollment[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  const limit = 8;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchStudents = async (pageNumber = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students", {
        params: { page: pageNumber, limit, search: searchTerm },
      });
      setStudents(res.data.data);
      setPagination(res.data.pagination);
      setPage(pageNumber);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message || err.message || "Failed to fetch students"
      );
    } finally {
      setLoading(false);
    }
  };

  const deactivateStudent = async (id: string) => {
    if (!confirm("Deactivate this student?")) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchStudents(page, debouncedSearch);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to deactivate student"
      );
    }
  };

  const activateStudent = async(id:string) =>{
    if(!confirm("Activate htis student?")) return;
    try{
      await api.put(`/admin/students/${id}`,{is_active:true})
      fetchStudents(page, debouncedSearch);
    }catch(error){
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to activate student"
      );
    }
  }

  const permanentlyDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this student? This action cannot be undone and will remove all associated data.")) return;
    try {
      await api.delete(`/admin/students/${id}/permanent`);
      fetchStudents(page, debouncedSearch);
      if (selectedStudent && selectedStudent.id === id) {
        setShowStudentDetails(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to permanently delete student"
      );
    }
  };

  const viewStudentDetails = async (studentId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/students/${studentId}`);
      console.log(res);

      const studentData = res.data.data.student;
      const enrolledCourseIds = studentData.enrolled_courses || [];

      // Fetch course details for each enrolled course
      const courseEnrollments: CourseEnrollment[] = [];

      if (enrolledCourseIds.length > 0) {
        try {
          const coursePromises = enrolledCourseIds.map(
            async (courseId: string) => {
              try {
                const course = await getCourseById(courseId);
                return {
                  id: `${studentId}_${courseId}`, // Generate unique enrollment ID
                  course_id: courseId,
                  course_title: course.title,
                  course_code: course.code || courseId,
                  course_category: course.category,
                  enrolled_at:
                    studentData.created_at || new Date().toISOString(),
                  expires_at: course.validity_period_days
                    ? new Date(
                        Date.now() +
                          course.validity_period_days * 24 * 60 * 60 * 1000
                      ).toISOString()
                    : undefined,
                  is_active: true,
                  is_expired: false,
                  days_remaining: course.validity_period_days || undefined,
                  validity_period_days: course.validity_period_days || 0,
                };
              } catch (error) {
                console.error(`Failed to fetch course ${courseId}:`, error);
                return null;
              }
            }
          );

          const courseResults = await Promise.all(coursePromises);
          courseEnrollments.push(
            ...(courseResults.filter(Boolean) as CourseEnrollment[])
          );
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
      }

      // Set the course enrollments on the student object
      const studentWithEnrollments = {
        ...studentData,
        course_enrollments: courseEnrollments,
      };

      setSelectedStudent(studentWithEnrollments);
      setShowStudentDetails(true);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch student details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, debouncedSearch);
  }, [debouncedSearch]);

  return (
    <AdminRoute>
      <div className="min-h-screen p-6 md:p-10 bg-gray-50 flex flex-col items-center">
        {/* Back button - left aligned, above banner */}
        <div className="w-full max-w-9xl mb-4 flex justify-start cursor-pointer">
          <Button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-4 py-2 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Banner */}
        <div className="w-full max-w-9xl bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl shadow-lg border border-green-200/50 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2 sm:mb-0">
                Students
              </h1>
              <p className="text-sm sm:text-lg text-green-800">
                Manage all registered students and their enrollments
              </p>
            </div>
            <Button
              onClick={() => fetchStudents(page, debouncedSearch)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-lg cursor-pointer"
            >
              ⟳ Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-9xl mb-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-gray-700"
            />
          </div>
        </div>

        {/* Loading / Empty */}
        {loading ? (
          <p className="text-gray-600 text-center py-8">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No students found.</p>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
              {students.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-6 cursor-pointer"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {s.name}
                  </h2>
                  <p className="text-sm text-gray-600">{s.email}</p>
                  <p className="text-sm text-gray-600">{s.phone}</p>
                  <div className="mt-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        s.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      onClick={() =>
                        s.is_active
                          ? deactivateStudent(s.id)
                          : activateStudent(s.id)
                      }
                      className={`w-full ${
                        s.is_active
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white`}
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      onClick={() => viewStudentDetails(s.id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      View Details
                    </Button>
                    {!s.is_active && (
                      <Button
                        onClick={() => permanentlyDeleteStudent(s.id)}
                        className="w-full bg-red-700 hover:bg-red-800 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg border border-gray-200 w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-900 text-white text-sm uppercase tracking-wide">
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Phone</th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Details
                    </th>
                    <th className="px-6 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`${
                        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-green-50 transition`}
                    >
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {s.name}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{s.email}</td>
                      <td className="px-6 py-3 text-gray-700">{s.phone}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            s.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Button
                          onClick={() => viewStudentDetails(s.id)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() =>
                              s.is_active
                                ? deactivateStudent(s.id)
                                : activateStudent(s.id)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
                              s.is_active
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                          >
                            {s.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          {!s.is_active && (
                            <Button
                              onClick={() => permanentlyDeleteStudent(s.id)}
                              className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm bg-red-700 hover:bg-red-800 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10 flex-wrap">
                <Button
                  disabled={page === 1}
                  onClick={() => fetchStudents(page - 1, debouncedSearch)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                {Array.from(
                  { length: pagination.total_pages },
                  (_, i) => i + 1
                ).map((num) => (
                  <Button
                    key={num}
                    onClick={() => fetchStudents(num, debouncedSearch)}
                    className={`${
                      page === num
                        ? "bg-green-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-green-100"
                    } px-4 py-2 rounded-full`}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  disabled={page === pagination.total_pages}
                  onClick={() => fetchStudents(page + 1, debouncedSearch)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Student Modal */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-green-900">
                    Student Details - {selectedStudent.name}
                  </h2>
                  <div className="flex gap-2">
                    {!selectedStudent.is_active && (
                      <Button
                        onClick={() => {
                          permanentlyDeleteStudent(selectedStudent.id);
                          setShowStudentDetails(false);
                        }}
                        className="bg-red-700 hover:bg-red-800 text-white px-4 py-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </Button>
                    )}
                    <button
                      onClick={() => setShowStudentDetails(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Name
                      </label>
                      <p className="text-lg text-gray-800">
                        {selectedStudent.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Email
                      </label>
                      <p className="text-lg text-gray-800">
                        {selectedStudent.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Phone
                      </label>
                      <p className="text-lg text-gray-800">
                        {selectedStudent.phone}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Status
                      </label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            selectedStudent.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {selectedStudent.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Email Verified
                      </label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            selectedStudent.is_verified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {selectedStudent.is_verified
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Enrollments */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">
                    Course Enrollments (
                    {selectedStudent.course_enrollments?.length || 0})
                  </h3>

                  {selectedStudent.course_enrollments &&
                  selectedStudent.course_enrollments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-sm uppercase tracking-wide">
                            <th className="px-4 py-3 text-left font-semibold">
                              Course
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Enrolled
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Expires
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Days Left
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.course_enrollments.map(
                            (enrollment) => (
                              <tr
                                key={enrollment.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="px-4 py-3">
                                  <p className="font-medium text-gray-800">
                                    {enrollment.course_title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {enrollment.course_code}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                    {enrollment.course_category}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {new Date(
                                    enrollment.enrolled_at
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {enrollment.expires_at
                                    ? new Date(
                                        enrollment.expires_at
                                      ).toLocaleDateString()
                                    : "No expiration"}
                                </td>
                                <td className="px-4 py-3">
                                  {enrollment.is_expired ? (
                                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                      Expired
                                    </span>
                                  ) : enrollment.is_active ? (
                                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                                      Inactive
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {enrollment.days_remaining !== undefined
                                    ? enrollment.days_remaining > 0
                                      ? `${enrollment.days_remaining} days`
                                      : "Expired"
                                    : "N/A"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No course enrollments found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
