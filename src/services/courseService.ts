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
}

// Fetch enrolled courses
export const fetchEnrolledCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get('/courses/enrolled');
    return response.data.data || [];
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
    return response.data.data;
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
