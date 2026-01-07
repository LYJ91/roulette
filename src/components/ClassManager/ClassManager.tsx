import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import styles from './ClassManager.module.css';

export function ClassManager() {
  const classes = useStore((state) => state.classes);
  const students = useStore((state) => state.students);
  const addClass = useStore((state) => state.addClass);
  const removeClass = useStore((state) => state.removeClass);

  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [classNumber, setClassNumber] = useState<string>('');

  const handleAddClass = () => {
    const num = parseInt(classNumber);
    if (isNaN(num) || num <= 0) return;
    
    // Check if class already exists
    const exists = classes.some(
      (c) => c.grade === selectedGrade && c.classNumber === num
    );
    if (exists) {
      alert('이미 존재하는 반입니다.');
      return;
    }
    
    addClass(selectedGrade, num);
    setClassNumber('');
  };

  const handleRemoveClass = (id: string, name: string) => {
    const studentCount = students.filter((s) => s.classId === id).length;
    const message = studentCount > 0
      ? `${name}에 ${studentCount}명의 학생이 있습니다. 정말 삭제하시겠습니까?`
      : `${name}을(를) 삭제하시겠습니까?`;
    
    if (confirm(message)) {
      removeClass(id);
    }
  };

  const getStudentCount = (classId: string) => {
    return students.filter((s) => s.classId === classId).length;
  };

  const groupedClasses = classes.reduce((acc, cls) => {
    const grade = cls.grade;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(cls);
    return acc;
  }, {} as Record<number, typeof classes>);

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <h1 className={styles.title}>
          <span>🏫</span>
          반 관리
        </h1>
        <p className={styles.description}>
          학년과 반을 추가하고 관리하세요
        </p>
      </motion.div>

      <motion.div
        className={styles.addForm}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={styles.formTitle}>새 반 추가</h2>
        <div className={styles.formRow}>
          <div className={styles.gradeSelector}>
            {[4, 5, 6].map((grade) => (
              <button
                key={grade}
                className={`${styles.gradeBtn} ${selectedGrade === grade ? styles.active : ''}`}
                onClick={() => setSelectedGrade(grade)}
              >
                {grade}학년
              </button>
            ))}
          </div>
          <input
            type="number"
            className={`input ${styles.classInput}`}
            placeholder="반 번호"
            value={classNumber}
            onChange={(e) => setClassNumber(e.target.value)}
            min="1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
          />
          <button className="btn btn-primary" onClick={handleAddClass}>
            추가
          </button>
        </div>
      </motion.div>

      <div className={styles.classList}>
        {[4, 5, 6].map((grade) => (
          <motion.div
            key={grade}
            className={styles.gradeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + grade * 0.1 }}
          >
            <h2 className={styles.gradeTitle}>
              <span className={styles.gradeIcon}>
                {grade === 4 ? '🌱' : grade === 5 ? '🌿' : '🌳'}
              </span>
              {grade}학년
            </h2>
            <div className={styles.classGrid}>
              <AnimatePresence mode="popLayout">
                {(groupedClasses[grade] || [])
                  .sort((a, b) => a.classNumber - b.classNumber)
                  .map((cls) => (
                    <motion.div
                      key={cls.id}
                      className={styles.classCard}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={styles.classInfo}>
                        <span className={styles.className}>{cls.name}</span>
                        <span className={styles.studentCount}>
                          👨‍🎓 {getStudentCount(cls.id)}명
                        </span>
                      </div>
                      <button
                        className={`btn btn-icon btn-danger ${styles.deleteBtn}`}
                        onClick={() => handleRemoveClass(cls.id, cls.name)}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {(!groupedClasses[grade] || groupedClasses[grade].length === 0) && (
                <div className={styles.empty}>
                  아직 등록된 반이 없습니다
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
