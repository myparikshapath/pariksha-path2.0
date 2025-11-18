"use client";
import { create } from "zustand";
import api from "@/utils/api";

export type TestSection = {
  name: string;
  question_count: number;
  questions: { id: string }[];
  loading?: boolean;
  error?: string | null;
  markedForReview?: Set<string>;
};

type TestStatePerCourse = {
  sections: TestSection[];
  selectedAnswers: Record<string, string>; // questionId -> option order (string)
  currentSectionIndex: number;
  currentQuestionIndex: number;
  testStarted: boolean;
  timeRemaining: number; // seconds
  initialTimerSeconds: number | null;
  isSubmitting: boolean;
  intervalId?: number | null;
};

type TestsState = {
  byCourseId: Record<string, TestStatePerCourse>;
};

type SubmitArgs = {
  courseId: string;
  attemptKey: string; // used for results session key (e.g., route id)
  totalDuration: number; // seconds
};

type TestsActions = {
  init: (courseId: string, sections: TestSection[], initialTimer?: number | null) => void;
  setCourseState: (courseId: string, s: Partial<TestStatePerCourse>) => void;
  setAnswer: (courseId: string, questionId: string, value: string) => void;
  toggleReview: (courseId: string, sectionIndex: number, questionId: string) => void;
  setIndices: (courseId: string, sectionIndex: number, questionIndex: number) => void;
  startTest: (courseId: string, duration: number, onAutoSubmit: () => void) => void;
  stopTimer: (courseId: string) => void;
  submit: (args: SubmitArgs) => Promise<void>;
  persistSnapshot: (courseId: string) => void;
  restoreSnapshot: (courseId: string) => void;
};

export type TestsStore = TestsState & TestsActions;

const getKey = (courseId: string) => `mock_state_${courseId}`;

export const useTestsStore = create<TestsStore>((set, get) => ({
  byCourseId: {},

  init: (courseId, sections, initialTimer) => {
    set((st) => ({
      byCourseId: {
        ...st.byCourseId,
        [courseId]: {
          sections: sections.map((s) => ({
            ...s,
            markedForReview: s.markedForReview || new Set<string>(),
          })),
          selectedAnswers: {},
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
          testStarted: false,
          timeRemaining: initialTimer ?? 0,
          initialTimerSeconds: initialTimer ?? null,
          isSubmitting: false,
          intervalId: null,
        },
      },
    }));
  },

  setCourseState: (courseId, s) =>
    set((st) => ({ byCourseId: { ...st.byCourseId, [courseId]: { ...st.byCourseId[courseId], ...s } } })),

  setAnswer: (courseId, questionId, value) => {
    set((st) => {
      const cs = st.byCourseId[courseId];
      if (!cs) return st;
      const next = { ...cs.selectedAnswers, [questionId]: value };
      return {
        byCourseId: { ...st.byCourseId, [courseId]: { ...cs, selectedAnswers: next } },
      };
    });
  },

  toggleReview: (courseId, sectionIndex, questionId) => {
    set((st) => {
      const cs = st.byCourseId[courseId];
      if (!cs) return st;
      const sections = [...cs.sections];
      const sec = sections[sectionIndex];
      if (!sec) return st;
      const setMark = new Set<string>(sec.markedForReview || []);
      if (setMark.has(questionId)) setMark.delete(questionId);
      else setMark.add(questionId);
      sections[sectionIndex] = { ...sec, markedForReview: setMark };
      return { byCourseId: { ...st.byCourseId, [courseId]: { ...cs, sections } } };
    });
  },

  setIndices: (courseId, sectionIndex, questionIndex) =>
    set((st) => {
      const cs = st.byCourseId[courseId];
      if (!cs) return st;
      return {
        byCourseId: {
          ...st.byCourseId,
          [courseId]: { ...cs, currentSectionIndex: sectionIndex, currentQuestionIndex: questionIndex },
        },
      };
    }),

  startTest: (courseId, duration, onAutoSubmit) => {
    const cs = get().byCourseId[courseId];
    if (!cs) return;
    // Clear old
    if (cs.intervalId) {
      clearInterval(cs.intervalId);
    }
    const intervalId = window.setInterval(() => {
      const cur = get().byCourseId[courseId];
      if (!cur) return;
      const next = Math.max(0, (cur.timeRemaining ?? duration) - 1);
      // Update time
      set((st) => ({
        byCourseId: {
          ...st.byCourseId,
          [courseId]: { ...cur, timeRemaining: next },
        },
      }));
      if (next <= 0) {
        // stop and autosubmit
        clearInterval(intervalId);
        set((st) => ({
          byCourseId: { ...st.byCourseId, [courseId]: { ...cur, intervalId: null } },
        }));
        onAutoSubmit();
      }
    }, 1000);

    set((st) => ({
      byCourseId: {
        ...st.byCourseId,
        [courseId]: {
          ...cs,
          testStarted: true,
          initialTimerSeconds: duration,
          timeRemaining: duration,
          intervalId,
        },
      },
    }));
  },

  stopTimer: (courseId) =>
    set((st) => {
      const cs = st.byCourseId[courseId];
      if (!cs) return st;
      if (cs.intervalId) clearInterval(cs.intervalId);
      return { byCourseId: { ...st.byCourseId, [courseId]: { ...cs, intervalId: null } } };
    }),

  submit: async ({ courseId, attemptKey, totalDuration }) => {
    const cs = get().byCourseId[courseId];
    if (!cs || cs.isSubmitting) return;
    try {
      set((st) => ({ byCourseId: { ...st.byCourseId, [courseId]: { ...cs, isSubmitting: true } } }));

      const markedForReviewAll = cs.sections.reduce<string[]>((acc, sec) => {
        (sec.markedForReview || new Set<string>()).forEach((id) => acc.push(id));
        return acc;
      }, []);

      const allQuestionIds = cs.sections.flatMap((section) =>
        (section.questions || []).map((q) => q.id)
      );

      const answers = allQuestionIds.map((qid) => {
        const isAnswered = cs.selectedAnswers[qid] !== undefined && cs.selectedAnswers[qid] !== null;
        const raw = cs.selectedAnswers[qid];
        const parsed = isAnswered ? parseInt(raw) : null;
        return { question_id: qid, selected_option_order: parsed };
      });

      const elapsedSeconds = totalDuration - (cs.timeRemaining ?? 0);
      const safeElapsedSeconds = Math.max(0, Math.min(totalDuration, Math.floor(elapsedSeconds)));

      const response = await api.post(`/courses/${courseId}/mock/submit`, {
        answers,
        time_spent_seconds: safeElapsedSeconds,
        marked_for_review: markedForReviewAll.map((id) => String(id)),
      });

      const responseData = response.data;
      const data = responseData.results || {};
      const processedResults = {
        percentage: data.percentage || 0,
        score: data.score || data.correct_answers || 0,
        max_score: data.max_score || data.total_questions || 0,
        accuracy: data.accuracy || 0,
        attempted_questions: data.attempted_questions || 0,
        total_questions: data.total_questions || 0,
        time_spent_seconds: data.time_spent_seconds || 0,
        negative_deductions: data.negative_deductions || 0,
        section_summaries: (data.section_summaries || []).map((summary: any) => ({
          section: summary.section || "",
          attempted: summary.attempted || 0,
          total: summary.total || 0,
          correct: summary.correct || 0,
          accuracy: summary.accuracy || 0,
        })),
        course: data.course || {},
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`mock_results_${attemptKey}`, JSON.stringify(processedResults));
      }
    } finally {
      set((st) => ({ byCourseId: { ...st.byCourseId, [courseId]: { ...st.byCourseId[courseId], isSubmitting: false } } }));
    }
  },

  persistSnapshot: (courseId) => {
    const cs = get().byCourseId[courseId];
    if (!cs) return;
    const payload = {
      selectedAnswers: cs.selectedAnswers,
      markedBySection: Object.fromEntries(
        cs.sections.map((s) => [s.name, Array.from(s.markedForReview || new Set<string>())])
      ),
      currentSectionIndex: cs.currentSectionIndex,
      currentQuestionIndex: cs.currentQuestionIndex,
      timeRemaining: cs.timeRemaining,
      initialTimerSeconds: cs.initialTimerSeconds,
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem(getKey(courseId), JSON.stringify(payload));
    }
  },

  restoreSnapshot: (courseId) => {
    const cs = get().byCourseId[courseId];
    if (!cs) return;
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(getKey(courseId)) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const sections = cs.sections.map((sec) => ({
        ...sec,
        markedForReview: new Set<string>((parsed.markedBySection?.[sec.name] as string[]) || []),
      }));
      set((st) => ({
        byCourseId: {
          ...st.byCourseId,
          [courseId]: {
            ...cs,
            sections,
            selectedAnswers: parsed.selectedAnswers || cs.selectedAnswers,
            currentSectionIndex: typeof parsed.currentSectionIndex === "number" ? parsed.currentSectionIndex : cs.currentSectionIndex,
            currentQuestionIndex: typeof parsed.currentQuestionIndex === "number" ? parsed.currentQuestionIndex : cs.currentQuestionIndex,
            timeRemaining: typeof parsed.timeRemaining === "number" ? parsed.timeRemaining : cs.timeRemaining,
            initialTimerSeconds: typeof parsed.initialTimerSeconds === "number" ? parsed.initialTimerSeconds : cs.initialTimerSeconds,
          },
        },
      }));
    } catch (e) {
      // ignore
    }
  },
}));
