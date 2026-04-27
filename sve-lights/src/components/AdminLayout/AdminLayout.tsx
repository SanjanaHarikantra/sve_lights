import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { useAuth } from '../../context/useAuth';

const AdminLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className={styles.adminShell}>
      <div className={styles.backdropGlow} />
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <span className={styles.eyebrow}>SVE Lights</span>
          <h1>Admin Atelier</h1>
          <p>Manage the catalog with the same polished feel as the storefront.</p>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            Products
          </NavLink>
          <NavLink to="/" className={styles.navLink}>
            Back to Home
          </NavLink>
        </nav>

        <div className={styles.accountCard}>
          <span className={styles.accountLabel}>Signed in</span>
          <strong>{user?.name || 'Admin User'}</strong>
          <span>{user?.role || 'admin'}</span>
          <button type="button" className={styles.logoutButton} onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainPanel}>
        <header className={styles.topBar}>
          <div>
            <span className={styles.topEyebrow}>Control Room</span>
            <h2>SVE Lights Admin Studio</h2>
          </div>
          <div className={styles.topBadge}>Storefront-matched UI</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
