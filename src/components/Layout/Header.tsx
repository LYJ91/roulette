import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <motion.div
          className={styles.logoIcon}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          🎰
        </motion.div>
        <motion.span
          className={styles.logoText}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          행운의 룰렛
        </motion.span>
      </Link>
    </header>
  );
}
