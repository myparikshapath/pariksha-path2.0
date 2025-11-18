import api from "@/utils/api";
import type { AxiosError } from "axios";
import { get as cachedGet } from "@/utils/request";

// Question option interface with images
export interface QuestionOption {
  text: string;
  is_correct: boolean;
  order: number;
  image_urls: string[];
}

// Question management interfaces
export interface QuestionUpdateRequest {
  title?: string;
  question_text?: string;
  question_type?: string;
  difficulty_level?: string;
  exam_year?: number;
  options?: QuestionOption[];
  explanation?: string;
  remarks?: string;
  subject?: string;
  topic?: string;
  tags?: string[];
  is_active?: boolean;
  question_image_urls?: string[];
  explanation_image_urls?: string[];
  remarks_image_urls?: string[];
}

export interface QuestionResponse {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  exam_year?: number;
  options: QuestionOption[];
  explanation?: string;
  remarks?: string;
  subject: string;
  topic: string;
  tags: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  question_image_urls: string[];
  explanation_image_urls: string[];
  remarks_image_urls: string[];
}

// Types for section questions
export interface Question {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  exam_year?: number;
  options: QuestionOption[];
  explanation?: string;
  remarks?: string;
  subject: string;
  topic: string;
  tags: string[];
  marks: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  created_by: string;
  question_image_urls: string[];
  explanation_image_urls: string[];
  remarks_image_urls: string[];
}

export interface SectionQuestionsResponse {
  message: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
  section: string;
  questions: Question[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface SectionDetails {
  name: string;
  description?: string;
  question_count: number;
  order: number;
}

export interface SectionDetailsResponse {
  message: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
  section: SectionDetails;
}

export type Section = {
  name: string;
  description?: string;
  order: number;
  question_count: number;
  is_active: boolean;
};

// Course interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  sections?: Section[];
  price: number;
  is_free: boolean;
  code?: string;
  discount_percent?: number;
  validity_period_days?: number;
  mock_test_timer_seconds?: number;
  material_ids?: string[];
  test_series_ids?: string[];
  icon_url?: string;
  priority_order?: number;
  banner_url?: string;
  tagline?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCourseRequest {
  title: string;
  code: string;
  category:
    | "medical"
    | "engineering"
    | "teaching"
    | "govt_exams"
    | "banking"
    | "defence"
    | "state_exams";
  sub_category: string;
  description: string;
  price: number;
  is_free: boolean;
  discount_percent?: number;
  validity_period_days?: number;
  mock_test_timer_seconds?: number;
  material_ids?: string[];
  test_series_ids?: string[];
  icon_url?: string;
  priority_order?: number;
  banner_url?: string;
  tagline?: string;
  sections: string[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  sections?: string[];
  price?: number;
  is_free?: boolean;
  discount_percent?: number;
  validity_period_days?: number;
  mock_test_timer_seconds?: number;
  material_ids?: string[];
  test_series_ids?: string[];
  icon_url?: string;
  priority_order?: number;
  banner_url?: string;
  tagline?: string;
  is_active?: boolean;
}

export interface CourseListPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CourseListResult {
  message: string;
  courses: Course[];
  pagination: CourseListPagination;
}

export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  is_active?: boolean;
  category?: Course["category"];
  show_all?: boolean;
}

export interface CourseSummary {
  total: number;
  active: number;
  inactive: number;
  last_updated_at?: string | null;
}

export interface ToggleCourseVisibilityResponse {
  message: string;
  course: Pick<Course, "id" | "title" | "is_active">;
}

interface QuestionChanges {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

interface DeletedQuestion extends QuestionResponse {
  deleted_at: string;
}

// API Functions

// Course functions
export const fetchEnrolledCourses = async (): Promise<Course[]> => {
  try {
    const response = await cachedGet<{ courses?: Course[]; data?: Course[] }>(
      "/courses/enrolled",
      undefined,
      { ttlMs: 5 * 60 * 1000 }
    );
    return response.courses ?? response.data ?? [];
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
};

export const fetchAvailableCourses = async (): Promise<Course[]> => {
  try {
    const response = await cachedGet<{ data?: Course[]; courses?: Course[] }>(
      "/courses",
      { limit: 200 },
      { ttlMs: 5 * 60 * 1000 }
    );
    // Handle both response formats
    const coursesData = response.data ?? response.courses ?? [];
    return Array.isArray(coursesData) ? coursesData : [];
  } catch (error) {
    console.error("Error fetching available courses:", error);
    throw error;
  }
};

export const fetchCoursesAdmin = async (
  params: CourseListParams = {}
): Promise<CourseListResult> => {
  try {
    const queryParams = {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      search: params.search,
      sort_by: params.sort_by ?? "updated_at",
      sort_order: params.sort_order ?? "desc",
      is_active: params.is_active,
      category: params.category,
      show_all: params.show_all ?? true,
    };

    const response = await api.get("/courses", {
      params: queryParams,
    });

    const rawData = response.data ?? {};
    const coursesData: Course[] = Array.isArray(rawData.data)
      ? rawData.data
      : Array.isArray(rawData.courses)
      ? rawData.courses
      : [];

    const paginationSource = rawData.pagination ?? {};
    const total = paginationSource.total ?? coursesData.length;
    const limit = paginationSource.limit ?? queryParams.limit;

    return {
      message: rawData.message ?? "Courses retrieved successfully",
      courses: coursesData,
      pagination: {
        total,
        page: paginationSource.page ?? queryParams.page,
        limit,
        total_pages:
          paginationSource.total_pages ?? Math.max(1, Math.ceil(total / limit)),
      },
    };
  } catch (error) {
    console.error("Error fetching admin courses:", error);
    throw error;
  }
};

export const enrollInCourse = async (courseId: string): Promise<void> => {
  try {
    await api.post(`/courses/${courseId}/enroll`);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
};

export const getCourseDetails = async (courseId: string): Promise<Course> => {
  try {
    const response = await cachedGet<{ course?: Course } | Course>(
      `/courses/${courseId}`,
      undefined,
      { ttlMs: 5 * 60 * 1000 }
    );
    console.log(response);
    if (typeof response === "object" && response !== null && "course" in response) {
      const r = response as { course?: Course };
      return (r.course as Course) ?? ({} as Course);
    }
    return response as Course;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};

// 👇 New function (simple alias, same pattern as getCourseDetails)
export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await cachedGet<{ course: Course }>(
      `/courses/${courseId}`,
      undefined,
      { ttlMs: 5 * 60 * 1000 }
    );
    return response.course;
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
};

const slugify = (value: string): string =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const courseCache = new Map<string, Course>();
let cachedCourseList: Course[] | null = null;
let courseListPromise: Promise<Course[]> | null = null;

const registerCourseInCache = (
  course: Course | null | undefined,
  alias?: string
) => {
  if (!course) return;

  const keys = new Set<string>();
  if (course.id) {
    keys.add(course.id.toLowerCase());
  }
  if (course.code) {
    keys.add(slugify(course.code));
  }
  if ((course as { slug?: string }).slug) {
    keys.add(slugify((course as unknown as { slug: string }).slug));
  }
  if (alias) {
    keys.add(slugify(alias));
    keys.add(alias.toLowerCase());
  }

  keys.forEach((key) => {
    if (key) {
      courseCache.set(key, course);
    }
  });
};

const ensureCoursesLoaded = async (): Promise<Course[]> => {
  if (cachedCourseList) {
    return cachedCourseList;
  }

  if (!courseListPromise) {
    courseListPromise = fetchAvailableCourses()
      .then((courses) => {
        cachedCourseList = courses;
        return courses;
      })
      .catch((error) => {
        courseListPromise = null;
        console.error("Error preloading courses:", error);
        return [];
      });
  }

  const courses = await courseListPromise;
  courseListPromise = null;
  cachedCourseList = courses;
  return courses;
};

const isNotFoundError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return Boolean(axiosError?.response?.status === 404);
};

export const fetchCourseBySlug = async (
  slug: string
): Promise<Course | null> => {
  const normalizedSlug = slugify(slug) || slug.toLowerCase();
  if (normalizedSlug && courseCache.has(normalizedSlug)) {
    return courseCache.get(normalizedSlug) ?? null;
  }

  // Try direct lookup assuming slug might be the course ID
  try {
    const response = await api.get(`/courses/${slug}`);
    const course = response.data.course || response.data;
    if (course) {
      registerCourseInCache(course, slug);
      return course;
    }
  } catch (error) {
    if (!isNotFoundError(error)) {
      console.warn("Direct course lookup by slug failed:", error);
    }
  }

  // Fallback to cached course list
  const courses = await ensureCoursesLoaded();
  courses.forEach((course) => registerCourseInCache(course));

  if (normalizedSlug && courseCache.has(normalizedSlug)) {
    return courseCache.get(normalizedSlug) ?? null;
  }

  // Final attempt: match against raw ID without slugifying
  if (slug && courseCache.has(slug.toLowerCase())) {
    return courseCache.get(slug.toLowerCase()) ?? null;
  }

  return null;
};

export const createCourse = async (
  courseData: CreateCourseRequest
): Promise<{ course_id: string }> => {
  try {
    const response = await api.post("/courses", courseData);
    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const updateCourse = async (
  courseId: string,
  courseData: UpdateCourseRequest
): Promise<{ message: string; course_id: string }> => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (
  courseId: string
): Promise<{ message: string; course_id: string }> => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export const toggleCourseVisibility = async (
  courseId: string
): Promise<ToggleCourseVisibilityResponse> => {
  try {
    const response = await api.put(`/courses/${courseId}/toggle-visibility`);
    return response.data;
  } catch (error) {
    console.error("Error toggling course visibility:", error);
    throw error;
  }
};

export const getCourseSummary = async (): Promise<CourseSummary> => {
  try {
    const response = await api.get("/courses/summary");
    return response.data.data ?? response.data;
  } catch (error) {
    console.error("Error fetching course summary:", error);
    throw error;
  }
};

// Section management functions
export const addSectionToCourse = async (
  courseId: string,
  sectionName: string,
  questionCount: number = 10
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/courses/${courseId}/sections`, {
      section_name: sectionName,
      question_count: questionCount,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding section:", error);
    throw error;
  }
};

export const updateSectionInCourse = async (
  courseId: string,
  oldSectionName: string,
  newSectionName: string
): Promise<{ message: string }> => {
  try {
    const response = await api.put(
      `/courses/${courseId}/sections/${encodeURIComponent(oldSectionName)}`,
      {
        new_section_name: newSectionName,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const deleteSectionFromCourse = async (
  courseId: string,
  sectionName: string
): Promise<{ message: string }> => {
  try {
    console.log("🔍 deleteSectionFromCourse called with:", {
      courseId,
      sectionName,
      sectionNameLength: sectionName.length,
      sectionNameType: typeof sectionName,
    });

    const response = await api.delete(
      `/courses/${courseId}/sections/${encodeURIComponent(sectionName)}`
    );

    console.log("✅ deleteSectionFromCourse success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ deleteSectionFromCourse error:", error);
    console.error("❌ Section name being deleted:", sectionName);
    throw error;
  }
};

// Question management functions
export const getSectionQuestions = async (
  courseId: string,
  sectionName: string,
  page: number = 1,
  limit: number = 10,
  difficulty?: string,
  topic?: string,
  mode?: string
): Promise<SectionQuestionsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (difficulty) params.append("difficulty", difficulty);
    if (topic) params.append("topic", topic);
    if (mode) params.append("mode", mode);

    // Log the API call for debugging
    console.log(`Fetching questions for ${sectionName} with params:`, {
      courseId,
      sectionName: encodeURIComponent(sectionName),
      params: params.toString(),
      mode,
      limit,
    });

    // Make sure section name is properly encoded
    const encodedSectionName = encodeURIComponent(sectionName);

    const response = await api.get(
      `/courses/${courseId}/sections/${encodedSectionName}/questions?${params}`,
      {
        headers: {
          // Add extra headers for CORS requests
          Accept: "application/json",
        },
        // Increase timeout for potentially slow requests
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching section questions:", error);
    throw error;
  }
};

export const getSectionDetails = async (
  courseId: string,
  sectionName: string
): Promise<SectionDetailsResponse> => {
  try {
    const response = await api.get(
      `/courses/${courseId}/sections/${encodeURIComponent(sectionName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching section details:", error);
    throw error;
  }
};

export const getCourseSections = async (
  courseId: string
): Promise<{
  message: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
  sections: SectionDetails[];
}> => {
  try {
    const response = await cachedGet<{
      message: string;
      course: { id: string; title: string; code: string };
      sections: SectionDetails[];
    }>(
      `/courses/${courseId}/sections`,
      undefined,
      { ttlMs: 60 * 1000 }
    );
    return response;
  } catch (error) {
    console.error("Error fetching course sections:", error);
    throw error;
  }
};

export const getQuestion = async (
  questionId: string
): Promise<QuestionResponse> => {
  try {
    const response = await api.get(`/admin/questions/${questionId}`);
    return response.data.question;
  } catch (error) {
    console.error("Error fetching question details:", error);
    throw error;
  }
};

export const updateQuestion = async (
  questionId: string,
  questionData: QuestionUpdateRequest
): Promise<{
  message: string;
  question_id: string;
  changes: QuestionChanges[];
}> => {
  try {
    const response = await api.put(
      `/admin/questions/${questionId}`,
      questionData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (
  questionId: string
): Promise<{
  message: string;
  question_id: string;
  deleted_question: DeletedQuestion;
}> => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// changes made my manpreeet

export async function updateSectionQuestionCount(
  courseId: string,
  sectionName: string,
  newCount: string
) {
  try {
    const response = await api.put(
      `/courses/${courseId}/sections/${encodeURIComponent(
        sectionName
      )}/question-count`,
      {
        new_count: parseInt(newCount, 10),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating section question count:", error);
    throw error; // rethrow so caller can handle it (UI me error message dikhane ke liye)
  }
}

// another change by manpreet
