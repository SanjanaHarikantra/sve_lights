import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.brand}>SVE LIGHTS</span>
        <span className={styles.location}>ROYAL ARCHITECTURE - MANGALURU</span>
      </div>

      <div className={styles.center}>
        <a href="#">INSTAGRAM</a>
        <a href="#">LINKEDIN</a>
        <a href="#contact">CONTACT</a>
      </div>

      <div className={styles.right}>&copy; 2026 SVE LIGHTS. ALL RIGHTS RESERVED.</div>
    </footer>
  );
};

export default Footer;