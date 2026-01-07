import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student } from '../../types';
import { NEON_COLORS } from '../../utils/random';
import styles from './PinballAnimation.module.css';

interface Peg {
  x: number;
  y: number;
  hit: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

interface Slot {
  student: Student;
  x: number;
  width: number;
  selected: boolean;
}

interface Props {
  students: Student[];
  winnersCount: number;
  onComplete: (winners: Student[]) => void;
  onStart: () => void;
}

const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 500;
const PEG_RADIUS = 8;
const BALL_RADIUS = 12;
const SLOT_HEIGHT = 60;

export function PinballAnimation({ students, winnersCount, onComplete, onStart }: Props) {
  const animationRef = useRef<number | undefined>(undefined);
  const [ball, setBall] = useState<Ball | null>(null);
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [winners, setWinners] = useState<Student[]>([]);
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'complete'>('idle');
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [hitPegs, setHitPegs] = useState<Set<number>>(new Set());
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  // Generate pegs in a triangular pattern
  const generatePegs = useCallback(() => {
    const newPegs: Peg[] = [];
    const rows = 8;
    const startY = 80;
    const rowSpacing = 45;
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * 45;
      const startX = (BOARD_WIDTH - rowWidth) / 2;
      
      for (let col = 0; col < pegsInRow; col++) {
        newPegs.push({
          x: startX + col * 45,
          y: startY + row * rowSpacing,
          hit: false,
        });
      }
    }
    
    setPegs(newPegs);
  }, []);

  // Generate slots based on students
  const generateSlots = useCallback(() => {
    if (students.length === 0) return;
    
    const slotWidth = Math.min(60, (BOARD_WIDTH - 20) / students.length);
    const totalWidth = slotWidth * students.length;
    const startX = (BOARD_WIDTH - totalWidth) / 2;
    
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    
    const newSlots: Slot[] = shuffled.map((student, index) => ({
      student,
      x: startX + index * slotWidth,
      width: slotWidth,
      selected: false,
    }));
    
    setSlots(newSlots);
  }, [students]);

  useEffect(() => {
    generatePegs();
    generateSlots();
  }, [generatePegs, generateSlots]);

  // Create particle effect
  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 500);
  }, []);

  // Physics simulation for ball
  const updateBallPhysics = useCallback((currentBall: Ball): Ball => {
    const gravity = 0.3;
    const friction = 0.98;
    const bounce = 0.6;
    
    let { x, y, vx, vy, active } = currentBall;
    
    if (!active) return currentBall;
    
    // Apply gravity
    vy += gravity;
    
    // Apply velocity
    x += vx;
    y += vy;
    
    // Wall collision
    if (x - BALL_RADIUS < 0) {
      x = BALL_RADIUS;
      vx = -vx * bounce;
    }
    if (x + BALL_RADIUS > BOARD_WIDTH) {
      x = BOARD_WIDTH - BALL_RADIUS;
      vx = -vx * bounce;
    }
    
    // Peg collision
    pegs.forEach((peg, index) => {
      const dx = x - peg.x;
      const dy = y - peg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = BALL_RADIUS + PEG_RADIUS;
      
      if (dist < minDist) {
        // Collision response
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;
        
        x += Math.cos(angle) * overlap;
        y += Math.sin(angle) * overlap;
        
        // Reflect velocity
        const normalX = dx / dist;
        const normalY = dy / dist;
        const dotProduct = vx * normalX + vy * normalY;
        
        vx = (vx - 2 * dotProduct * normalX) * bounce;
        vy = (vy - 2 * dotProduct * normalY) * bounce;
        
        // Add some randomness
        vx += (Math.random() - 0.5) * 2;
        
        // Mark peg as hit
        if (!hitPegs.has(index)) {
          setHitPegs((prev) => new Set([...prev, index]));
          createParticles(peg.x, peg.y, NEON_COLORS[index % NEON_COLORS.length]);
        }
      }
    });
    
    // Apply friction
    vx *= friction;
    
    // Check if ball reached bottom
    if (y > BOARD_HEIGHT - SLOT_HEIGHT) {
      active = false;
    }
    
    return { x, y, vx, vy, active };
  }, [pegs, hitPegs, createParticles]);

  // Animation loop
  useEffect(() => {
    if (phase !== 'dropping' || !ball) return;
    
    const animate = () => {
      setBall((prev) => {
        if (!prev) return null;
        const updated = updateBallPhysics(prev);
        
        if (!updated.active) {
          // Ball reached bottom - determine winner
          const winningSlot = slots.find(
            (slot) => updated.x >= slot.x && updated.x < slot.x + slot.width
          );
          
          if (winningSlot) {
            const newWinner = winningSlot.student;
            
            setWinners((prev) => [...prev, newWinner]);
            setSlots((prevSlots) =>
              prevSlots.map((s) =>
                s.student.id === newWinner.id ? { ...s, selected: true } : s
              )
            );
            
            // Check if we need more winners
            const nextWinnerIndex = currentWinnerIndex + 1;
            if (nextWinnerIndex < winnersCount) {
              setCurrentWinnerIndex(nextWinnerIndex);
              // Drop another ball after delay
              setTimeout(() => {
                dropNewBall();
                setHitPegs(new Set());
              }, 1500);
            } else {
              // All winners selected
              setTimeout(() => {
                setPhase('complete');
              }, 1000);
            }
          }
          
          return null;
        }
        
        return updated;
      });
      
      if (ball?.active) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, ball, updateBallPhysics, slots, currentWinnerIndex, winnersCount]);

  // Notify parent when complete
  useEffect(() => {
    if (phase === 'complete' && winners.length === winnersCount) {
      onComplete(winners);
    }
  }, [phase, winners, winnersCount, onComplete]);

  const dropNewBall = () => {
    setBall({
      x: BOARD_WIDTH / 2 + (Math.random() - 0.5) * 40,
      y: 20,
      vx: (Math.random() - 0.5) * 3,
      vy: 0,
      active: true,
    });
  };

  const handleStart = () => {
    if (students.length < winnersCount) {
      alert(`최소 ${winnersCount}명의 학생이 필요합니다.`);
      return;
    }
    
    setWinners([]);
    setCurrentWinnerIndex(0);
    setHitPegs(new Set());
    generateSlots();
    setPhase('dropping');
    dropNewBall();
    onStart();
  };

  const handleReset = () => {
    setPhase('idle');
    setWinners([]);
    setBall(null);
    setCurrentWinnerIndex(0);
    setHitPegs(new Set());
    setSlots((prev) => prev.map((s) => ({ ...s, selected: false })));
    generateSlots();
  };

  const slotColors = useMemo(() => 
    students.map((_, i) => NEON_COLORS[i % NEON_COLORS.length]),
    [students]
  );

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {/* Neon border */}
        <div className={styles.neonBorder} />
        
        {/* Pegs */}
        {pegs.map((peg, index) => (
          <motion.div
            key={index}
            className={`${styles.peg} ${hitPegs.has(index) ? styles.pegHit : ''}`}
            style={{
              left: peg.x - PEG_RADIUS,
              top: peg.y - PEG_RADIUS,
            }}
            animate={hitPegs.has(index) ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.2 }}
          />
        ))}
        
        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={styles.particle}
              style={{
                left: particle.x,
                top: particle.y,
                background: particle.color,
              }}
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                scale: 0,
                opacity: 0,
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </AnimatePresence>
        
        {/* Ball */}
        {ball && (
          <motion.div
            className={styles.ball}
            style={{
              left: ball.x - BALL_RADIUS,
              top: ball.y - BALL_RADIUS,
            }}
            animate={{ rotate: ball.vx * 10 }}
          >
            <span className={styles.ballNumber}>{currentWinnerIndex + 1}</span>
          </motion.div>
        )}
        
        {/* Slots */}
        <div className={styles.slots}>
          {slots.map((slot, index) => (
            <motion.div
              key={slot.student.id}
              className={`${styles.slot} ${slot.selected ? styles.slotSelected : ''}`}
              style={{
                width: slot.width,
                '--slot-color': slotColors[index],
              } as React.CSSProperties}
              animate={slot.selected ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className={styles.slotName}>{slot.student.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Winner Display */}
      <AnimatePresence>
        {winners.length > 0 && (
          <motion.div
            className={styles.winnerDisplay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3 className={styles.winnerTitle}>🎯 당첨자 🎯</h3>
            <div className={styles.winnerList}>
              {winners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  className={styles.winnerItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <span className={styles.winnerIcon}>🎊</span>
                  <span className={styles.winnerName}>{winner.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.controls}>
        {phase === 'idle' && (
          <button className="btn btn-primary" onClick={handleStart}>
            🎯 추첨 시작
          </button>
        )}
        {phase === 'dropping' && (
          <div className={styles.droppingText}>
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              공 떨어지는 중... ({currentWinnerIndex + 1}/{winnersCount})
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
