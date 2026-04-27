import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

interface NavProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

const Navbar: React.FC<NavProps> = ({ isDark, onToggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isReviewsPage = window.location.pathname === '/customer-reviews';
  const { isAdmin, isAuthenticated, logout } = useAuth();

  const getNavHref = (hash: string) => (isReviewsPage ? `/${hash}` : hash);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={styles.glassNav}>
      <a href={getNavHref('#atelier')} className={styles.logoGroup}>
        <div className={styles.logoCircle}>
          {/* Using a placeholder or your local logo.png */}
          <img src="https://tse2.mm.bing.net/th/id/OIP.Xj1UuA_XvoOJRZPxEJINcgHaHa?pid=Api&P=0&h=180" alt="SVE" width="30" />
        </div>
        <div className={styles.logoText}>
          <span className={styles.brand}>SVE LIGHTS</span>
          <span className={styles.atelier}>Royal Atelier</span>
        </div>
      </a>

      <div className={styles.menu}>
        <div className={styles.links}>
          <a href={getNavHref('#atelier')}>The Atelier</a>
          <a href={getNavHref('#collections')}>Collections</a>
          <a href={getNavHref('#philosophy')}>Philosophy</a>
          <a href={getNavHref('#contact')}>Contact Us</a>
          {isAdmin ? <a href="/admin/dashboard">Admin</a> : null}
          {isAuthenticated ? (
            <button type="button" onClick={logout}>
              Logout
            </button>
          ) : null}
        </div>
        
        <div className={styles.actions}>
          <button className={styles.themeBtn} onClick={onToggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href={getNavHref('#consultation')} className={styles.consultBtn}>Private Consultation</a>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div id="mobile-nav-menu" className={styles.mobileMenu} role="menu">
          <a href={getNavHref('#atelier')} onClick={closeMobileMenu}>The Atelier</a>
          <a href={getNavHref('#collections')} onClick={closeMobileMenu}>Collections</a>
          <a href={getNavHref('#philosophy')} onClick={closeMobileMenu}>Philosophy</a>
          <a href={getNavHref('#contact')} onClick={closeMobileMenu}>Contact Us</a>
          {isAdmin ? <a href="/admin/dashboard" onClick={closeMobileMenu}>Admin</a> : null}
          {isAuthenticated ? (
            <button type="button" className={styles.mobileConsultBtn} onClick={() => {
              logout();
              closeMobileMenu();
            }}>
              Logout
            </button>
          ) : null}
          <a href={getNavHref('#consultation')} className={styles.mobileConsultBtn} onClick={closeMobileMenu}>
            Private Consultation
          </a>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
