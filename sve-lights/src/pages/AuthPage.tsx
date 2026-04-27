import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './pages.css';

const AuthPage = () => {
  const { isAuthenticated, isAdmin, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    wantsAdmin: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      if (mode === 'login') {
        await login(formState.email, formState.password);
      } else {
        await register(
          formState.name,
          formState.email,
          formState.password,
          formState.wantsAdmin
        );
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  }

  return (
    <div className="page authPage">
      <section className="authCard">
        <span className="eyebrow">Secure Access</span>
        <h1>{mode === 'login' ? 'Login to your account' : 'Create an account'}</h1>
        <p>
          Users can browse products. Admins can manage products and stock securely through the
          protected dashboard.
        </p>

        <div className="toggleRow">
          <button
            type="button"
            className={mode === 'login' ? 'toggleActive' : 'toggleButton'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'toggleActive' : 'toggleButton'}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="fieldGroup">
              <span>Name</span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </label>
          ) : null}

          <label className="fieldGroup">
            <span>Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </label>

          <label className="fieldGroup">
            <span>Password</span>
            <input
              type="password"
              minLength={6}
              value={formState.password}
              onChange={(event) =>
                setFormState((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>

          {mode === 'register' ? (
            <label className="checkboxRow">
              <input
                type="checkbox"
                checked={formState.wantsAdmin}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, wantsAdmin: event.target.checked }))
                }
              />
              <span>Request admin role for the first account only</span>
            </label>
          ) : null}

          {error ? <div className="stateCard errorCard compactCard">{error}</div> : null}

          <button className="primaryButton" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login'
                : 'Register account'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AuthPage;
