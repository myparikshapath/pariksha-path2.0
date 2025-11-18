"use client";
import { create } from "zustand";
import type { Course } from "@/src/services/courseService";
import { fetchAvailableCourses, fetchEnrolledCourses, getCourseDetails } from "@/src/services/courseService";

type CoursesState = {
  byId: Record<string, Course>;
  allIds: string[];
  enrolledIds: string[];
  loading: boolean;
  lastFetchedAt?: number;
};

type CoursesActions = {
  setState: (s: Partial<CoursesState>) => void;
  fetchAll: () => Promise<void>;
  fetchEnrolled: () => Promise<void>;
  getById: (id: string) => Promise<Course | null>;
};

export type CoursesStore = CoursesState & CoursesActions;

const initialState: CoursesState = {
  byId: {},
  allIds: [],
  enrolledIds: [],
  loading: false,
  lastFetchedAt: undefined,
};

const normalize = (courses: Course[]) => {
  const byId: Record<string, Course> = {};
  const ids: string[] = [];
  for (const c of courses) {
    if (!c?.id) continue;
    byId[c.id] = c;
    ids.push(c.id);
  }
  return { byId, ids };
};

export const useCoursesStore = create<CoursesStore>((set, get) => ({
  ...initialState,

  setState: (s) => set(() => ({ ...s })),

  fetchAll: async () => {
    set({ loading: true });
    try {
      const list = await fetchAvailableCourses();
      const { byId, ids } = normalize(list);
      set((st) => ({
        byId: { ...st.byId, ...byId },
        allIds: ids,
        loading: false,
        lastFetchedAt: Date.now(),
      }));
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  fetchEnrolled: async () => {
    set({ loading: true });
    try {
      const list = await fetchEnrolledCourses();
      const { byId, ids } = normalize(list);
      set((st) => ({
        byId: { ...st.byId, ...byId },
        enrolledIds: ids,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  getById: async (id: string) => {
    const cached = get().byId[id];
    if (cached) return cached;
    const course = await getCourseDetails(id).catch(() => null);
    if (course && course.id) {
      set((st) => ({ byId: { ...st.byId, [course.id]: course } }));
      return course;
    }
    return null;
  },
}));
