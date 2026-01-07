import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import styles from './RangeSettings.module.css';

export function RangeSettings() {
  const pointRanges = useStore((state) => state.pointRanges);
  const updatePointRange = useStore((state) => state.updatePointRange);
  // 핀볼 숨김 처리로 사용 안함
  // const animationStyle = useStore((state) => state.animationStyle);
  // const setAnimationStyle = useStore((state) => state.setAnimationStyle);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    label: '',
    min: 0,
    max: 0,
    winnersCount: 2,
  });

  const handleStartEdit = (range: typeof pointRanges[0]) => {
    setEditingId(range.id);
    setEditValues({
      label: range.label,
      min: range.min,
      max: range.max,
      winnersCount: range.winnersCount,
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    
    // Validation
    if (editValues.min < 0) {
      alert('최소값은 0 이상이어야 합니다.');
      return;
    }
    if (editValues.max <= editValues.min) {
      alert('최대값은 최소값보다 커야 합니다.');
      return;
    }
    if (editValues.winnersCount < 1) {
      alert('당첨자 수는 1명 이상이어야 합니다.');
      return;
    }
    
    updatePointRange(editingId, editValues);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const getRangeColor = (index: number) => {
    const colors = ['var(--neon-orange)', 'var(--neon-blue)', 'var(--neon-yellow)'];
    return colors[index % colors.length];
  };

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <h1 className={styles.title}>
          <span>⚙️</span>
          설정
        </h1>
        <p className={styles.description}>
          점수 구간과 추첨 설정을 관리하세요
        </p>
      </motion.div>

      {/* 애니메이션 스타일 선택 - 현재 로또만 사용 */}
      {/* <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={styles.sectionTitle}>
          <span>🎨</span>
          애니메이션 스타일
        </h2>
        <div className={styles.styleSelector}>
          <button
            className={`${styles.styleBtn} ${animationStyle === 'lottery' ? styles.active : ''}`}
            onClick={() => setAnimationStyle('lottery')}
          >
            <span className={styles.styleIcon}>🎰</span>
            <span className={styles.styleName}>로또 스타일</span>
            <span className={styles.styleDesc}>공이 회전하며 추첨</span>
          </button>
          <button
            className={`${styles.styleBtn} ${animationStyle === 'pinball' ? styles.active : ''}`}
            onClick={() => setAnimationStyle('pinball')}
          >
            <span className={styles.styleIcon}>🎯</span>
            <span className={styles.styleName}>핀볼 스타일</span>
            <span className={styles.styleDesc}>공이 떨어지며 추첨</span>
          </button>
        </div>
      </motion.div> */}

      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={styles.sectionTitle}>
          <span>📊</span>
          점수 구간 설정
        </h2>
        <p className={styles.sectionHint}>
          각 구간의 점수 범위와 당첨자 수를 설정하세요
        </p>
        
        <div className={styles.rangeList}>
          {pointRanges.map((range, index) => (
            <motion.div
              key={range.id}
              className={styles.rangeCard}
              style={{ '--accent-color': getRangeColor(index) } as React.CSSProperties}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {editingId === range.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editRow}>
                    <label>이름</label>
                    <input
                      type="text"
                      className="input"
                      value={editValues.label}
                      onChange={(e) => setEditValues({ ...editValues, label: e.target.value })}
                    />
                  </div>
                  <div className={styles.editRow}>
                    <label>최소 점수</label>
                    <input
                      type="number"
                      className="input"
                      value={editValues.min}
                      onChange={(e) => setEditValues({ ...editValues, min: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className={styles.editRow}>
                    <label>최대 점수</label>
                    <input
                      type="number"
                      className="input"
                      value={editValues.max}
                      onChange={(e) => setEditValues({ ...editValues, max: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className={styles.editRow}>
                    <label>당첨자 수</label>
                    <input
                      type="number"
                      className="input"
                      value={editValues.winnersCount}
                      onChange={(e) => setEditValues({ ...editValues, winnersCount: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className={styles.editActions}>
                    <button className="btn btn-primary" onClick={handleSave}>
                      저장
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.rangeHeader}>
                    <span className={styles.rangeBadge}>{range.label}</span>
                    <button
                      className={`btn btn-icon ${styles.editBtn}`}
                      onClick={() => handleStartEdit(range)}
                    >
                      ✏️
                    </button>
                  </div>
                  <div className={styles.rangeDetails}>
                    <div className={styles.rangeDetail}>
                      <span className={styles.detailLabel}>점수 범위</span>
                      <span className={styles.detailValue}>{range.min} ~ {range.max}점</span>
                    </div>
                    <div className={styles.rangeDetail}>
                      <span className={styles.detailLabel}>당첨자 수</span>
                      <span className={styles.detailValue}>{range.winnersCount}명</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>
          <span>💡</span>
          사용 팁
        </h2>
        <ul className={styles.tipList}>
          <li>점수 구간이 겹치지 않도록 설정하세요</li>
          <li>당첨자 수는 해당 구간 학생 수보다 적어야 합니다</li>
          <li>추첨 시 공이 튜브를 통해 나오며 당첨자가 선정됩니다</li>
        </ul>
      </motion.div>
    </div>
  );
}
