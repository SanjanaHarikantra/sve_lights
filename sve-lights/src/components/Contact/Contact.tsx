import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import styles from './Contact.module.css';

/* Legacy copied values retained temporarily for reference.
const legacyContactDetails = [
  {
    icon: MapPin,
    label: 'Studio',
    value: 'Shop No :F07 D-No 2-11/26(27) ” Green City ” Behind Naganakatte N.H 66 Thokkottu Mangalore .',
    note: 'By appointment for residential and hospitality lighting consultations.',
  },
  {
    icon: Phone,
    label: 'Call',
    value: '+917829738999 , 7892460453',
    note: 'Monday to Saturday, 10:00 AM to 7:00 PM.',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'svelightsindia@gmail.com',
    note: 'Share your layout, moodboard, or project timeline for a tailored response.',
  },
];
*/

const contactDetails = [
  {
    icon: MapPin,
    label: 'Studio',
    value:
      'Shop No :F07 D-No 2-11/26(27), Green City, Behind Naganakatte, N.H 66, Thokkottu, Mangalore.',
    note: 'By appointment for residential and hospitality lighting consultations.',
  },
  {
    icon: Phone,
    label: 'Call',
    value: '+91 7829738999, 7892460453',
    note: 'Monday to Saturday, 10:00 AM to 7:00 PM.',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'svelightsindia@gmail.com',
    note: 'Share your layout, moodboard, or project timeline for a tailored response.',
  },
];

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

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setStatus('submitting');
      setStatusMessage('');

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/project-enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
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
      setStatusMessage('Thanks for reaching out. Your project inquiry has been saved.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      setStatus('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Unable to submit your inquiry right now.'
      );
    }
  };

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>CONTACT US</span>
          <h2 className={styles.title}>Let&apos;s design the right light for your space.</h2>
          <p className={styles.copy}>
            Connect with SVE Lights for bespoke lighting consultation, product guidance, and
            project support. We help homeowners, architects, and commercial clients shape
            spaces that feel refined and functional.
          </p>
        </div>

        <div className={styles.grid}>
          {contactDetails.map(({ icon: Icon, label, value, note }) => (
            <article key={label} className={styles.card}>
              <div className={styles.iconWrap}>
                <Icon size={18} />
              </div>
              <span className={styles.cardLabel}>{label}</span>
              <h3 className={styles.cardValue}>{value}</h3>
              <p className={styles.cardNote}>{note}</p>
            </article>
          ))}
        </div>

        <div className={styles.contactLayout}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <span className={styles.formEyebrow}>Project Inquiry</span>
              <h3 className={styles.formTitle}>Share your project details with us.</h3>
              <p className={styles.formCopy}>
                Tell us a little about your requirement and our team will get back to you with
                the right next step.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldRow}>
                <label className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Your Name (required)</span>
                  <input
                    className={styles.input}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Your Email (required)</span>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </label>
              </div>

              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Contact Number (required)</span>
                <input
                  className={styles.input}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </label>

              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Your Message</span>
                <textarea
                  className={styles.textarea}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us about your lighting requirement"
                />
              </label>

              {statusMessage ? (
                <p
                  className={`${styles.statusMessage} ${
                    status === 'success' ? styles.successMessage : styles.errorMessage
                  }`}
                >
                  {statusMessage}
                </p>
              ) : null}

              <button className={styles.submitButton} type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Saving...' : 'Send Inquiry'}
              </button>
            </form>
          </div>

          <div className={styles.mapCard}>
            <div className={styles.mapHeader}>
              <span className={styles.formEyebrow}>Map Location</span>
              <h3 className={styles.mapTitle}>Visit our Mangaluru studio.</h3>
              <p className={styles.mapCopy}>
                Find us at Green City, behind Naganakatte on N.H 66, Thokkottu. Visit for
                product discovery, design discussions, and project consultation.
              </p>
            </div>

            <div className={styles.mapFrame}>
              <iframe
                title="SVE Lights location"
                src="https://www.google.com/maps?q=Shop%20No%20%3AF07%20D-No%202-11%2F26(27)%20Green%20City%20Behind%20Naganakatte%20N.H%2066%20Thokkottu%20Mangalore&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className={styles.addressBar}>
              <MapPin size={16} />
              <span>
                Shop No :F07 D-No 2-11/26(27), Green City, Behind Naganakatte, N.H 66,
                Thokkottu, Mangalore.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
