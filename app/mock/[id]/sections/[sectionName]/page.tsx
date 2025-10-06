"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSectionQuestions,
  getSectionDetails,
  fetchCourseBySlug,
  Question,
} from "@/src/services/courseService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { Course } from "@/src/services/courseService";
import { SectionDetails } from "@/src/services/courseService";

const SectionQuestionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id, sectionName: section } = params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionDetails, setSectionDetails] = useState<SectionDetails | null>(
    null
  );
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });

  // Track selected answers
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});

  const sectionName = decodeURIComponent(section as string);

  const loadCourseAndSectionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseData = await fetchCourseBySlug(id as string);
      if (!courseData) throw new Error("Course not found");

      setCourseInfo(courseData);
      console.log(pagination);

      const [detailsResponse, questionsResponse] = await Promise.all([
        getSectionDetails(courseData.id, sectionName),
        getSectionQuestions(
          courseData.id,
          sectionName,
          pagination.page,
          pagination.limit,
          undefined,
          undefined,
          "mock"
        ),
      ]);

      setSectionDetails(detailsResponse.section);
      // setQuestions(questionsResponse.questions);
      // setPagination(questionsResponse.pagination);
      if (questionsResponse.pagination.limit === 0) {
        // Mock mode case → ignore pagination overwrite
        setQuestions(questionsResponse.questions);
      } else {
        setQuestions(questionsResponse.questions);
        setPagination(questionsResponse.pagination);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load section data");
    } finally {
      setLoading(false);
    }
  }, [id, sectionName, pagination.page, pagination.limit]); // ✅ Use specific pagination properties

  useEffect(() => {
    loadCourseAndSectionData();
  }, [loadCourseAndSectionData]);

  const handleAnswerSelect = (questionId: string, optionText: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const getOptionStyle = (question: Question, optionText: string) => {
    const userAnswer = selectedAnswers[question.id];
    const correctOption = question.options.find((o) => o.is_correct)?.text;

    if (!userAnswer) return "border-gray-300 hover:bg-gray-50";

    if (userAnswer === optionText) {
      return optionText === correctOption
        ? "border-green-500 bg-green-100"
        : "border-red-500 bg-red-100";
    }

    if (optionText === correctOption) {
      return "border-green-500 bg-green-50";
    }

    return "border-gray-300 opacity-50";
  };

  const renderQuestion = (question: Question, index: number) => (
    <Card key={question.id} className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Question {(pagination.page - 1) * pagination.limit + index + 1}
          </h3>
          <div className="flex gap-2">
            <Badge>{question.difficulty_level}</Badge>
            <Badge variant="outline">{question.marks} marks</Badge>
          </div>
        </div>

        <p className="text-gray-800 mb-4">{question.question_text}</p>

        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              disabled={!!selectedAnswers[question.id]} // Disable after selecting
              onClick={() => handleAnswerSelect(question.id, option.text)}
              className={`w-full text-left px-4 py-2 rounded border transition ${getOptionStyle(
                question,
                option.text
              )}`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading questions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200" />
          Back to Sections
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">
          {sectionDetails?.name || sectionName}
        </h1>
        {courseInfo && (
          <p className="text-gray-600 mt-2">
            {courseInfo.title} ({courseInfo.code})
          </p>
        )}
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No questions found
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => renderQuestion(q, i))}
        </div>
      )}
    </div>
  );
};

export default SectionQuestionsPage;
