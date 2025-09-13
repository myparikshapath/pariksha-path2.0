"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSectionQuestions, getSectionDetails, fetchCourseBySlug, Question, QuestionResponse, updateQuestion } from "@/src/services/courseService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuestionEditor from "@/components/admin/QuestionEditor";

const SectionQuestionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { slug, section } = params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionDetails, setSectionDetails] = useState<any>(null);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
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

  const [courseId, setCourseId] = useState<string | null>(null);
  const sectionName = decodeURIComponent(section as string);

  useEffect(() => {
    loadCourseAndSectionData();
  }, [slug, sectionName, pagination.page, filters]);

  const loadCourseAndSectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the course details to get the actual course ID
      const courseData = await fetchCourseBySlug(slug as string);
      if (!courseData) {
        throw new Error("Course not found");
      }
      
      setCourseId(courseData.id);
      setCourseInfo({
        id: courseData.id,
        title: courseData.title,
        code: courseData.code,
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
    } catch (e: any) {
      console.error("Error loading section data:", e);
      setError(e?.message || "Failed to load section data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleQuestionUpdate = (updatedQuestion: QuestionResponse) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setEditingQuestionId(null); // Exit editing mode if currently editing
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

  const renderQuestion = (question: Question, index: number) => {
    // Convert Question to QuestionResponse format for the editor
    const questionResponse: QuestionResponse = {
      id: question.id,
      title: question.title,
      question_text: question.question_text,
      question_type: question.question_type,
      difficulty_level: question.difficulty_level,
      exam_year: question.exam_year,
      options: question.options || [],
      explanation: question.explanation || "",
      subject: question.subject,
      topic: question.topic,
      tags: question.tags || [],
      is_active: true,
      created_by: "",
      created_at: question.created_at,
      updated_at: question.created_at,
    };

    return (
      <div key={question.id} className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Question {((pagination.page - 1) * pagination.limit) + index + 1}
          </h3>
          <div className="flex gap-2">
            <Badge className={getDifficultyColor(question.difficulty_level)}>
              {question.difficulty_level}
            </Badge>
            <Badge variant="outline">{question.marks} marks</Badge>
          </div>
        </div>
        
        <QuestionEditor
          question={questionResponse}
          onSave={handleQuestionUpdate}
          onCancel={handleCancelEdit}
          onDelete={handleDeleteQuestion}
          isEditing={editingQuestionId === question.id}
          onEdit={() => handleEditQuestion(question.id)}
        />
      </div>
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
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        {pages}
        <Button
          variant="outline"
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {sectionDetails?.name || sectionName}
            </h1>
            {courseInfo && (
              <p className="text-gray-600 mt-2">
                {courseInfo.title} ({courseInfo.code})
              </p>
            )}
            {sectionDetails?.description && (
              <p className="text-gray-700 mt-2">{sectionDetails.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{pagination.total} questions</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Page {pagination.page} of {pagination.total_pages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Filter className="h-5 w-5 text-gray-600" />
            <div className="flex gap-4">
              <Select
                value={filters.difficulty || "all"}
                onValueChange={(value) => handleFilterChange("difficulty", value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.topic || "all"}
                onValueChange={(value) => handleFilterChange("topic", value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {/* Add more topics as needed */}
                </SelectContent>
              </Select>

              {(filters.difficulty || filters.topic) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ difficulty: "", topic: "" });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No questions found
            </h3>
            <p className="text-gray-600">
              {filters.difficulty || filters.topic
                ? "No questions match your current filters."
                : "No questions have been uploaded for this section yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {questions.map((question, index) => renderQuestion(question, index))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default SectionQuestionsPage;
