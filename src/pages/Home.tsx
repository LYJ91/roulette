import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useStudentsByRange } from '../hooks/useStudentsByRange';
import styles from './Home.module.css';

export function Home() {
  const classes = useStore((state) => state.classes);
  const students = useStore((state) => state.students);
  const { pointRanges, studentsByRange } = useStudentsByRange();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.home}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.hero} variants={itemVariants}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🎰</span>
          행운의 룰렛
        </h1>
        <p className={styles.subtitle}>
          공정하고 재미있는 학생 추첨 시스템
        </p>
      </motion.div>

      <motion.div className={styles.stats} variants={itemVariants}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏫</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{classes.length}</span>
            <span className={styles.statLabel}>등록된 반</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>👨‍🎓</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{students.length}</span>
            <span className={styles.statLabel}>등록된 학생</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{pointRanges.length}</span>
            <span className={styles.statLabel}>점수 구간</span>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.rangeSection} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>점수 구간별 현황</h2>
        <div className={styles.rangeCards}>
          {pointRanges.map((range, index) => (
            <motion.div
              key={range.id}
              className={styles.rangeCard}
              style={{
                '--accent-color': ['var(--neon-orange)', 'var(--neon-blue)', 'var(--neon-yellow)'][index],
              } as React.CSSProperties}
              whileHover={{ scale: 1.02 }}
            >
              <div className={styles.rangeBadge}>
                {range.label}
              </div>
              <div className={styles.rangeInfo}>
                <span className={styles.rangePoints}>
                  {range.min} ~ {range.max}점
                </span>
                <span className={styles.rangeCount}>
                  {studentsByRange[range.id]?.length || 0}명
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className={styles.actions} variants={itemVariants}>
        <Link to="/draw" className={`btn btn-primary ${styles.drawBtn}`}>
          <span>🎰</span>
          추첨 시작하기
        </Link>
        <Link to="/classes" className="btn btn-secondary">
          <span>🏫</span>
          반 관리
        </Link>
        <Link to="/students" className="btn btn-secondary">
          <span>👨‍🎓</span>
          학생 관리
        </Link>
      </motion.div>
    </motion.div>
  );
}
