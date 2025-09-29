"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Award } from "lucide-react";
import api from "@/utils/api";

interface SectionSummary {
  section: string;
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
}

interface QuestionAttempt {
  question_id: string;
  selected_option_order: number | null;
  correct_option_order: number | null;
  is_correct: boolean;
}

interface MockAttemptDetails {
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
  section_summaries: SectionSummary[];
  question_attempts: QuestionAttempt[];
}

export default function MockAttemptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [attemptDetails, setAttemptDetails] = useState<MockAttemptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAttemptDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/v1/mock-history/${id}`);
        setAttemptDetails(response.data.attempt);
      } catch (err) {
        console.error("Error fetching attempt details:", err);
        setError("Failed to load test attempt details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading attempt details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!attemptDetails) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => router.push("/mock/history")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Test Attempt Details</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{attemptDetails.course.title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{formatDate(attemptDetails.date)}</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Score</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {attemptDetails.score} / {attemptDetails.max_score} ({attemptDetails.percentage}%)
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Accuracy</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {Math.round(attemptDetails.accuracy * 100)}%
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Time Spent</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatTime(attemptDetails.time_spent_seconds)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {attemptDetails.total_questions}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Attempted Questions</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {attemptDetails.attempted_questions}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Section Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attemptDetails.section_summaries.map((section, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.section}</h3>
              <p className="text-sm text-gray-600">{section.correct} / {section.total} correct</p>
              <p className="text-sm text-gray-600">Accuracy: {Math.round(section.accuracy * 100)}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Question Attempts</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {attemptDetails.question_attempts.map((qa, idx) => (
              <li key={idx} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Question ID: {qa.question_id}</p>
                  <p className={`text-sm font-medium ${qa.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {qa.is_correct ? 'Correct' : 'Incorrect'}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Selected Option: {qa.selected_option_order !== null ? qa.selected_option_order + 1 : 'None'}</p>
                  <p className="text-sm text-gray-500">Correct Option: {qa.correct_option_order !== null ? qa.correct_option_order + 1 : 'None'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
