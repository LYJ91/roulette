import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={`${styles.layout} bg-pattern`}>
      <Header />
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
