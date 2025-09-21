"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MockResultPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [results, setResults] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    const key = `mock_results_${id as string}`;
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
      if (raw) setResults(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load results", e);
    }
  }, [id]);

  if (!results) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-xl font-semibold mb-2">No Results Found</h1>
          <p className="text-gray-600 mb-4">Please complete a mock test first.</p>
          <Button onClick={() => router.push(`/mock/${id}/attempt`)}>Back to Test</Button>
        </div>
      </div>
    );
  }

  const percentage = results.percentage ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-lg text-gray-600">{results.course?.title}</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button variant="outline" onClick={() => router.push("/mock")}>
              Back to Mocks
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/mock/${id}/attempt`)}>
              Retake Test
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Stat 
            label="Score" 
            value={`${results.score} / ${results.max_score}`}
            icon="🎯"
            color="blue"
          />
          <Stat 
            label="Percentage" 
            value={`${percentage}%`}
            icon="📊"
            color={percentage >= 70 ? "green" : percentage >= 50 ? "yellow" : "red"}
          />
          <Stat 
            label="Accuracy" 
            value={`${Math.round((results.accuracy || 0) * 100)}%`}
            icon="🎯"
            color="purple"
          />
          <Stat 
            label="Attempted" 
            value={`${results.attempted_questions} / ${results.total_questions}`}
            icon="📝"
            color="indigo"
          />
        </div>

        {/* Section Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Section Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(results.section_summaries || []).map((s: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{s.section}</h3>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                    {s.attempted}/{s.total}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Correct:</span>
                    <span className="font-medium text-green-600">{s.correct}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy:</span>
                    <span className={`font-medium ${
                      s.accuracy >= 0.7 ? 'text-green-600' : 
                      s.accuracy >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round((s.accuracy || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        s.accuracy >= 0.7 ? 'bg-green-500' : 
                        s.accuracy >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(s.accuracy || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Performance Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Time Management</h3>
              <p className="text-sm text-blue-700">
                You spent {Math.floor((results.time_spent_seconds || 0) / 60)} minutes on this test.
                {results.time_spent_seconds && results.time_spent_seconds < 1800 && 
                  " Great time management!"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Completion Rate</h3>
              <p className="text-sm text-green-700">
                You attempted {results.attempted_questions} out of {results.total_questions} questions.
                {results.attempted_questions === results.total_questions && 
                  " Excellent! You answered all questions."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.push(`/mock/${id}/attempt`)}
            className="px-8 py-3 text-lg"
          >
            Retake Test
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/mock/${id}`)}
            className="px-8 py-3 text-lg"
          >
            View Mock Details
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/mock")}
            className="px-8 py-3 text-lg"
          >
            Browse More Mocks
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ 
  label, 
  value, 
  icon, 
  color = "blue" 
}: { 
  label: string; 
  value: string; 
  icon?: string; 
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "indigo";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center mb-3">
        {icon && <span className="text-2xl mr-2">{icon}</span>}
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colorClasses[color]}`}></div>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}