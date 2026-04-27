import { Link, Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';
import { useAuth } from '../../context/useAuth';

const AppShell = () => {
  const { isAdmin, isAuthenticated, logout, user } = useAuth();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.brand}>
            <span className={styles.eyebrow}>SVE Lights</span>
            <span className={styles.title}>Product Studio</span>
          </Link>

          <div className={styles.links}>
            <Link to="/">Products</Link>
            {isAdmin ? <Link to="/admin">Admin Dashboard</Link> : null}
            {isAuthenticated ? (
              <>
                <span className={styles.userPill}>
                  {user?.name} · {user?.role}
                </span>
                <button type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth">Login / Register</Link>
            )}
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
