import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { ThemeMode } from '../../types';
import styles from './ThemeSwitcher.module.css';

const themes: { mode: ThemeMode; icon: string; label: string; color: string }[] = [
  { mode: 'neon', icon: '🌈', label: '네온', color: '#8338ec' },
  { mode: 'light', icon: '☀️', label: '라이트', color: '#f59e0b' },
  { mode: 'blue', icon: '🌊', label: '블루', color: '#3b82f6' },
  { mode: 'night', icon: '🌙', label: '나이트', color: '#4b5563' },
];

export function ThemeSwitcher() {
  const themeMode = useStore((state) => state.themeMode);
  const setThemeMode = useStore((state) => state.setThemeMode);

  return (
    <div className={styles.container}>
      <span className={styles.label}>테마</span>
      <div className={styles.buttons}>
        {themes.map((theme) => (
          <motion.button
            key={theme.mode}
            className={`${styles.themeBtn} ${themeMode === theme.mode ? styles.active : ''}`}
            style={{ '--theme-color': theme.color } as React.CSSProperties}
            onClick={() => setThemeMode(theme.mode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={theme.label}
          >
            <span className={styles.icon}>{theme.icon}</span>
            <span className={styles.themeName}>{theme.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
