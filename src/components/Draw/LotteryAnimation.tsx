import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student } from '../../types';
import { shuffleArray, NEON_COLORS } from '../../utils/random';
import styles from './LotteryAnimation.module.css';

interface Ball {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  student: Student;
}

interface Winner {
  rank: number;
  ball: Ball;
}

interface Props {
  students: Student[];
  winnersCount: number;
  onComplete: (winners: Student[]) => void;
  onStart: () => void;
}

const CONTAINER_SIZE = 400;
const BALL_RADIUS = 30;

export function LotteryAnimation({ students, winnersCount, onComplete, onStart }: Props) {
  const frameRef = useRef<number | null>(null);
  const ballsRef = useRef<Ball[]>([]); // 공 상태를 ref로 관리
  const roundRef = useRef(0);
  const isAnimatingRef = useRef(false);
  
  const [displayBalls, setDisplayBalls] = useState<Ball[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'exiting' | 'result'>('idle');
  const [exitingBall, setExitingBall] = useState<{ ball: Ball; progress: number } | null>(null);
  const [statusText, setStatusText] = useState('');

  // 공 생성
  const createBalls = useCallback((studentList: Student[]): Ball[] => {
    return studentList.map((student, i) => ({
      id: student.id,
      name: student.name,
      x: CONTAINER_SIZE / 2 + (Math.random() - 0.5) * 150,
      y: CONTAINER_SIZE / 2 + (Math.random() - 0.5) * 150,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color: NEON_COLORS[i % NEON_COLORS.length],
      student,
    }));
  }, []);

  // 초기화
  useEffect(() => {
    const balls = createBalls(students);
    ballsRef.current = balls;
    setDisplayBalls(balls);
  }, [students, createBalls]);

  // 물리 시뮬레이션 (한 프레임)
  const simulateFrame = useCallback(() => {
    const balls = ballsRef.current;
    const newBalls = balls.map(ball => {
      let { x, y, vx, vy } = ball;
      
      // 난류
      vx += (Math.random() - 0.5) * 4;
      vy += (Math.random() - 0.5) * 4;
      
      // 이동
      x += vx;
      y += vy;
      
      // 원형 경계
      const cx = CONTAINER_SIZE / 2;
      const cy = CONTAINER_SIZE / 2;
      const maxR = CONTAINER_SIZE / 2 - BALL_RADIUS - 5;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > maxR) {
        const nx = dx / dist;
        const ny = dy / dist;
        x = cx + nx * maxR;
        y = cy + ny * maxR;
        const dot = vx * nx + vy * ny;
        vx = (vx - 2 * dot * nx) * 0.8;
        vy = (vy - 2 * dot * ny) * 0.8;
      }
      
      // 속도 제한
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 12) {
        vx = (vx / speed) * 12;
        vy = (vy / speed) * 12;
      }
      if (speed < 2) {
        vx *= 2 / Math.max(speed, 0.1);
        vy *= 2 / Math.max(speed, 0.1);
      }
      
      return { ...ball, x, y, vx, vy };
    });
    
    // 충돌
    for (let i = 0; i < newBalls.length; i++) {
      for (let j = i + 1; j < newBalls.length; j++) {
        const dx = newBalls[j].x - newBalls[i].x;
        const dy = newBalls[j].y - newBalls[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BALL_RADIUS * 2 && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (BALL_RADIUS * 2 - dist) / 2;
          newBalls[i].x -= nx * overlap;
          newBalls[i].y -= ny * overlap;
          newBalls[j].x += nx * overlap;
          newBalls[j].y += ny * overlap;
        }
      }
    }
    
    ballsRef.current = newBalls;
    setDisplayBalls([...newBalls]);
  }, []);

  // 스피닝 시작
  const startSpinning = useCallback((duration: number, onComplete: () => void) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    let frame = 0;
    const animate = () => {
      frame++;
      simulateFrame();
      
      if (frame < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        onComplete();
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
  }, [simulateFrame]);

  // 공 선택 및 퇴장 애니메이션
  const pickAndExitBall = useCallback((onComplete: (ball: Ball) => void) => {
    const balls = ballsRef.current;
    if (balls.length === 0) return;
    
    // 무작위 선택
    const shuffled = shuffleArray([...balls]);
    const selected = shuffled[0];
    
    // 목록에서 제거
    ballsRef.current = balls.filter(b => b.id !== selected.id);
    setDisplayBalls([...ballsRef.current]);
    
    // 퇴장 애니메이션 시작
    let progress = 0;
    const animateExit = () => {
      progress += 0.012;
      setExitingBall({ ball: selected, progress: Math.min(progress, 1) });
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateExit);
      } else {
        onComplete(selected);
      }
    };
    
    frameRef.current = requestAnimationFrame(animateExit);
  }, []);

  // 전체 추첨 프로세스 실행
  const runLotteryRound = useCallback(() => {
    const currentRound = roundRef.current;
    const roundNumber = currentRound + 1;
    
    setStatusText(`🎰 ${roundNumber === 1 ? '추첨 중...' : `다시 섞는 중... (${roundNumber}/${winnersCount})`}`);
    setPhase('spinning');
    
    // 스피닝 (첫 라운드는 길게, 두 번째도 충분히)
    const spinDuration = currentRound === 0 ? 360 : 280;
    
    startSpinning(spinDuration, () => {
      setStatusText(`🎊 ${roundNumber}번째 당첨자 선정!`);
      setPhase('exiting');
      
      // 공 선택 및 퇴장
      pickAndExitBall((selectedBall) => {
        // 당첨자 추가
        setWinners(prev => [...prev, { rank: roundNumber, ball: selectedBall }]);
        
        // 확대 표시 유지
        setTimeout(() => {
          setExitingBall(null);
          roundRef.current = currentRound + 1;
          
          // 다음 라운드 또는 종료
          if (roundRef.current < winnersCount && ballsRef.current.length > 0) {
            setTimeout(() => {
              runLotteryRound();
            }, 800);
          } else {
            setStatusText('🎉 축하합니다! 🎉');
            setPhase('result');
          }
        }, 2200);
      });
    });
  }, [winnersCount, startSpinning, pickAndExitBall]);

  // 결과 단계에서 완료 콜백
  useEffect(() => {
    if (phase !== 'result') return;
    if (winners.length === 0) return;
    
    const timer = setTimeout(() => {
      onComplete(winners.map(w => w.ball.student));
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [phase, winners, onComplete]);

  // 시작
  const handleStart = () => {
    if (students.length < winnersCount) {
      alert(`최소 ${winnersCount}명의 학생이 필요합니다.`);
      return;
    }
    
    // 초기화
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    isAnimatingRef.current = false;
    roundRef.current = 0;
    
    const balls = createBalls(students);
    ballsRef.current = balls;
    setDisplayBalls(balls);
    setWinners([]);
    setExitingBall(null);
    
    onStart();
    
    // 시작
    setTimeout(() => {
      runLotteryRound();
    }, 100);
  };

  // 리셋
  const handleReset = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    isAnimatingRef.current = false;
    roundRef.current = 0;
    
    const balls = createBalls(students);
    ballsRef.current = balls;
    setDisplayBalls(balls);
    setWinners([]);
    setExitingBall(null);
    setStatusText('');
    setPhase('idle');
  };

  // 퇴장 공 위치 계산
  const getExitPosition = () => {
    if (!exitingBall) return null;
    
    const { ball, progress } = exitingBall;
    const startX = ball.x;
    const startY = ball.y;
    const tubeX = CONTAINER_SIZE / 2;
    const tubeY = 30;
    
    if (progress < 0.3) {
      // 중앙으로 이동
      const t = progress / 0.3;
      return {
        x: startX + (tubeX - startX) * t,
        y: startY + (tubeY + 80 - startY) * t,
        scale: 1,
        stage: 'moving',
      };
    } else if (progress < 0.6) {
      // 튜브 통해 상승
      const t = (progress - 0.3) / 0.3;
      return {
        x: tubeX,
        y: tubeY + 80 - t * 120,
        scale: 1 + t * 0.4,
        stage: 'rising',
      };
    } else {
      // 위에서 확대
      const t = (progress - 0.6) / 0.4;
      return {
        x: tubeX,
        y: tubeY - 40 - t * 60,
        scale: 1.4 + t * 0.6,
        stage: 'showing',
      };
    }
  };

  const exitPos = getExitPosition();

  return (
    <div className={styles.container}>
      <div className={styles.machine}>
        {/* 출구 튜브 */}
        <div className={styles.exitTube}>
          <div className={styles.tubeInner}>
            <div className={styles.tubeGlow} />
          </div>
        </div>

        {/* 유리 용기 */}
        <div className={styles.glassContainer}>
          <div className={styles.glass}>
            {displayBalls.map((ball) => (
              <div
                key={ball.id}
                className={styles.ball}
                style={{
                  backgroundColor: ball.color,
                  boxShadow: `0 0 15px ${ball.color}`,
                  left: ball.x - BALL_RADIUS,
                  top: ball.y - BALL_RADIUS,
                }}
              >
                <span className={styles.ballText}>{ball.name}</span>
              </div>
            ))}
          </div>

          {phase === 'spinning' && (
            <motion.div
              className={styles.spinOverlay}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>

        {/* 퇴장 중인 공 */}
        {exitingBall && exitPos && (
          <>
            {/* 이동/상승 중 */}
            {(exitPos.stage === 'moving' || exitPos.stage === 'rising') && (
              <div
                className={styles.exitingBall}
                style={{
                  backgroundColor: exitingBall.ball.color,
                  boxShadow: `0 0 ${30 * exitPos.scale}px ${exitingBall.ball.color}`,
                  left: exitPos.x - BALL_RADIUS * exitPos.scale,
                  top: exitPos.y - BALL_RADIUS * exitPos.scale,
                  width: BALL_RADIUS * 2 * exitPos.scale,
                  height: BALL_RADIUS * 2 * exitPos.scale,
                }}
              >
                <span className={styles.ballText}>{exitingBall.ball.name}</span>
              </div>
            )}

            {/* 확대 표시 */}
            {exitPos.stage === 'showing' && (
              <motion.div
                className={styles.showingBallContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className={styles.showingBall}
                  style={{
                    backgroundColor: exitingBall.ball.color,
                    boxShadow: `0 0 60px ${exitingBall.ball.color}, 0 0 100px ${exitingBall.ball.color}`,
                  }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <span className={styles.showingLabel}>🎉 당첨!</span>
                  <span className={styles.showingName}>{exitingBall.ball.name}</span>
                </motion.div>
              </motion.div>
            )}
          </>
        )}

        {/* 당첨자 목록 */}
        <div className={styles.winnersArea}>
          <AnimatePresence>
            {winners.map((w) => (
              <motion.div
                key={w.ball.id}
                className={styles.winnerBall}
                style={{
                  backgroundColor: w.ball.color,
                  boxShadow: `0 0 20px ${w.ball.color}`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <span className={styles.winnerName}>{w.ball.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className={styles.controls}>
        {phase === 'idle' && (
          <button className="btn btn-primary" onClick={handleStart}>
            🎰 추첨 시작
          </button>
        )}
        {(phase === 'spinning' || phase === 'exiting') && (
          <div className={styles.statusText}>{statusText}</div>
        )}
        {phase === 'result' && (
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 다시 하기
          </button>
        )}
      </div>

      {students.length === 0 && (
        <div className={styles.emptyMessage}>
          이 구간에 해당하는 학생이 없습니다
        </div>
      )}
    </div>
  );
}
