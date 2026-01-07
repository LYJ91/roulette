import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Class, Student, PointRange, AnimationStyle, ThemeMode } from '../types';

const DEFAULT_POINT_RANGES: PointRange[] = [
  { id: 'range-1', label: '브론즈', min: 0, max: 15, winnersCount: 2 },
  { id: 'range-2', label: '실버', min: 16, max: 30, winnersCount: 2 },
  { id: 'range-3', label: '골드', min: 31, max: 50, winnersCount: 2 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      classes: [],
      students: [],
      pointRanges: DEFAULT_POINT_RANGES,
      animationStyle: 'lottery' as AnimationStyle,
      themeMode: 'neon' as ThemeMode,

      // Class actions
      addClass: (grade: number, classNumber: number) => {
        const newClass: Class = {
          id: uuidv4(),
          grade,
          classNumber,
          name: `${grade}학년 ${classNumber}반`,
        };
        set((state) => ({ classes: [...state.classes, newClass] }));
      },

      removeClass: (id: string) => {
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
          students: state.students.filter((s) => s.classId !== id),
        }));
      },

      // Student actions
      addStudent: (name: string, classId: string, points: number = 0) => {
        const newStudent: Student = {
          id: uuidv4(),
          name,
          classId,
          points,
        };
        set((state) => ({ students: [...state.students, newStudent] }));
      },

      updateStudent: (id: string, updates: Partial<Omit<Student, 'id'>>) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      removeStudent: (id: string) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        }));
      },

      // Point range actions
      updatePointRange: (id: string, updates: Partial<Omit<PointRange, 'id'>>) => {
        set((state) => ({
          pointRanges: state.pointRanges.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      // Animation style
      setAnimationStyle: (style: AnimationStyle) => {
        set({ animationStyle: style });
      },

      // Theme mode
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
        document.documentElement.setAttribute('data-theme', mode);
      },

      // Utils
      getStudentsByRange: (rangeId: string) => {
        const state = get();
        const range = state.pointRanges.find((r) => r.id === rangeId);
        if (!range) return [];
        return state.students.filter(
          (s) => s.points >= range.min && s.points <= range.max
        );
      },

      getStudentsByClass: (classId: string) => {
        const state = get();
        return state.students.filter((s) => s.classId === classId);
      },
    }),
    {
      name: 'roulette-storage',
    }
  )
);
