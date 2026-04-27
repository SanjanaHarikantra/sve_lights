import Navbar from '../components/Navbar/Navbar';
import ReviewsPage from '../components/ReviewsPage/ReviewsPage';
import Footer from '../components/Footer/Footer';
import { useTheme } from '../hooks/useTheme';

const ReviewsRoutePage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
      <ReviewsPage />
      <Footer />
    </>
  );
};

export default ReviewsRoutePage;
