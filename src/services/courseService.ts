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

// Create course request interface
export interface CreateCourseRequest {
  title: string;
  code: string;
  category: string;
  sub_category: string;
  description: string;
  sections: string[];
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
}

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
