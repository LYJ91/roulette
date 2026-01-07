import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Navigation.module.css';

const navItems = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/classes', label: '반 관리', icon: '🏫' },
  { path: '/students', label: '학생 관리', icon: '👨‍🎓' },
  { path: '/settings', label: '설정', icon: '⚙️' },
  { path: '/draw', label: '추첨', icon: '🎯' },
];

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {navItems.map((item, index) => (
          <motion.li
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}
