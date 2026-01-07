import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import styles from './StudentManager.module.css';

export function StudentManager() {
  const classes = useStore((state) => state.classes);
  const students = useStore((state) => state.students);
  const addStudent = useStore((state) => state.addStudent);
  const updateStudent = useStore((state) => state.updateStudent);
  const removeStudent = useStore((state) => state.removeStudent);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPoints, setNewStudentPoints] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('');

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return students;
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const classA = classes.find((c) => c.id === a.classId);
      const classB = classes.find((c) => c.id === b.classId);
      if (classA && classB) {
        if (classA.grade !== classB.grade) return classA.grade - classB.grade;
        if (classA.classNumber !== classB.classNumber) return classA.classNumber - classB.classNumber;
      }
      return a.name.localeCompare(b.name, 'ko');
    });
  }, [filteredStudents, classes]);

  const handleAddStudent = () => {
    if (!selectedClassId) {
      alert('반을 먼저 선택해주세요.');
      return;
    }
    if (!newStudentName.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }
    const points = parseInt(newStudentPoints) || 0;
    addStudent(newStudentName.trim(), selectedClassId, points);
    setNewStudentName('');
    setNewStudentPoints('0');
  };

  const handleStartEdit = (student: typeof students[0]) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditPoints(student.points.toString());
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateStudent(editingId, {
      name: editName.trim(),
      points: parseInt(editPoints) || 0,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleRemoveStudent = (id: string, name: string) => {
    if (confirm(`${name} 학생을 삭제하시겠습니까?`)) {
      removeStudent(id);
    }
  };

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls?.name || '알 수 없음';
  };

  const getPointBadge = (points: number) => {
    if (points <= 15) return { label: '브론즈', color: 'var(--neon-orange)' };
    if (points <= 30) return { label: '실버', color: 'var(--neon-blue)' };
    return { label: '골드', color: 'var(--neon-yellow)' };
  };

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <h1 className={styles.title}>
          <span>👨‍🎓</span>
          학생 관리
        </h1>
        <p className={styles.description}>
          학생을 추가하고 포인트를 관리하세요
        </p>
      </motion.div>

      <motion.div
        className={styles.addForm}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={styles.formTitle}>새 학생 추가</h2>
        <div className={styles.formRow}>
          <select
            className={`select ${styles.classSelect}`}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">반 선택</option>
            {classes
              .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber)
              .map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
          </select>
          <input
            type="text"
            className={`input ${styles.nameInput}`}
            placeholder="학생 이름"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
          />
          <div className={styles.pointsInputWrapper}>
            <input
              type="number"
              className={`input ${styles.pointsInput}`}
              placeholder="포인트"
              value={newStudentPoints}
              onChange={(e) => setNewStudentPoints(e.target.value)}
              min="0"
              max="100"
            />
            <span className={styles.pointsLabel}>점</span>
          </div>
          <button className="btn btn-primary" onClick={handleAddStudent}>
            추가
          </button>
        </div>
      </motion.div>

      <motion.div
        className={styles.filterSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className={styles.filterLabel}>필터:</span>
        <select
          className="select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">전체 보기</option>
          {classes
            .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber)
            .map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
        </select>
        <span className={styles.studentCount}>
          총 {sortedStudents.length}명
        </span>
      </motion.div>

      <motion.div
        className={styles.studentList}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {sortedStudents.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📝</span>
            <p>등록된 학생이 없습니다</p>
            <p className={styles.emptyHint}>위에서 학생을 추가해보세요</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>반</span>
              <span>이름</span>
              <span>포인트</span>
              <span>구간</span>
              <span>관리</span>
            </div>
            <AnimatePresence mode="popLayout">
              {sortedStudents.map((student) => {
                const badge = getPointBadge(student.points);
                const isEditing = editingId === student.id;
                
                return (
                  <motion.div
                    key={student.id}
                    className={styles.tableRow}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <span className={styles.cellClass}>
                      {getClassName(student.classId)}
                    </span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          className={`input ${styles.editInput}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <input
                          type="number"
                          className={`input ${styles.editInput}`}
                          value={editPoints}
                          onChange={(e) => setEditPoints(e.target.value)}
                          min="0"
                        />
                        <span
                          className={styles.pointBadge}
                          style={{ background: badge.color }}
                        >
                          {badge.label}
                        </span>
                        <div className={styles.actions}>
                          <button
                            className={`btn btn-icon ${styles.saveBtn}`}
                            onClick={handleSaveEdit}
                            title="저장"
                          >
                            ✓
                          </button>
                          <button
                            className={`btn btn-icon ${styles.cancelBtn}`}
                            onClick={handleCancelEdit}
                            title="취소"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className={styles.cellName}>{student.name}</span>
                        <span className={styles.cellPoints}>{student.points}점</span>
                        <span
                          className={styles.pointBadge}
                          style={{ background: badge.color }}
                        >
                          {badge.label}
                        </span>
                        <div className={styles.actions}>
                          <button
                            className={`btn btn-icon ${styles.editBtn}`}
                            onClick={() => handleStartEdit(student)}
                            title="수정"
                          >
                            ✏️
                          </button>
                          <button
                            className={`btn btn-icon btn-danger`}
                            onClick={() => handleRemoveStudent(student.id, student.name)}
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
