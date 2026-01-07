import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student } from '../../types';
import { NEON_COLORS, shuffleArray } from '../../utils/random';
import styles from './PinballAnimation.module.css';

interface Ball {
  id: string;
  name: string;
  student: Student;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  finished: boolean;
  finishOrder: number;
}

interface Peg {
  x: number;
  y: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
}

interface Props {
  students: Student[];
  winnersCount: number;
  onComplete: (winners: Student[]) => void;
  onStart: () => void;
}

const BOARD_WIDTH = 380;
const BOARD_HEIGHT = 1800;
const BALL_RADIUS = 10;
const PEG_RADIUS = 5;
const EXIT_WIDTH = 40;
const EXIT_Y = BOARD_HEIGHT - 40;

export function PinballAnimation({ students, winnersCount, onComplete, onStart }: Props) {
  const animationRef = useRef<number | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const finishCountRef = useRef(0);
  const explosionTimerRef = useRef<number | null>(null);
  
  const [displayBalls, setDisplayBalls] = useState<Ball[]>([]);
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'complete'>('idle');
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [finishedBalls, setFinishedBalls] = useState<Ball[]>([]);
  const [statusText, setStatusText] = useState('');

  // Generate pegs in a funnel pattern (only inside funnel walls)
  const generatePegs = useCallback(() => {
    const newPegs: Peg[] = [];
    const rows = 50;
    const startY = 80;
    const rowSpacing = 32;
    const pegSpacing = 28;
    
    for (let row = 0; row < rows; row++) {
      const y = startY + row * rowSpacing;
      
      // Calculate funnel width at this Y position
      const progress = y / BOARD_HEIGHT;
      const maxWidth = BOARD_WIDTH - 80;
      const minWidth = EXIT_WIDTH + 20;
      const funnelWidth = maxWidth - (maxWidth - minWidth) * progress * 0.95;
      
      const leftWall = (BOARD_WIDTH - funnelWidth) / 2 + 15;
      const rightWall = (BOARD_WIDTH + funnelWidth) / 2 - 15;
      const availableWidth = rightWall - leftWall;
      
      const pegsInRow = Math.max(2, Math.floor(availableWidth / pegSpacing));
      const actualRowWidth = (pegsInRow - 1) * pegSpacing;
      const startX = leftWall + (availableWidth - actualRowWidth) / 2;
      
      // Offset every other row
      const offset = row % 2 === 0 ? 0 : pegSpacing / 2;
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + col * pegSpacing + offset;
        // Only add peg if it's within funnel bounds
        if (x > leftWall && x < rightWall) {
          newPegs.push({ x, y });
        }
      }
    }
    
    setPegs(newPegs);
  }, []);

  // Initialize balls for all students
  const initializeBalls = useCallback(() => {
    if (students.length === 0) return [];
    
    const shuffled = shuffleArray([...students]);
    const balls: Ball[] = shuffled.map((student, i) => ({
      id: student.id,
      name: student.name,
      student,
      x: BOARD_WIDTH / 2 + (Math.random() - 0.5) * 80,
      y: 20 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2,
      color: NEON_COLORS[i % NEON_COLORS.length],
      finished: false,
      finishOrder: 0,
    }));
    
    return balls;
  }, [students]);

  useEffect(() => {
    generatePegs();
  }, [generatePegs]);

  // Create explosion effect
  const createExplosion = useCallback(() => {
    if (phase !== 'dropping') return;
    
    const explosionX = BOARD_WIDTH / 2 + (Math.random() - 0.5) * 150;
    const explosionY = 200 + Math.random() * 300;
    
    const newExplosion: Explosion = {
      id: Date.now(),
      x: explosionX,
      y: explosionY,
    };
    
    setExplosions(prev => [...prev, newExplosion]);
    
    // Apply force to nearby balls
    ballsRef.current = ballsRef.current.map(ball => {
      if (ball.finished) return ball;
      
      const dx = ball.x - explosionX;
      const dy = ball.y - explosionY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 120) {
        const force = (120 - dist) / 120 * 8;
        const angle = Math.atan2(dy, dx);
        return {
          ...ball,
          vx: ball.vx + Math.cos(angle) * force,
          vy: ball.vy + Math.sin(angle) * force - 2,
        };
      }
      return ball;
    });
    
    // Remove explosion after animation
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== newExplosion.id));
    }, 600);
  }, [phase]);

  // Physics simulation
  const updatePhysics = useCallback(() => {
    const gravity = 0.25;
    const friction = 0.995;
    const bounce = 0.65;
    
    let anyActive = false;
    
    ballsRef.current = ballsRef.current.map(ball => {
      if (ball.finished) return ball;
      
      anyActive = true;
      let { x, y, vx, vy } = ball;
      
      // Apply gravity
      vy += gravity;
      
      // Apply velocity
      x += vx;
      y += vy;
      
      // Wall collision (funnel shape)
      const progress = Math.min(1, y / BOARD_HEIGHT);
      const maxWidth = BOARD_WIDTH - 40;
      const minWidth = EXIT_WIDTH;
      const currentWidth = maxWidth - (maxWidth - minWidth) * progress * 0.9;
      const leftWall = (BOARD_WIDTH - currentWidth) / 2;
      const rightWall = (BOARD_WIDTH + currentWidth) / 2;
      
      if (x - BALL_RADIUS < leftWall) {
        x = leftWall + BALL_RADIUS;
        vx = Math.abs(vx) * bounce;
      }
      if (x + BALL_RADIUS > rightWall) {
        x = rightWall - BALL_RADIUS;
        vx = -Math.abs(vx) * bounce;
      }
      
      // Top wall
      if (y - BALL_RADIUS < 20) {
        y = 20 + BALL_RADIUS;
        vy = Math.abs(vy) * bounce;
      }
      
      // Peg collision
      pegs.forEach(peg => {
        const dx = x - peg.x;
        const dy = y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = BALL_RADIUS + PEG_RADIUS;
        
        if (dist < minDist && dist > 0) {
          const angle = Math.atan2(dy, dx);
          const overlap = minDist - dist;
          
          x += Math.cos(angle) * overlap;
          y += Math.sin(angle) * overlap;
          
          const normalX = dx / dist;
          const normalY = dy / dist;
          const dotProduct = vx * normalX + vy * normalY;
          
          vx = (vx - 2 * dotProduct * normalX) * bounce;
          vy = (vy - 2 * dotProduct * normalY) * bounce;
          
          // Add randomness
          vx += (Math.random() - 0.5) * 1.5;
        }
      });
      
      // Ball-to-ball collision
      ballsRef.current.forEach(other => {
        if (other.id === ball.id || other.finished) return;
        
        const dx = x - other.x;
        const dy = y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = BALL_RADIUS * 2;
        
        if (dist < minDist && dist > 0) {
          const angle = Math.atan2(dy, dx);
          const overlap = (minDist - dist) / 2;
          
          x += Math.cos(angle) * overlap;
          y += Math.sin(angle) * overlap;
          
          const normalX = dx / dist;
          const normalY = dy / dist;
          const relVx = vx - other.vx;
          const relVy = vy - other.vy;
          const dotProduct = relVx * normalX + relVy * normalY;
          
          if (dotProduct > 0) {
            vx -= dotProduct * normalX * 0.5;
            vy -= dotProduct * normalY * 0.5;
          }
        }
      });
      
      // Apply friction
      vx *= friction;
      
      // Check if ball reached exit
      const exitLeft = (BOARD_WIDTH - EXIT_WIDTH) / 2;
      const exitRight = (BOARD_WIDTH + EXIT_WIDTH) / 2;
      
      if (y > EXIT_Y && x > exitLeft && x < exitRight) {
        finishCountRef.current += 1;
        return {
          ...ball,
          x, y, vx, vy,
          finished: true,
          finishOrder: finishCountRef.current,
        };
      }
      
      return { ...ball, x, y, vx, vy };
    });
    
    setDisplayBalls([...ballsRef.current]);
    
    // Update finished balls list
    const newlyFinished = ballsRef.current.filter(b => b.finished);
    if (newlyFinished.length > finishedBalls.length) {
      setFinishedBalls(newlyFinished.sort((a, b) => a.finishOrder - b.finishOrder));
    }
    
    return anyActive;
  }, [pegs, finishedBalls.length]);

  // Main animation loop
  useEffect(() => {
    if (phase !== 'dropping') return;
    
    const animate = () => {
      const anyActive = updatePhysics();
      
      if (anyActive) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // All balls finished
        setPhase('complete');
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Explosion timer
    explosionTimerRef.current = window.setInterval(() => {
      createExplosion();
    }, 1500);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (explosionTimerRef.current) clearInterval(explosionTimerRef.current);
    };
  }, [phase, updatePhysics, createExplosion]);

  // Notify parent when complete
  useEffect(() => {
    if (phase !== 'complete') return;
    if (finishedBalls.length === 0) return;
    
    // Winners are the LAST ones to finish
    const sortedByFinish = [...finishedBalls].sort((a, b) => b.finishOrder - a.finishOrder);
    const winners = sortedByFinish.slice(0, winnersCount).map(b => b.student);
    
    setStatusText('🎉 추첨 완료!');
    
    const timer = setTimeout(() => {
      onComplete(winners);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [phase, finishedBalls, winnersCount, onComplete]);

  const handleStart = () => {
    if (students.length < winnersCount) {
      alert(`최소 ${winnersCount}명의 학생이 필요합니다.`);
      return;
    }
    
    // Reset
    finishCountRef.current = 0;
    const balls = initializeBalls();
    ballsRef.current = balls;
    setDisplayBalls(balls);
    setFinishedBalls([]);
    setExplosions([]);
    setStatusText('🎯 레이스 시작!');
    setPhase('dropping');
    onStart();
  };

  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (explosionTimerRef.current) clearInterval(explosionTimerRef.current);
    
    finishCountRef.current = 0;
    ballsRef.current = [];
    setDisplayBalls([]);
    setFinishedBalls([]);
    setExplosions([]);
    setStatusText('');
    setPhase('idle');
  };

  // Get winners (last to finish)
  const getWinners = () => {
    return [...finishedBalls]
      .sort((a, b) => b.finishOrder - a.finishOrder)
      .slice(0, winnersCount);
  };

  const winners = phase === 'complete' ? getWinners() : [];

  return (
    <div className={styles.container}>
      <div className={styles.boardWrapper}>
        <div className={styles.board}>
          {/* Funnel walls */}
          <svg className={styles.funnelSvg} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
          <defs>
            <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--neon-purple)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Left wall */}
          <path
            d={`M 20 20 
                Q 10 ${BOARD_HEIGHT/2} ${(BOARD_WIDTH - EXIT_WIDTH) / 2} ${EXIT_Y}
                L ${(BOARD_WIDTH - EXIT_WIDTH) / 2} ${BOARD_HEIGHT}
                L 0 ${BOARD_HEIGHT}
                L 0 0
                L 20 0 Z`}
            fill="url(#wallGradient)"
            stroke="var(--neon-cyan)"
            strokeWidth="2"
          />
          {/* Right wall */}
          <path
            d={`M ${BOARD_WIDTH - 20} 20 
                Q ${BOARD_WIDTH - 10} ${BOARD_HEIGHT/2} ${(BOARD_WIDTH + EXIT_WIDTH) / 2} ${EXIT_Y}
                L ${(BOARD_WIDTH + EXIT_WIDTH) / 2} ${BOARD_HEIGHT}
                L ${BOARD_WIDTH} ${BOARD_HEIGHT}
                L ${BOARD_WIDTH} 0
                L ${BOARD_WIDTH - 20} 0 Z`}
            fill="url(#wallGradient)"
            stroke="var(--neon-cyan)"
            strokeWidth="2"
          />
        </svg>

        {/* Pegs */}
        {pegs.map((peg, index) => (
          <div
            key={index}
            className={styles.peg}
            style={{
              left: peg.x - PEG_RADIUS,
              top: peg.y - PEG_RADIUS,
            }}
          />
        ))}

        {/* Explosions */}
        <AnimatePresence>
          {explosions.map(exp => (
            <motion.div
              key={exp.id}
              className={styles.explosion}
              style={{ left: exp.x, top: exp.y }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </AnimatePresence>

        {/* Balls */}
        {displayBalls.filter(b => !b.finished).map(ball => (
          <motion.div
            key={ball.id}
            className={styles.ball}
            style={{
              left: ball.x - BALL_RADIUS,
              top: ball.y - BALL_RADIUS,
              backgroundColor: ball.color,
              boxShadow: `0 0 15px ${ball.color}`,
            }}
          >
            <span className={styles.ballName}>{ball.name}</span>
          </motion.div>
        ))}

        {/* Exit hole */}
        <div 
          className={styles.exitHole}
          style={{
            left: (BOARD_WIDTH - EXIT_WIDTH) / 2,
            width: EXIT_WIDTH,
          }}
        >
          <span className={styles.exitLabel}>🏁 결승점</span>
        </div>

          {/* Finish order display */}
          <div className={styles.finishList}>
            <div className={styles.finishTitle}>도착 순서</div>
            {finishedBalls.slice(-8).reverse().map((ball, idx) => (
              <motion.div
                key={ball.id}
                className={`${styles.finishItem} ${idx < winnersCount ? styles.isWinner : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ borderColor: ball.color }}
              >
                <span className={styles.finishRank}>
                  {finishedBalls.length - finishedBalls.indexOf(ball)}위
                </span>
                <span className={styles.finishName}>{ball.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Winner Display */}
      <AnimatePresence>
        {phase === 'complete' && winners.length > 0 && (
          <motion.div
            className={styles.winnerDisplay}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <h3 className={styles.winnerTitle}>🏆 최후의 생존자 🏆</h3>
            <p className={styles.winnerSubtitle}>마지막까지 버틴 당첨자!</p>
            <div className={styles.winnerList}>
              {winners.map((ball, index) => (
                <motion.div
                  key={ball.id}
                  className={styles.winnerItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                  style={{ 
                    borderColor: ball.color,
                    boxShadow: `0 0 20px ${ball.color}40`
                  }}
                >
                  <span className={styles.winnerIcon}>🎊</span>
                  <span className={styles.winnerName}>{ball.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className={styles.controls}>
        {phase === 'idle' && (
          <button className="btn btn-primary" onClick={handleStart}>
            🎯 레이스 시작
          </button>
        )}
        {phase === 'dropping' && (
          <div className={styles.statusText}>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {statusText} ({displayBalls.filter(b => !b.finished).length}명 남음)
            </motion.span>
          </div>
        )}
        {phase === 'complete' && (
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
