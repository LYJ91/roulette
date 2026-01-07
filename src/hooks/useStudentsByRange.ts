import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Student, PointRange } from '../types';

export function useStudentsByRange() {
  const students = useStore((state) => state.students);
  const pointRanges = useStore((state) => state.pointRanges);

  const studentsByRange = useMemo(() => {
    const result: Record<string, Student[]> = {};
    
    pointRanges.forEach((range) => {
      result[range.id] = students.filter(
        (student) => student.points >= range.min && student.points <= range.max
      );
    });
    
    return result;
  }, [students, pointRanges]);

  const getStudentsForRange = (rangeId: string): Student[] => {
    return studentsByRange[rangeId] || [];
  };

  const getRangeStats = (rangeId: string): { count: number; range: PointRange | undefined } => {
    const range = pointRanges.find((r) => r.id === rangeId);
    return {
      count: studentsByRange[rangeId]?.length || 0,
      range,
    };
  };

  return {
    studentsByRange,
    getStudentsForRange,
    getRangeStats,
    pointRanges,
  };
}
