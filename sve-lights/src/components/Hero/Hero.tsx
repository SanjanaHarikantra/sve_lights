import React, { useState, useEffect } from 'react';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = ["/sv1.jpeg", "/sv2.jpeg", "/sv3.jpeg"];

  // Carousel Logic matching your HTML setInterval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section id="atelier" className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          
          {/* Left Content Side */}
          <div className={styles.contentSide}>
            <div className={styles.taglineWrapper}>
              <div className={styles.horizontalLine} />
              <span className={styles.taglineText}>Excellence in Illumination</span>
            </div>
            
            <h1 className={styles.fluidH1}>
              Sculpting <br />
              <span className={styles.maroonGradientText}>Pure Emotion.</span>
            </h1>
            
            <p className={styles.heroDesc}>
              Where architectural precision meets royal aesthetics. SVE Lights defines the gold standard for bespoke luxury lighting.
            </p>
            
            <div className={styles.ctaGroup}>
              <button className={styles.btnMaroon}>Explore Collections</button>
              <a href="#philosophy" className={styles.storyBtn}>
                <span className={styles.storyText}>The Story</span>
                <div className={styles.arrowCircle}>
                  <i className="fas fa-arrow-right"></i>
                </div>
              </a>
            </div>
          </div>

          {/* Right Visual Side (The Carousel) */}
          <div className={styles.visualSide}>
            <div className={styles.luxuryCard}>
              <div className={styles.carouselContainer}>
                <div 
                  className={styles.carouselTrack} 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {images.map((img, index) => (
                    <div key={index} className={styles.carouselSlide}>
                      <img src={img} alt={`Slide ${index + 1}`} />
                    </div>
                  ))}
                </div>

                {/* Indicators exactly like your HTML */}
                <div className={styles.indicatorWrapper}>
                  {images.map((_, index) => (
                    <div 
                      key={index}
                      className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
