"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSectionQuestions,
  getSectionDetails,
  fetchCourseBySlug,
  Question,
  QuestionResponse,
  deleteQuestion,
} from "@/src/services/courseService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  BookOpen,
  Target,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuestionEditor from "@/components/admin/QuestionEditor";
import { Course } from "@/src/services/courseService";
import { SectionDetails } from "@/src/services/courseService";
import { toast } from "react-hot-toast";

const SectionQuestionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { slug, section } = params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionDetails, setSectionDetails] = useState<SectionDetails | null>(
    null
  );
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });
  const [filters, setFilters] = useState({
    difficulty: "",
    topic: "",
  });
  const [showAnswers, setShowAnswers] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const sectionName = decodeURIComponent(section as string);

  const topicOptions = useMemo(() => {
    const topics = new Set<string>();
    questions.forEach((q) => {
      if (q.topic) {
        topics.add(q.topic);
      }
    });
    return Array.from(topics).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const difficultyBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((q) => {
      const key = (q.difficulty_level || "Unknown").toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [questions]);

  const loadCourseAndSectionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the course details to get the actual course ID
      const courseData = await fetchCourseBySlug(slug as string);
      if (!courseData) {
        throw new Error("Course not found");
      }

      setCourseInfo({
        id: courseData.id,
        title: courseData.title,
        code: courseData.code,
        description: courseData.description,
        category: courseData.category,
        price: courseData.price,
        is_free: courseData.is_free,
        discount_percent: courseData.discount_percent,
        icon_url: courseData.icon_url,
        banner_url: courseData.banner_url,
        tagline: courseData.tagline,
        priority_order: courseData.priority_order,
        is_active: courseData.is_active,
      });

      // Now load section details and questions using the actual course ID
      const [detailsResponse, questionsResponse] = await Promise.all([
        getSectionDetails(courseData.id, sectionName),
        getSectionQuestions(
          courseData.id,
          sectionName,
          pagination.page,
          pagination.limit,
          filters.difficulty || undefined,
          filters.topic || undefined
        ),
      ]);

      setSectionDetails(detailsResponse.section);
      setQuestions(questionsResponse.questions);
      setPagination(questionsResponse.pagination);
    } catch (e: unknown) {
      console.error("Error loading section data:", e);
      setError(e instanceof Error ? e.message : "Failed to load section data");
    } finally {
      setLoading(false);
    }
  }, [slug, sectionName, pagination.page, filters, pagination.limit]);

  useEffect(() => {
    loadCourseAndSectionData();
  }, [slug, sectionName, pagination.page, filters, loadCourseAndSectionData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleQuestionUpdate = (updatedQuestion: QuestionResponse) => {
    setQuestions((prev) =>
      prev.map((q): Question => {
        if (q.id !== updatedQuestion.id) return q;
        // Map QuestionResponse back to Question, preserving required fields like marks
        return {
          ...q,
          id: updatedQuestion.id,
          title: updatedQuestion.title,
          question_text: updatedQuestion.question_text,
          question_type: updatedQuestion.question_type,
          difficulty_level: updatedQuestion.difficulty_level,
          // exam_year intentionally omitted to satisfy current Question typing
          options: updatedQuestion.options || [],
          explanation: updatedQuestion.explanation || "",
          remarks: updatedQuestion.remarks || "",
          subject: updatedQuestion.subject,
          topic: updatedQuestion.topic,
          tags: updatedQuestion.tags || [],
          // Preserve existing marks and timestamps if backend didn't change them in response
          marks: q.marks,
          created_at: updatedQuestion.created_at || q.created_at,
          updated_at: updatedQuestion.updated_at || q.updated_at,
          is_active: updatedQuestion.is_active,
          created_by: updatedQuestion.created_by || q.created_by,
        };
      })
    );
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setEditingQuestionId(null); // Exit editing mode if currently editing
      toast.success("Question deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting question:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete question"
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    if (pagination.page !== 1) {
      setActiveQuestionIndex(0);
    }
  }, [pagination.page]);

  const renderQuestion = (question: Question) => {
    // Convert Question to QuestionResponse format for the editor
    const questionResponse: QuestionResponse = {
      id: question.id,
      title: question.title,
      question_text: question.question_text,
      question_type: question.question_type,
      difficulty_level: question.difficulty_level,
      // exam_year omitted
      options: question.options || [],
      explanation: question.explanation || "",
      remarks: question.remarks || "",
      subject: question.subject,
      topic: question.topic,
      tags: question.tags || [],
      is_active: true,
      created_by: "",
      created_at: question.created_at,
      updated_at: question.created_at,
      question_image_urls: question.question_image_urls || [],
      explanation_image_urls: question.explanation_image_urls || [],
      remarks_image_urls: question.remarks_image_urls || [],
    };

    return (
      <Card className="border border-[#e3f6ec] bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#143f2a]">
                Question{" "}
                {(pagination.page - 1) * pagination.limit +
                  (activeQuestionIndex + 1)}
              </h3>
              <p className="text-sm text-[#2c8a62]">
                {question.topic ? `${question.topic} • ` : ""}Difficulty:{" "}
                {question.difficulty_level}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(question.difficulty_level)}>
                {question.difficulty_level}
              </Badge>
              <Badge variant="outline">{question.marks} marks</Badge>
            </div>
          </div>

          <div className="rounded-lg border border-[#d6f5e5] bg-[#f0fbf4] p-4">
            <QuestionEditor
              question={questionResponse}
              onSave={handleQuestionUpdate}
              onCancel={handleCancelEdit}
              onDelete={handleDeleteQuestion}
              isEditing={editingQuestionId === question.id}
              onEdit={() => handleEditQuestion(question.id)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPagination = () => {
    if (pagination.total_pages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        {pages}
        <Button
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.total_pages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading questions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
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
    <div className="min-h-screen bg-[#f5fcf7]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[#1f7a53] shadow-sm border border-[#d6f5e5] hover:bg-[#ebfaf2] hover:text-[#176344]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-[#143f2a]">
                {sectionDetails?.name || sectionName}
              </h1>
              {courseInfo && (
                <p className="text-[#2c8a62] mt-2 text-sm">
                  {courseInfo.title} ({courseInfo.code})
                </p>
              )}
              {sectionDetails?.description && (
                <p className="text-[#285d43] mt-3 text-sm leading-relaxed">
                  {sectionDetails.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4 text-sm text-[#2c8a62]">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{pagination.total} questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <Card className="border border-[#d6f5e5] bg-white">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-[#d6f5e5] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#143f2a] mb-2">
                No questions found
              </h3>
              <p className="text-[#285d43]">
                {filters.difficulty || filters.topic
                  ? "No questions match your current filters."
                  : "No questions have been uploaded for this section yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#d6f5e5] bg-white shadow-sm p-4">
              <div className="flex flex-wrap gap-3 mb-4">
                {questions.map((question, index) => (
                  <Button
                    key={question.id}
                    size="sm"
                    onClick={() => {
                      setActiveQuestionIndex(index);
                      setEditingQuestionId(null);
                    }}
                    className={`h-9 w-9 rounded-full border ${
                      activeQuestionIndex === index
                        ? "bg-[#1f7a53] text-white border-[#1f7a53]"
                        : "bg-white text-[#1f7a53] border-[#d6f5e5] hover:bg-[#f0fbf4]"
                    }`}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              {renderQuestion(questions[activeQuestionIndex])}
            </div>
            <div className="flex justify-between items-center gap-4">
              <Button
                disabled={activeQuestionIndex === 0}
                onClick={() =>
                  setActiveQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                className="rounded-full bg-white text-[#1f7a53] border border-[#d6f5e5] hover:bg-[#f0fbf4] disabled:opacity-50"
              >
                Previous Question
              </Button>
              <Button
                disabled={activeQuestionIndex === questions.length - 1}
                onClick={() =>
                  setActiveQuestionIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                className="rounded-full bg-[#1f7a53] text-white hover:bg-[#176344] disabled:opacity-50"
              >
                Next Question
              </Button>
            </div>
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionQuestionsPage;
