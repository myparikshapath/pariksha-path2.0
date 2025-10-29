import api from "@/utils/api";
import { QuestionOption } from "./courseService";

export interface MockHistoryAttemptQuestion {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  section?: string;
  options: QuestionOption[];
  explanation?: string;
  remarks?: string;
  subject: string;
  topic: string;
  tags?: string[];
  marks?: number;
  question_image_urls?: string[];
  explanation_image_urls?: string[];
  remarks_image_urls?: string[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface MockHistoryQuestionAttempt {
  question_id: string;
  selected_option_order: number | null;
  correct_option_order: number | null;
  is_correct: boolean;
  status: string;
  selected_options: string[];
  time_spent_seconds: number;
  marks_awarded: number;
  marks_available: number;
  negative_marks: number;
  question: MockHistoryAttemptQuestion;
}

export interface MockHistorySectionSummary {
  section: string;
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface MockHistoryAttemptDetails {
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
  section_summaries: MockHistorySectionSummary[];
  question_attempts: MockHistoryQuestionAttempt[];
}

export const getMockHistoryAttempt = async (
  attemptId: string
): Promise<MockHistoryAttemptDetails> => {
  try {
    const response = await api.get(`mock-history/${attemptId}`);
    return response.data.attempt as MockHistoryAttemptDetails;
  } catch (error) {
    console.error("Error fetching mock history attempt:", error);
    throw error;
  }
};
