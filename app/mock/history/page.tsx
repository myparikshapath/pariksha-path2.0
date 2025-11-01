"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, Award, Eye, RotateCcw } from "lucide-react";
import api from "@/utils/api";
import Link from "next/link";

interface MockAttempt {
  id: string;
  date: string;
  score: number;
  max_score: number;
  percentage: number;
  accuracy: number;
  total_questions: number;
  attempted_questions: number;
  time_spent_seconds: number;
  course: {
    id: string;
    title: string;
    code: string;
  };
}

export default function MockHistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<MockAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("mock-history");
        setAttempts(response.data.attempts || []);
      } catch (err) {
        console.error("Error fetching mock history:", err);
        setError("Failed to load your test history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/mock")}
           className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mock Tests
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Your Test History</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading test history...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
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
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4">
            <Award className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Test History Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven&apos;t completed any mock tests. Take a test to see your
            results here!
          </p>
          <Button onClick={() => router.push("/mock")}>
            Browse Mock Tests
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {attempt.course.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(attempt.date)}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTime(attempt.time_spent_seconds)}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div className="flex flex-col items-end">
                    <div
                      className={`text-lg font-bold ${
                        attempt.percentage >= 70
                          ? "text-green-600"
                          : attempt.percentage >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {attempt.score} / {attempt.max_score} (
                      {/* {attempt.percentage}%) */}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attempt.attempted_questions} of {attempt.total_questions}{" "}
                      questions attempted
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                <div className="w-full sm:w-2/3 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      attempt.percentage >= 70
                        ? "bg-green-500"
                        : attempt.percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${attempt.percentage}%` }}
                  />
                </div>

                <div className="flex gap-2 sm:justify-end">
                  <Button
                    size="sm"
                    className="flex items-center"
                    onClick={() =>
                      router.push(
                        `/mock/${attempt.course.id}/attempt?historyAttemptId=${attempt.id}`
                      )
                    }
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>

                  <Link href={`/mock/history/${attempt.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
