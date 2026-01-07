import { motion, AnimatePresence } from 'framer-motion';
import styles from './AlertModal.module.css';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  onClose: () => void;
  confirmText?: string;
}

export function AlertModal({ 
  isOpen, 
  title, 
  message, 
  type = 'info',
  onClose,
  confirmText = '확인'
}: AlertModalProps) {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  const colors = {
    info: 'var(--neon-cyan)',
    warning: 'var(--neon-orange)',
    error: 'var(--neon-pink)',
    success: 'var(--neon-green)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            style={{ '--accent-color': colors[type] } as React.CSSProperties}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.icon}>{icons[type]}</div>
            {title && <h3 className={styles.title}>{title}</h3>}
            <p className={styles.message}>{message}</p>
            <button 
              className={styles.confirmBtn}
              style={{ background: colors[type] }}
              onClick={onClose}
            >
              {confirmText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
