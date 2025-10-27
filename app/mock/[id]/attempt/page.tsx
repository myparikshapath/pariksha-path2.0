"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { AxiosError } from "axios";
import { useParams } from "next/navigation";
import {
  getSectionQuestions,
  fetchCourseBySlug,
  getCourseById,
  Question,
  SectionDetails as BaseSectionDetails,
  Course,
  getCourseSections,
} from "@/src/services/courseService";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Loader2, TimerReset } from "lucide-react";
import dynamic from "next/dynamic";
import QuestionPalette from "@/components/mock/QuestionPalette";

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
  const [timeRemaining, setTimeRemaining] = useState(0); // Timer will be set from course data
  const [initialTimerSeconds, setInitialTimerSeconds] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submitRef = useRef<(() => Promise<void> | void) | null>(null);

  // Load course and sections data

  // Load questions for a section
  const loadSectionQuestions = useCallback(
    async (sectionName: string, sectionIndex: number) => {
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

        // Get the section to access question_count
        const section = sections[sectionIndex];
        const questionLimit = section?.question_count || 0;

        // If no question limit is set, don't fetch any questions
        if (questionLimit <= 0) {
          setSections((prev) => {
            const updated = [...prev];
            updated[sectionIndex] = {
              ...updated[sectionIndex],
              questions: [],
              loading: false,
              error: null,
              markedForReview:
                updated[sectionIndex]?.markedForReview || new Set(),
            };
            return updated;
          });
          return;
        }

        // Fetch questions for the section with the specified limit
        const response = await getSectionQuestions(
          courseInfo.id,
          sectionName,
          1, // page
          questionLimit, // Use the question_count as the limit
          undefined,
          undefined,
          "mock"
        );

        // Add more detailed logging for debugging
        if (!response.questions || response.questions.length === 0) {
          console.warn(
            `No questions returned for section ${sectionName}. API response:`,
            JSON.stringify(response)
          );
        }

        // Shuffle questions to get random ones each time
        const shuffledQuestions = [...response.questions].sort(
          () => Math.random() - 0.5
        );

        // Take only the number of questions specified by question_count
        const limitedQuestions = shuffledQuestions.slice(0, questionLimit);

        setSections((prev) => {
          const updated = [...prev];
          updated[sectionIndex] = {
            ...updated[sectionIndex],
            questions: limitedQuestions,
            loading: false,
            error: null,
            markedForReview:
              updated[sectionIndex]?.markedForReview || new Set(),
          };
          return updated;
        });
      } catch (err) {
        console.error(
          `Error loading questions for section ${sectionName}:`,
          err
        );
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
    },
    [courseInfo, sections] // Added sections dependency to fix stale closure issue
  );

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course info
      let courseData: Course | null = null;

      if (typeof id === "string") {
        try {
          courseData = await getCourseById(id);
        } catch (err) {
          const axiosError = err as AxiosError;
          if (axiosError?.response?.status !== 404) {
            console.warn("Direct course lookup by ID failed:", err);
          }
        }
      }

      if (!courseData) {
        courseData = await fetchCourseBySlug(id as string);
      }

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

      // Load first section's questions will happen in useEffect after sections are set
    } catch (err) {
      console.error("Error loading course data:", err);
      setError("Failed to load test. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [id]); // Keep id as the only dependency

  // Load all sections' questions
  const loadAllSections = useCallback(async () => {
    try {
      await Promise.all(
        sections.map((section, index) => {
          if (
            section.question_count &&
            section.question_count > 0 &&
            section.questions.length === 0 &&
            !section.loading
          ) {
            return loadSectionQuestions(section.name, index);
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      console.error("Error loading all sections:", error);
      setError("Failed to load all sections. Please try again.");
    }
  }, [sections, loadSectionQuestions]);

  // Handle starting the test
  const handleStartTest = async () => {
    const duration =
      initialTimerSeconds ?? courseInfo?.mock_test_timer_seconds ?? 3600;
    setInitialTimerSeconds(duration);
    setTimeRemaining(duration);
    setTestStarted(true);
    await loadAllSections();
    // Timer will be initialized by the useEffect that depends on testStarted and course timer
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;

    setSelectedAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [currentQuestion.id]: answer,
      };
      return newAnswers;
    });
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
      counts[section.name] = section.questions.filter(
        (q) => selectedAnswers[q.id] !== undefined
      ).length;
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
    };

    loadInitialData();
  }, [loadCourseData]);

  useEffect(() => {
    if (!courseInfo) return;

    const duration = courseInfo.mock_test_timer_seconds ?? 3600;
    setInitialTimerSeconds(duration);

    if (!testStarted) {
      setTimeRemaining(duration);
    }
  }, [courseInfo, courseInfo?.mock_test_timer_seconds, testStarted]);

  // Separate effect to load first section questions after sections are loaded
  useEffect(() => {
    // Prefetch questions for all sections before the test starts
    if (sections.length === 0 || testStarted) return;

    sections.forEach((section, index) => {
      if (
        (section.question_count || 0) > 0 &&
        section.questions.length === 0 &&
        !section.loading
      ) {
        void loadSectionQuestions(section.name, index);
      }
    });
  }, [sections, loadSectionQuestions, testStarted]);

  // Persist answers and review marks in sessionStorage
  useEffect(() => {
    if (!courseInfo || sections.length === 0) return;
    const key = `mock_state_${courseInfo.id}`;
    try {
      const state = {
        selectedAnswers,
        markedBySection: sections.reduce<Record<string, string[]>>(
          (acc, sec) => {
            acc[sec.name] = Array.from(
              sec.markedForReview || new Set<string>()
            );
            return acc;
          },
          {}
        ),
        currentSectionIndex,
        currentQuestionIndex,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.error("Failed to persist mock state", e);
    }
  }, [
    courseInfo,
    sections,
    selectedAnswers,
    currentSectionIndex,
    currentQuestionIndex,
  ]);

  // Restore persisted state after sections/questions are available
  useEffect(() => {
    if (!courseInfo || sections.length === 0 || !testStarted) return;
    const key = `mock_state_${courseInfo.id}`;
    try {
      const raw =
        typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
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
            markedForReview: new Set<string>(
              parsed.markedBySection[sec.name] || []
            ),
          }))
        );
      }
    } catch (e) {
      console.error("Failed to restore mock state", e);
    }
  }, [courseInfo, sections.length, testStarted]);

  // Prevent accidental navigation while test is active and cleanup timer
  useEffect(() => {
    if (!testStarted) {
      // Clean up timer if test is not started
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave? Your progress may be lost.";
    };

    window.addEventListener("beforeunload", beforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      // Don't clear the timer here as it's managed by the timer effect
    };
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

      // Get all question IDs from all sections
      const allQuestionIds = sections.flatMap((section) =>
        section.questions.map((question) => question.id)
      );

      // Format answers according to the expected schema - include ALL questions
      // even unanswered ones (with null selected_option_order)
      const answers = allQuestionIds.map((qid) => {
        const isAnswered =
          selectedAnswers[qid] !== undefined && selectedAnswers[qid] !== null;
        const rawAnswer = selectedAnswers[qid];
        const parsedAnswer = isAnswered ? parseInt(rawAnswer) : null;
        return {
          question_id: qid,
          selected_option_order: parsedAnswer,
        };
      });

      try {
        const totalDuration =
          initialTimerSeconds ?? courseInfo?.mock_test_timer_seconds ?? 3600;
        const elapsedSeconds = totalDuration - timeRemaining;
        const safeElapsedSeconds = Math.max(
          0,
          Math.min(totalDuration, Math.floor(elapsedSeconds))
        );

        const response = await api.post(
          `/courses/${courseInfo.id}/mock/submit`,
          {
            answers,
            time_spent_seconds: safeElapsedSeconds,
            marked_for_review: markedForReviewAll.map((id) => String(id)),
          }
        );

        // Get results from the response - note that backend nests data in a 'results' property
        const responseData = response.data;
        console.log("Submission successful:", responseData);

        // Extract the results object from the response
        const data = responseData.results || {};

        // Add default values for any missing fields to prevent "undefined" display
        const processedResults = {
          // Map field names from backend to what the results page expects
          percentage: data.percentage || 0,
          score: data.score || data.correct_answers || 0,
          max_score: data.max_score || data.total_questions || 0,
          accuracy: data.accuracy || 0,
          attempted_questions: data.attempted_questions || 0,
          total_questions: data.total_questions || 0,
          time_spent_seconds: data.time_spent_seconds || 0,

          // Ensure section summaries have the correct field structure
          section_summaries: (data.section_summaries || []).map(
            (summary: {
              section?: string;
              attempted?: number;
              total?: number;
              correct?: number;
              accuracy?: number;
            }) => ({
              section: summary.section || "",
              attempted: summary.attempted || 0,
              total: summary.total || 0,
              correct: summary.correct || 0,
              accuracy: summary.accuracy || 0,
            })
          ),

          // Use course data from the response if available, otherwise from courseInfo
          course: data.course || {
            title: courseInfo?.title || "Mock Test",
          },
        };

        // Persist results for results page
        // Use the URL parameter id to ensure consistency when retrieving on results page
        const key = `mock_results_${id}`;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(key, JSON.stringify(processedResults));
        }
      } catch (error: unknown) {
        console.error("Submit error details:", error);

        // Log more detailed error information
        if (
          error instanceof Error &&
          (error as { response?: { data?: unknown } }).response?.data
        ) {
          console.error(
            "Server error response:",
            (error as { response?: { data?: unknown } }).response!.data
          );
        }

        throw new Error(
          `Failed to submit test: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      // Navigate to results page
      window.location.href = `/mock/${id}/attempt/result`;
    } catch (err) {
      console.error("Submit error", err);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    courseInfo,
    id,
    initialTimerSeconds,
    isSubmitting,
    sections,
    selectedAnswers,
    timeRemaining,
  ]);

  useEffect(() => {
    submitRef.current = handleSubmitTest;
  }, [handleSubmitTest]);

  // Timer effect
  useEffect(() => {
    if (!testStarted || !initialTimerSeconds) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          submitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [initialTimerSeconds, testStarted]);

  // Manual submit with confirmation
  const handleManualSubmit = useCallback(() => {
    const ok = window.confirm(
      "Submit the test? You won't be able to change answers after submission."
    );
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
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    const totalQuestionsLoaded = sections.reduce(
      (sum, sec) => sum + (sec.questions?.length || 0),
      0
    );

    const totalQuestionsPlanned = sections.reduce(
      (sum, sec) => sum + (sec.question_count || 0),
      0
    );

    const totalQuestionsDisplay =
      totalQuestionsLoaded > 0 ? totalQuestionsLoaded : totalQuestionsPlanned;

    const hasLoadedCounts = totalQuestionsLoaded > 0;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Info className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {courseInfo?.title || "Mock Test"} – Overview
              </h1>
              <p className="text-sm text-gray-500">
                Review the information below before starting your attempt.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <TimerReset
                  className="h-4 w-4 text-blue-500"
                  aria-hidden="true"
                />
                Duration
              </h2>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {Math.floor((courseInfo?.mock_test_timer_seconds || 3600) / 60)}
                min
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Timer starts when you click "Start Test" and auto-submits when
                time runs out.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Total Questions
              </h2>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {totalQuestionsDisplay}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {hasLoadedCounts
                  ? "Based on the questions currently available across sections."
                  : "Each question carries equal weight. There is no negative marking."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Sections</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {sections.map((section) => {
                const plannedCount = section.question_count || 0;
                const loadedCount = section.questions.length;
                const displayCount = loadedCount || plannedCount;

                return (
                  <div
                    key={section.name}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                          {section.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {displayCount} question
                          {displayCount === 1 ? "" : "s"} loaded
                          {loadedCount && loadedCount !== plannedCount
                            ? ` (planned ${plannedCount})`
                            : loadedCount
                            ? ""
                            : plannedCount
                            ? ` planned`
                            : ""}
                        </p>
                      </div>
                      {section.loading ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                          <Loader2
                            className="h-3 w-3 animate-spin"
                            aria-hidden="true"
                          />
                          Loading
                        </span>
                      ) : loadedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                          Pending load
                        </span>
                      )}
                    </div>
                    {section.loading && (
                      <p className="mt-2 text-xs text-gray-500">
                        Fetching questions for this section. Please wait a
                        moment.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <ul className="list-disc space-y-2 pl-5">
              <li>All questions are compulsory.</li>
              <li>
                You can mark questions for review and revisit them via the
                palette.
              </li>
              <li>Your responses auto-save locally until you submit.</li>
              <li>
                The test auto-submits if the timer expires or you navigate away.
              </li>
            </ul>
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

  // Format time remaining
  const safeTimeRemaining = Math.max(0, timeRemaining);
  const hours = Math.floor(safeTimeRemaining / 3600);
  const minutes = Math.floor((safeTimeRemaining % 3600) / 60);
  const seconds = safeTimeRemaining % 60;
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Calculate progress percentage
  const totalQuestions = sections.reduce(
    (sum, sec) => sum + sec.questions.length,
    0
  );
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex-1">
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

            {/* Progress Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Time Remaining
              </div>
              <div
                className={`text-2xl font-bold transition-colors duration-300 ${
                  timeRemaining <= 300
                    ? "text-red-600 animate-pulse"
                    : timeRemaining <= 600
                    ? "text-orange-500"
                    : "text-gray-900"
                }`}
              >
                {timeString}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      {sections.length > 0 && (
        <SectionNavigation
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          onSectionChange={handleSectionChange}
          answeredCounts={answeredCounts}
          className="bg-white shadow-sm"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {currentSection?.loading ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="mt-3 text-sm text-gray-500">
                  Loading questions...
                </span>
              </div>
            ) : currentSection?.error ? (
              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{currentSection.error}</p>
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
          </div>

          <div className="space-y-6">
            <QuestionPalette
              sections={sections.map((section) => ({
                name: section.name,
                questions: section.questions,
                markedForReview: section.markedForReview,
                loading: section.loading,
              }))}
              currentSectionIndex={currentSectionIndex}
              currentQuestionIndex={currentQuestionIndex}
              selectedAnswers={selectedAnswers}
              onSelectQuestion={(sectionIndex, questionIndex) => {
                setCurrentSectionIndex(sectionIndex);
                setCurrentQuestionIndex(questionIndex);
              }}
              className="sticky top-24"
            />

            <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  Attempt Summary
                </span>
                <span>
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <span
                      className="h-2 w-2 rounded-full bg-green-500"
                      aria-hidden="true"
                    />
                    Answered
                  </span>
                  <span>{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <span
                      className="h-2 w-2 rounded-full bg-yellow-500"
                      aria-hidden="true"
                    />
                    Marked for review
                  </span>
                  <span>
                    {sections.reduce(
                      (sum, sec) => sum + (sec.markedForReview?.size || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <span
                      className="h-2 w-2 rounded-full bg-gray-300"
                      aria-hidden="true"
                    />
                    Not answered
                  </span>
                  <span>{totalQuestions - answeredCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>
                  Answered:{" "}
                  <span className="font-semibold text-gray-900">
                    {answeredCount}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>
                  Remaining:{" "}
                  <span className="font-semibold text-gray-900">
                    {totalQuestions - answeredCount}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={() => window.history.back()}
                className="px-6"
              >
                Exit Test
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="px-6 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Test"
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
