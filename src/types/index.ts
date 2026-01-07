export interface Class {
  id: string;
  grade: number; // 4, 5, 6
  classNumber: number;
  name: string; // "4학년 1반"
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  points: number;
}

export interface PointRange {
  id: string;
  label: string;
  min: number;
  max: number;
  winnersCount: number;
}

export interface DrawResult {
  rangeId: string;
  winners: Student[];
  timestamp: number;
}

export type AnimationStyle = 'lottery' | 'pinball';

export interface AppState {
  classes: Class[];
  students: Student[];
  pointRanges: PointRange[];
  animationStyle: AnimationStyle;
  
  // Class actions
  addClass: (grade: number, classNumber: number) => void;
  removeClass: (id: string) => void;
  
  // Student actions
  addStudent: (name: string, classId: string, points?: number) => void;
  updateStudent: (id: string, updates: Partial<Omit<Student, 'id'>>) => void;
  removeStudent: (id: string) => void;
  
  // Point range actions
  updatePointRange: (id: string, updates: Partial<Omit<PointRange, 'id'>>) => void;
  
  // Animation style
  setAnimationStyle: (style: AnimationStyle) => void;
  
  // Utils
  getStudentsByRange: (rangeId: string) => Student[];
  getStudentsByClass: (classId: string) => Student[];
}
