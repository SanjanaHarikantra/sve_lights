import React from 'react';
import styles from './Legacy.module.css';

const Legacy: React.FC = () => {
  return (
    <section id="philosophy" className={styles.legacySection}>
      <div className={styles.container}>
        <div className={styles.textContent}>
          <span className={styles.overline}>OUR LEGACY</span>
          <h2 className={styles.serifHeading}>A Legacy <br /> Of Light.</h2>
          <p className={styles.bodyText}>
            Founded on the principle that light is the most powerful element of design, 
            SVE Lights has spent over fifteen years transforming the skylines and 
            interiors of Mangaluru and beyond.
          </p>
          <p className={styles.bodyText}>
            What began as a boutique studio has evolved into a premier lighting atelier, trusted by
                            leading architects. We do not simply fill a room with light; we define its character,
                            ensuring every installation is a timeless signature of luxury.
          </p>
          
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>15+</span>
              <span className={styles.statLabel}>YEARS OF CRAFT</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>BESPOKE PROJECTS</span>
            </div>
          </div>
        </div>

        <div className={styles.imageFrame}>
           <div className={styles.mainImage}>
             <img
               src="/sv1.jpeg"
               alt="SVE Lights legacy showcase"
               className={styles.legacyImage}
             />
             <span className={styles.imageOverlayText}>The Atelier</span>
           </div>
           <div className={styles.floatingBox}></div>
        </div>
      </div>
    </section>
  );
};

export default Legacy;
