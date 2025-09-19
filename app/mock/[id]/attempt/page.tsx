"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSectionQuestions,
  fetchCourseBySlug,
  Question,
  SectionDetails as BaseSectionDetails,
  Course,
  getCourseSections,
} from "@/src/services/courseService";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

// Import components with no SSR
const SectionNavigation = dynamic(
  () => import("@/components/mock/SectionNavigation"),
  { ssr: false }
);

const QuestionDisplay = dynamic(
  () => import("@/components/mock/QuestionDisplay"),
  { ssr: false }
);

const TestControls = dynamic(() => import("@/components/mock/TestControls"), {
  ssr: false,
});

interface SectionDetails extends BaseSectionDetails {
  name: string;
  questions: Question[];
  loading: boolean;
  error: string | null;
  markedForReview: Set<string>; // Track questions marked for review by their IDs
}

export default function MockTestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [sections, setSections] = useState<SectionDetails[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [testStarted, setTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load course and sections data
  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course info
      const courseData = await fetchCourseBySlug(id as string);
      if (!courseData) throw new Error("Course not found");
      setCourseInfo(courseData);

      // Fetch sections
      const sectionsResponse = await getCourseSections(courseData.id);

      // Initialize sections state
      const initialSections = sectionsResponse.sections.map(
        (section) =>
          ({
            ...section,
            questions: [],
            loading: false,
            error: null,
            markedForReview: new Set<string>(),
          } as SectionDetails)
      );

      setSections(initialSections);

      // Load first section's questions
      if (initialSections.length > 0) {
        await loadSectionQuestions(initialSections[0].name, 0);
      }
    } catch (err) {
      console.error("Error loading course data:", err);
      setError("Failed to load test. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load questions for a section
  const loadSectionQuestions = async (
    sectionName: string,
    sectionIndex: number
  ) => {
    if (!courseInfo) return;

    try {
      setSections((prev) => {
        const updated = [...prev];
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          loading: true,
          error: null,
        };
        return updated;
      });

      // Fetch questions for the section
      const response = await getSectionQuestions(
        courseInfo.id,
        sectionName,
        1, // page
        100, // limit - adjust based on your needs
        undefined,
        undefined,
        "mock"
      );

      setSections((prev) => {
        const updated = [...prev];
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          questions: response.questions,
          loading: false,
          error: null,
          markedForReview: updated[sectionIndex]?.markedForReview || new Set(),
        };
        return updated;
      });
    } catch (err) {
      console.error(`Error loading questions for section ${sectionName}:`, err);
      setSections((prev) => {
        const updated = [...prev];
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          loading: false,
          error: "Failed to load questions",
        };
        return updated;
      });
    }
  };

  // Handle starting the test
  const handleStartTest = () => {
    setTestStarted(true);
    // Start timer logic will go here
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // Handle navigation between sections
  const handleSectionChange = (index: number) => {
    setCurrentSectionIndex(index);
    setCurrentQuestionIndex(0);

    // Load questions if not already loaded
    const section = sections[index];
    if (section && section.questions.length === 0 && !section.loading) {
      loadSectionQuestions(section.name, index);
    }
  };

  // Handle marking question for review
  const handleToggleMarkForReview = () => {
    if (!currentQuestion) return;

    setSections((prev) => {
      const updated = [...prev];
      const section = updated[currentSectionIndex];
      const markedForReview = new Set(section.markedForReview);

      if (markedForReview.has(currentQuestion.id)) {
        markedForReview.delete(currentQuestion.id);
      } else {
        markedForReview.add(currentQuestion.id);
      }

      updated[currentSectionIndex] = {
        ...section,
        markedForReview,
      };

      return updated;
    });
  };

  // Calculate answered counts for each section
  const answeredCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};

    sections.forEach((section) => {
      const answered = section.questions.filter(
        (q) => selectedAnswers[q.id] !== undefined
      ).length;
      counts[section.name] = answered;
    });

    return counts;
  }, [sections, selectedAnswers]);

  // Get current section and question
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const isMarkedForReview =
    currentSection?.markedForReview?.has(currentQuestion?.id || "") || false;

  // Check if current question is the first or last in the section
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestionInSection =
    currentQuestionIndex === (currentSection?.questions.length || 1) - 1;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Handle navigation between questions
  const handleQuestionNavigation = (direction: "prev" | "next") => {
    const currentSection = sections[currentSectionIndex];
    if (!currentSection) return;

    if (direction === "prev") {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (currentSectionIndex > 0) {
        // Move to previous section's last question
        const prevSection = sections[currentSectionIndex - 1];
        if (prevSection && prevSection.questions.length > 0) {
          setCurrentSectionIndex(currentSectionIndex - 1);
          setCurrentQuestionIndex(prevSection.questions.length - 1);
        }
      }
    } else {
      // next
      if (currentQuestionIndex < currentSection.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentSectionIndex < sections.length - 1) {
        // Move to next section's first question
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      }
    }
  };

  // Load course data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await loadCourseData();

      // If we have sections but no questions loaded yet, load questions for the first section
      if (
        sections.length > 0 &&
        (!sections[0]?.questions || sections[0].questions.length === 0)
      ) {
        await loadSectionQuestions(sections[0].name, 0);
      }
    };

    loadInitialData();
  }, [loadCourseData, sections.length]);

  // Persist answers and review marks in sessionStorage
  useEffect(() => {
    if (!courseInfo || sections.length === 0) return;
    const key = `mock_state_${courseInfo.id}`;
    try {
      const state = {
        selectedAnswers,
        markedBySection: sections.reduce<Record<string, string[]>>((acc, sec) => {
          acc[sec.name] = Array.from(sec.markedForReview || new Set<string>());
          return acc;
        }, {}),
        currentSectionIndex,
        currentQuestionIndex,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.error("Failed to persist mock state", e);
    }
  }, [courseInfo, sections, selectedAnswers, currentSectionIndex, currentQuestionIndex]);

  // Restore persisted state after sections/questions are available
  useEffect(() => {
    if (!courseInfo || sections.length === 0 || !testStarted) return;
    const key = `mock_state_${courseInfo.id}`;
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
      if (typeof parsed?.currentSectionIndex === "number")
        setCurrentSectionIndex(parsed.currentSectionIndex);
      if (typeof parsed?.currentQuestionIndex === "number")
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
      if (parsed?.markedBySection) {
        setSections((prev) =>
          prev.map((sec) => ({
            ...sec,
            markedForReview: new Set<string>(parsed.markedBySection[sec.name] || []),
          }))
        );
      }
    } catch (e) {
      console.error("Failed to restore mock state", e);
    }
  }, [courseInfo, sections.length, testStarted]);

  // Timer effect
  useEffect(() => {
    if (!testStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time's up
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted]);

  // Prevent accidental navigation while test is active
  useEffect(() => {
    if (!testStarted) return;

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress may be lost.";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [testStarted]);

  // Submit test
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    if (!courseInfo) return;

    try {
      setIsSubmitting(true);

      // Prepare payload
      const markedForReviewAll = sections.reduce<string[]>((acc, sec) => {
        if (sec.markedForReview) {
          sec.markedForReview.forEach((id) => acc.push(id));
        }
        return acc;
      }, []);

      const answers = Object.entries(selectedAnswers).map(([qid, ans]) => ({
        question_id: qid,
        // prefer order if we can infer, else send text; backend supports either
        selected_option_text: ans,
      }));

      console.log("DEBUG: Submitting answers:", {
        courseId: courseInfo.id,
        answersCount: answers.length,
        answers: answers.slice(0, 3), // Show first 3 for debugging
        timeSpent: 3600 - timeRemaining,
        markedForReview: markedForReviewAll.length
      });

      const res = await fetch(`http://localhost:8000/api/v1/courses/${courseInfo.id}/mock/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`
        },
        body: JSON.stringify({
          answers,
          time_spent_seconds: 3600 - timeRemaining,
          marked_for_review: markedForReviewAll,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Submit error details:", {
          status: res.status,
          statusText: res.statusText,
          body: errorText
        });
        throw new Error(`Failed to submit test: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Persist results for results page
      const key = `mock_results_${courseInfo.id}`;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(data.results));
      }

      // Navigate to results page
      router.push(`/mock/${id}/attempt/result`);
    } catch (err) {
      console.error("Submit error", err);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [courseInfo, id, isSubmitting, sections, selectedAnswers, timeRemaining, router]);

  // Manual submit with confirmation
  const handleManualSubmit = useCallback(() => {
    const ok = window.confirm("Submit the test? You won't be able to change answers after submission.");
    if (!ok) return;
    void handleSubmitTest();
  }, [handleSubmitTest]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Test</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => router.push("/mock")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  // Test instructions screen
  if (!testStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">
            {courseInfo?.title} - Mock Test
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Instructions</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Total Duration: 60 minutes</li>
              <li>
                Total Questions:{" "}
                {sections.reduce(
                  (sum, sec) => sum + (sec.question_count || 0),
                  0
                )}
              </li>
              <li>All questions are compulsory</li>
              <li>Each question carries equal marks</li>
              <li>No negative marking</li>
              <li>
                You can navigate between questions using the navigation buttons
              </li>
              <li>
                You can mark questions for review and come back to them later
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium">{section.name}</h3>
                  <p className="text-sm text-gray-600">
                    {section.question_count} questions •{" "}
                    {Math.floor(section.question_count * 0.5)} min
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleStartTest}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
            >
              Start Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total questions and answered count
  const totalQuestions = sections.reduce(
    (sum, sec) => sum + sec.questions.length,
    0
  );
  const answeredCount = Object.keys(selectedAnswers).length;

  // Format time remaining
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-lg font-semibold line-clamp-1">
                {courseInfo?.title}
              </h1>
              {currentSection && (
                <p className="text-sm text-gray-500">
                  Section {currentSectionIndex + 1} of {sections.length}:{" "}
                  {currentSection.name}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Time Remaining
              </div>
              <div
                className={`text-lg font-bold ${
                  timeRemaining <= 300 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {timeString}
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          {sections.length > 0 && (
            <SectionNavigation
              sections={sections}
              currentSectionIndex={currentSectionIndex}
              onSectionChange={handleSectionChange}
              answeredCounts={answeredCounts}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {currentSection?.loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading questions...</span>
          </div>
        ) : currentSection?.error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{currentSection.error}</p>
              </div>
            </div>
          </div>
        ) : currentQuestion ? (
          <>
            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion.id] || null}
              onAnswerSelect={handleAnswerSelect}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={currentSection.questions.length}
              isMarkedForReview={isMarkedForReview}
              onToggleMarkForReview={handleToggleMarkForReview}
              className="mb-6"
            />

            <TestControls
              onPrevious={() => handleQuestionNavigation("prev")}
              onNext={() => handleQuestionNavigation("next")}
              onSubmit={handleManualSubmit}
              isFirstQuestion={isFirstQuestion && currentSectionIndex === 0}
              isLastQuestion={isLastQuestionInSection && isLastSection}
              isMarkedForReview={isMarkedForReview}
              onToggleMarkForReview={handleToggleMarkForReview}
            />
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">
              No questions available in this section.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Answered: <span className="font-medium">{answeredCount}</span> /{" "}
              {totalQuestions}
            </div>
            <Button
              variant="destructive"
              size="sm"
              // onClick={handleSubmitTest}
              className="w-full sm:w-auto"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
