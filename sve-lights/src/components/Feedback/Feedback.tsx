import React, { useState } from 'react';
import styles from './Feedback.module.css';
import { ChevronDown } from 'lucide-react';

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

const Feedback: React.FC = () => {
  const [service, setService] = useState('consultation');
  const [rating, setRating] = useState('5');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      setStatus('error');
      setStatusMessage('Please share your experience before submitting.');
      return;
    }

    try {
      setStatus('submitting');
      setStatusMessage('');

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service,
          rating: Number(rating),
          message,
        }),
      });
      const bodyText = await response.text();

      if (!response.ok) {
        throw new Error(getApiErrorMessage(response, bodyText));
      }

      try {
        JSON.parse(bodyText);
      } catch {
        throw new Error(
          'API returned an invalid response. Check that the backend server is returning JSON.'
        );
      }

      setStatus('success');
      setStatusMessage('Your feedback has been saved successfully.');
      setService('consultation');
      setRating('5');
      setMessage('');
    } catch (error) {
      setStatus('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Unable to submit feedback right now.'
      );
    }
  };

  return (
    <section id="consultation" className={styles.wrapper}>
      <div className={styles.feedbackCard}>
        <div className={styles.maroonPanel}>
          <span className={styles.label}>THE EXPERIENCE</span>
          <h2 className={styles.panelTitle}>Your Vision, <br /> Our Light.</h2>
          <p className={styles.panelDesc}>Share your feedback to help us refine the art of illumination.</p>
        </div>

        <div className={styles.formPanel}>
          <form className={styles.feedbackForm} onSubmit={handleSubmit}>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>SERVICE</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.selectBox}
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="installation">Installation</option>
                    <option value="bespoke">Bespoke Design</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>RATING</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.selectBox}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">5/5 Exquisite</option>
                    <option value="4">4/5 Fine</option>
                    <option value="3">3/5 Average</option>
                    <option value="2">2/5 Below Par</option>
                    <option value="1">1/5 Poor</option>
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '30px' }}>
              <textarea
                placeholder="Describe your experience..."
                className={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            {statusMessage && (
              <p
                className={`${styles.statusMessage} ${
                  status === 'success' ? styles.successMessage : styles.errorMessage
                }`}
              >
                {statusMessage}
              </p>
            )}

            <button type="submit" className={styles.submitBtn} disabled={status === 'submitting'}>
              {status === 'submitting' ? 'SAVING...' : 'SUBMIT FEEDBACK'}
            </button>

            <a
              href="/customer-reviews"
              target="_blank"
              rel="noreferrer"
              className={styles.viewReviewsBtn}
            >
              VIEW CUSTOMER REVIEWS
            </a>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Feedback;