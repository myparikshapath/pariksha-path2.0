"use client";

import { useEffect, useMemo, useState } from "react";
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mock Test Result</h1>
          <p className="text-gray-600">{results.course?.title}</p>
        </div>
        <Button variant="ghost" onClick={() => router.push("/mock")}>Back to Mocks</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Score" value={`${results.score} / ${results.max_score}`} />
        <Stat label="Percentage" value={`${percentage}%`} />
        <Stat label="Accuracy" value={`${Math.round((results.accuracy || 0) * 100)}%`} />
        <Stat label="Attempted" value={`${results.attempted_questions} / ${results.total_questions}`} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Section Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(results.section_summaries || []).map((s: any, idx: number) => (
            <div key={idx} className="border rounded p-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{s.section}</span>
                <span className="text-sm text-gray-500">{s.attempted}/{s.total}</span>
              </div>
              <div className="text-sm">Correct: {s.correct}</div>
              <div className="text-sm text-gray-600">Accuracy: {Math.round((s.accuracy || 0) * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => router.push(`/mock/${id}/attempt`)}>Retake</Button>
        <Button variant="outline" onClick={() => router.push(`/mock/${id}`)}>Go to Mock Overview</Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}


