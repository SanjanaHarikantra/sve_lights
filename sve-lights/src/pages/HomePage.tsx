import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import Collection from '../components/Collection/Collection';
import Legacy from '../components/Legacy/Legacy';
import Contact from '../components/Contact/Contact';
import Feedback from '../components/Feedback/Feedback';
import Footer from '../components/Footer/Footer';
import { useTheme } from '../hooks/useTheme';

const HomePage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
      <Hero />
      <Collection />
      <Legacy />
      <Contact />
      <Feedback />
      <Footer />
    </>
  );
};

export default HomePage;
