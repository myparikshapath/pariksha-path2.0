export interface ExamInfoSection {
  id: string;
  header: string;
  content: string;
  order: number;
  is_active: boolean;
}

export interface ExamContent {
  exam_code: string;
  title: string;
  description: string;
  linked_course_id: string;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  exam_info_sections: ExamInfoSection[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getExamContentByCode(
  examCode: string
): Promise<ExamContent | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/exam-contents/${encodeURIComponent(examCode)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch exam content: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching exam content:", error);
    throw error;
  }
}

export async function getAllExamContents(): Promise<ExamContent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-contents/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch exam contents: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching exam contents:", error);
    throw error;
  }
}
