import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useStudentsByRange } from '../../hooks/useStudentsByRange';
import { LotteryAnimation } from './LotteryAnimation';
// import { PinballAnimation } from './PinballAnimation'; // 핀볼 숨김 처리
import { WinnerDisplay } from './WinnerDisplay';
import type { Student, PointRange } from '../../types';
import styles from './DrawPanel.module.css';

interface Props {
  range: PointRange;
  colorIndex: number;
}

export function DrawPanel({ range, colorIndex }: Props) {
  const classes = useStore((state) => state.classes);
  const { getStudentsForRange } = useStudentsByRange();
  
  const [winners, setWinners] = useState<Student[]>([]);
  const [showResults, setShowResults] = useState(false);

  const students = getStudentsForRange(range.id);
  const colors = ['var(--neon-orange)', 'var(--neon-blue)', 'var(--neon-yellow)'];
  const accentColor = colors[colorIndex % colors.length];

  const handleStart = useCallback(() => {
    setShowResults(false);
    setWinners([]);
  }, []);

  const handleComplete = useCallback((selectedWinners: Student[]) => {
    setWinners(selectedWinners);
    setShowResults(true);
  }, []);

  const handleReset = () => {
    setShowResults(false);
    setWinners([]);
  };

  return (
    <motion.div
      className={styles.panel}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colorIndex * 0.1 }}
    >
      <div className={styles.header}>
        <div className={styles.rangeBadge}>{range.label}</div>
        <div className={styles.rangeInfo}>
          <span className={styles.rangePoints}>{range.min} ~ {range.max}점</span>
          <span className={styles.studentCount}>
            👨‍🎓 {students.length}명 참가
          </span>
        </div>
        <div className={styles.winnersTarget}>
          당첨: {range.winnersCount}명
        </div>
      </div>

      <div className={styles.content}>
        {showResults ? (
          <div className={styles.results}>
            <WinnerDisplay winners={winners} rangeLabel={range.label} classes={classes} />
            <button className="btn btn-secondary" onClick={handleReset}>
              🔄 다시 추첨하기
            </button>
          </div>
        ) : (
          <div className={styles.animationContainer}>
            <LotteryAnimation
              students={students}
              winnersCount={range.winnersCount}
              onComplete={handleComplete}
              onStart={handleStart}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
