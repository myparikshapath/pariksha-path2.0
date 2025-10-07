"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, ArrowLeft, Eye, X } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

  // 🔍 Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
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
   const activateStudent = async(id : string) => {
    if (!confirm("Activate this student?")) return;
    try {
      await api.put(`/admin/students/${id}`, { is_active: true });
      fetchStudents(page, debouncedSearch);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to activate student"
      );
    }
   }
  const viewStudentDetails = async (studentId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/students/${studentId}`);
      setSelectedStudent(res.data.data.student);
      setShowStudentDetails(true);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(
        err.response?.data?.message || err.message || "Failed to fetch student details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="p-6 md:p-10">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-center text-[#2E4A3C] mb-2">
        Students
      </h1>
      <div className="h-1 w-24 mx-auto bg-yellow-400 rounded-full mb-8" />
      <Button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-4 py-2 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      {/* 🔍 Search Bar */}
      <div className="flex justify-center mb-8 ">
        <div className="relative w-full max-w-10xl">
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

      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-600 text-center">No students found.</p>
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
                className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {s.name}
                </h2>
                <p className="text-sm text-gray-600">{s.email}</p>
                <p className="text-sm text-gray-600">{s.phone}</p>

                <div className="mt-3">
                  {s.is_active ? (
                    <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {s.is_active ? (
                    <button
                      onClick={() => deactivateStudent(s.id)}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-transform hover:scale-105"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => activateStudent(s.id)}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-transform hover:scale-105"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#2E4A3C] text-white text-sm uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Details</th>
                  <th className="px-6 py-3 text-center font-semibold">
                    Action
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
                      {s.is_active ? (
                        <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => viewStudentDetails(s.id)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-transform hover:scale-105 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {s.is_active ? (
                        <button
                          onClick={() => deactivateStudent(s.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-transform hover:scale-105 text-sm font-medium"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateStudent(s.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-transform hover:scale-105 text-sm font-medium"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              {/* Prev Button */}
              <button
                disabled={page === 1}
                onClick={() => fetchStudents(page - 1, debouncedSearch)}
                className="p-2 rounded-full bg-gray-200 text-gray-700 shadow-sm disabled:opacity-50 
      hover:bg-gray-300 hover:scale-105 transition flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {Array.from(
                { length: pagination.total_pages },
                (_, i) => i + 1
              ).map((num) => (
                <button
                  key={num}
                  onClick={() => fetchStudents(num, debouncedSearch)}
                  className={`px-4 py-2 rounded-full font-medium shadow-sm transition-transform hover:scale-105 
          ${
            page === num
              ? "bg-[#2E4A3C] text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"
          }`}
                >
                  {num}
                </button>
              ))}

              {/* Next Button */}
              <button
                disabled={page === pagination.total_pages}
                onClick={() => fetchStudents(page + 1, debouncedSearch)}
                className="p-2 rounded-full bg-gray-200 text-gray-700 shadow-sm disabled:opacity-50 
      hover:bg-gray-300 hover:scale-105 transition flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#2E4A3C]">
                  Student Details - {selectedStudent.name}
                </h2>
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Student Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Name</label>
                    <p className="text-lg text-gray-800">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-lg text-gray-800">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <p className="text-lg text-gray-800">{selectedStudent.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <div className="mt-1">
                      {selectedStudent.is_active ? (
                        <span className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email Verified</label>
                    <div className="mt-1">
                      {selectedStudent.is_verified ? (
                        <span className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Enrollments */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-[#2E4A3C] mb-4">
                  Course Enrollments ({selectedStudent.course_enrollments?.length || 0})
                </h3>

                {selectedStudent.course_enrollments && selectedStudent.course_enrollments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-sm uppercase tracking-wide">
                          <th className="px-4 py-3 text-left font-semibold">Course</th>
                          <th className="px-4 py-3 text-left font-semibold">Category</th>
                          <th className="px-4 py-3 text-left font-semibold">Enrolled</th>
                          <th className="px-4 py-3 text-left font-semibold">Expires</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-left font-semibold">Days Left</th>
                          <th className="px-4 py-3 text-left font-semibold">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.course_enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">{enrollment.course_title}</p>
                                <p className="text-sm text-gray-600">{enrollment.course_code}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                {enrollment.course_category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {enrollment.expires_at
                                ? new Date(enrollment.expires_at).toLocaleDateString()
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
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                                {enrollment.enrollment_source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No course enrollments found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
