import React, { useEffect, useState } from 'react';
import styles from './ReviewsPage.module.css';

type CustomerReview = {
  id: number;
  service: string;
  rating: number;
  message: string;
  createdAt: string;
};

type FeedbackResponse = {
  feedback?: CustomerReview[];
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
};

const getApiErrorMessage = (response: Response, bodyText: string) => {
  const trimmed = bodyText.trim();

  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return 'API returned HTML instead of JSON. Check that the backend server is running and that VITE_API_URL is correct.';
  }

  if (!trimmed) {
    return `Request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(trimmed) as { error?: string };
    return parsed.error || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
};

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ''}/api/feedback?page=${page}&limit=12`
        );
        const bodyText = await response.text();

        if (!response.ok) {
          throw new Error(getApiErrorMessage(response, bodyText));
        }

        const data = (bodyText ? JSON.parse(bodyText) : {}) as FeedbackResponse;
        setReviews(data.feedback ?? []);
        setHasMore(Boolean(data.pagination?.hasMore));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load reviews.');
        setReviews([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReviews();
  }, [page]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>CUSTOMER REVIEWS</span>
        <h1 className={styles.title}>What Our Customers Say</h1>
        <p className={styles.copy}>Real feedback submitted by customers from the website.</p>
        <div className={styles.headerActions}>
          <a href="/#consultation" className={styles.homeBtn}>
            Back To Home
          </a>
        </div>
      </div>

      {isLoading ? <p className={styles.hint}>Loading reviews...</p> : null}
      {!isLoading && errorMessage ? <p className={styles.hint}>Unable to load reviews: {errorMessage}</p> : null}
      {!isLoading && !errorMessage && reviews.length === 0 ? (
        <p className={styles.hint}>No reviews found yet.</p>
      ) : null}

      {!isLoading && !errorMessage && reviews.length > 0 ? (
        <div className={styles.grid}>
          {reviews.map((review) => (
            <article key={review.id} className={styles.card}>
              <div className={styles.topRow}>
                <span className={styles.service}>{review.service}</span>
                <span className={styles.rating}>
                  {'★'.repeat(Math.min(Math.max(review.rating, 1), 5))}
                </span>
              </div>
              <p className={styles.message}>{review.message}</p>
              <span className={styles.date}>
                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage ? (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className={styles.pageText}>Page {page}</span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasMore}
          >
            Next
          </button>
        </div>
      ) : null}
    </main>
  );
};

export default ReviewsPage;
