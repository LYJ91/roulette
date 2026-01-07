import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { DrawPanel } from '../components/Draw';
import styles from './Draw.module.css';

export function Draw() {
  const pointRanges = useStore((state) => state.pointRanges);
  const animationStyle = useStore((state) => state.animationStyle);
  const setAnimationStyle = useStore((state) => state.setAnimationStyle);
  const [selectedRangeId, setSelectedRangeId] = useState<string | null>(null);

  const selectedRange = selectedRangeId 
    ? pointRanges.find(r => r.id === selectedRangeId) 
    : null;

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>
          <span>🎰</span>
          추첨하기
        </h1>
        <p className={styles.description}>
          점수 구간을 선택하고 추첨을 시작하세요
        </p>
      </motion.div>

      <motion.div
        className={styles.styleToggle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className={styles.styleLabel}>애니메이션:</span>
        <button
          className={`${styles.styleBtn} ${animationStyle === 'lottery' ? styles.active : ''}`}
          onClick={() => setAnimationStyle('lottery')}
        >
          🎰 로또
        </button>
        <button
          className={`${styles.styleBtn} ${animationStyle === 'pinball' ? styles.active : ''}`}
          onClick={() => setAnimationStyle('pinball')}
        >
          🎯 핀볼
        </button>
      </motion.div>

      {!selectedRange ? (
        <motion.div
          className={styles.rangeSelection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={styles.selectionTitle}>추첨할 구간 선택</h2>
          <div className={styles.rangeCards}>
            {pointRanges.map((range, index) => {
              const colors = ['var(--neon-orange)', 'var(--neon-blue)', 'var(--neon-yellow)'];
              return (
                <motion.button
                  key={range.id}
                  className={styles.rangeCard}
                  style={{ '--accent-color': colors[index % colors.length] } as React.CSSProperties}
                  onClick={() => setSelectedRangeId(range.id)}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    {index === 0 ? '🥉' : index === 1 ? '🥈' : '🥇'}
                  </div>
                  <div className={styles.cardLabel}>{range.label}</div>
                  <div className={styles.cardPoints}>{range.min} ~ {range.max}점</div>
                  <div className={styles.cardWinners}>당첨 {range.winnersCount}명</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className={styles.drawArea}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button 
            className={styles.backBtn}
            onClick={() => setSelectedRangeId(null)}
          >
            ← 구간 선택으로 돌아가기
          </button>
          <DrawPanel 
            range={selectedRange} 
            colorIndex={pointRanges.findIndex(r => r.id === selectedRangeId)} 
          />
        </motion.div>
      )}
    </div>
  );
}
