import { motion } from 'framer-motion';
import type { Student, Class } from '../../types';
import styles from './WinnerDisplay.module.css';

interface Props {
  winners: Student[];
  rangeLabel: string;
  classes: Class[];
}

export function WinnerDisplay({ winners, rangeLabel, classes }: Props) {
  if (winners.length === 0) return null;

  // 학생의 반 정보 가져오기
  const getClassName = (classId: string): string => {
    const studentClass = classes.find(c => c.id === classId);
    return studentClass ? studentClass.name : '';
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <div className={styles.confetti}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.confettiPiece}
            initial={{ 
              y: -20, 
              x: Math.random() * 200 - 100,
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: 200, 
              x: Math.random() * 200 - 100,
              rotate: Math.random() * 720,
              opacity: 0 
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
            style={{
              background: ['var(--neon-pink)', 'var(--neon-yellow)', 'var(--neon-cyan)', 'var(--neon-purple)'][i % 4],
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        className={styles.trophy}
        animate={{ 
          rotateY: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏆
      </motion.div>

      <h2 className={styles.title}>
        {rangeLabel} 구간 당첨자
      </h2>

      <div className={styles.winnerCards}>
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            className={styles.winnerCard}
            initial={{ opacity: 0, y: 50, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: index * 0.3, type: 'spring' }}
          >
            <div className={styles.winnerIcon}>🎊</div>
            <div className={styles.winnerInfo}>
              <span className={styles.winnerClass}>{getClassName(winner.classId)}</span>
              <span className={styles.winnerName}>{winner.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
