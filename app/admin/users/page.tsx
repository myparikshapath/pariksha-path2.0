"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
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

  const activateStudent = async (id: string) => {
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
    </div>
  );
}
