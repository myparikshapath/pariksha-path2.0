import api from '@/utils/api';

// Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  sections?: string[];
  price: number;
  is_free: boolean;
  code?: string;
  thumbnail_url?: string;
  discount_percent?: number;
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

// Fetch enrolled courses
export const fetchEnrolledCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get('/courses/enrolled');
    return response.data.courses || [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

// Fetch all available courses
export const fetchAvailableCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get('/courses/');
    console.log('API Response:', response.data);
    // Handle both response formats
    const coursesData = response.data.data || response.data.courses || [];
    return Array.isArray(coursesData) ? coursesData : [];
  } catch (error) {
    console.error('Error fetching available courses:', error);
    throw error;
  }
};

// Enroll in a course
export const enrollInCourse = async (courseId: string): Promise<void> => {
  try {
    await api.post(`/courses/${courseId}/enroll`);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

// Get course details
export const getCourseDetails = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.get(`/courses/${courseId}`);
    return response.data.course;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Get course by slug
export const fetchCourseBySlug = async (slug: string): Promise<Course | null> => {
  try {
    const courses = await fetchAvailableCourses();
    // Try to find by code first (slugified)
    const foundCourse = courses.find(course => {
      const courseSlug = course.code?.toLowerCase().replace(/\s+/g, '-') || course.id;
      return courseSlug === slug || course.id === slug;
    });
    return foundCourse || null;
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    throw error;
  }
};


// Create a new course
export const createCourse = async (courseData: CreateCourseRequest): Promise<{ course_id: string }> => {
  try {
    const response = await api.post('/courses/', courseData);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update course request interface
export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  sections?: string[];
  price?: number;
  is_free?: boolean;
  discount_percent?: number;
  material_ids?: string[];
  test_series_ids?: string[];
  thumbnail_url?: string;
  icon_url?: string;
  priority_order?: number;
  banner_url?: string;
  tagline?: string;
  is_active?: boolean;
}

// Update course
export const updateCourse = async (courseId: string, courseData: UpdateCourseRequest): Promise<{ message: string; course_id: string }> => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete course (soft delete)
export const deleteCourse = async (courseId: string): Promise<{ message: string; course_id: string }> => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Section management functions
export const addSectionToCourse = async (courseId: string, sectionName: string): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/courses/${courseId}/sections`, {
      section_name: sectionName
    });
    return response.data;
  } catch (error) {
    console.error('Error adding section:', error);
    throw error;
  }
};

export const updateSectionInCourse = async (courseId: string, oldSectionName: string, newSectionName: string): Promise<{ message: string }> => {
  try {
    const response = await api.put(`/courses/${courseId}/sections/${encodeURIComponent(oldSectionName)}`, {
      new_section_name: newSectionName
    });
    return response.data;
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
};

export const deleteSectionFromCourse = async (courseId: string, sectionName: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/courses/${courseId}/sections/${encodeURIComponent(sectionName)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
};

// Update the existing CreateCourseRequest interface
export interface CreateCourseRequest {
  title: string;
  code: string;
  category: 'medical' | 'engineering' | 'teaching' | 'govt_exams' | 'banking' | 'defence' | 'state_exams';
  sub_category: string;
  description: string;
  price: number;
  is_free: boolean;
  discount_percent?: number;
  material_ids?: string[];
  test_series_ids?: string[];
  thumbnail_url: string;
  icon_url?: string;
  priority_order?: number;
  banner_url?: string;
  tagline?: string;
  sections: string[];
}

// Types for section questions
export interface Question {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  options: Array<{
    text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
  subject: string;
  topic: string;
  tags: string[];
  marks: number;
  created_at: string;
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

// Get questions for a specific course section
export const getSectionQuestions = async (
  courseId: string,
  sectionName: string,
  page: number = 1,
  limit: number = 10,
  difficulty?: string,
  topic?: string
): Promise<SectionQuestionsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (difficulty) params.append('difficulty', difficulty);
    if (topic) params.append('topic', topic);

    const response = await api.get(
      `/courses/${courseId}/sections/${encodeURIComponent(sectionName)}/questions?${params}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching section questions:', error);
    throw error;
  }
};

// Get section details
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
    console.error('Error fetching section details:', error);
    throw error;
  }
};

// Get all sections for a course
export const getCourseSections = async (courseId: string): Promise<{
  message: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
  sections: SectionDetails[];
}> => {
  try {
    const response = await api.get(`/courses/${courseId}/sections`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course sections:', error);
    throw error;
  }
};

// Question management interfaces
export interface QuestionUpdateRequest {
  title?: string;
  question_text?: string;
  question_type?: string;
  difficulty_level?: string;
  exam_year?: number;
  options?: Array<{
    text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
  subject?: string;
  topic?: string;
  tags?: string[];
  is_active?: boolean;
}

export interface QuestionResponse {
  id: string;
  title: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  exam_year?: number;
  options: Array<{
    text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
  subject: string;
  topic: string;
  tags: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Get question details
export const getQuestion = async (questionId: string): Promise<QuestionResponse> => {
  try {
    const response = await api.get(`/admin/questions/${questionId}`);
    return response.data.question;
  } catch (error) {
    console.error('Error fetching question details:', error);
    throw error;
  }
};

// Update question
export const updateQuestion = async (
  questionId: string,
  questionData: QuestionUpdateRequest
): Promise<{ message: string; question_id: string; changes: any }> => {
  try {
    const response = await api.put(`/admin/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (
  questionId: string
): Promise<{ message: string; question_id: string; deleted_question: any }> => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
