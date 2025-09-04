import api from '@/utils/api';

// Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number; // in hours
  price: number;
  isEnrolled: boolean;
  progress: number; // 0-100
  thumbnailUrl?: string;
  totalModules: number;
  completedModules: number;
  startDate?: string;
  endDate?: string;
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
    return response.data.data || [];
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
