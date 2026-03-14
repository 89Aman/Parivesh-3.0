import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { getSafeRouteForUser } from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { ROUTES } from '../constants/routes';

const portalCards = [
  {
    title: 'Admin',
    icon: 'admin_panel_settings',
    description: 'Manage users, sectors, and workflow templates.',
  },
  {
    title: 'Project Proponent',
    icon: 'engineering',
    description: 'Create and track environmental clearance applications.',
  },
  {
    title: 'Scrutiny',
    icon: 'fact_check',
    description: 'Review submissions and raise EDS items.',
  },
  {
    title: 'MoM Team',
    icon: 'history_edu',
    description: 'Prepare and finalize meeting minutes.',
  },
];

const Parivesh3Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      const destination = getSafeRouteForUser(user, from);
      navigate(destination, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate, location.state]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldownSeconds]);

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (cooldownSeconds > 0) {
      toast.error(`Too many attempts. Try again in ${cooldownSeconds} seconds.`);
      return;
    }

    if (!email || !password) {
      toast.error('Enter both email and password.');
      return;
    }
    try {
      setIsSubmitting(true);
      const { user: loggedInUser } = await login(email, password);
      toast.success('Signed in successfully.');
      const from = location.state?.from?.pathname;
      navigate(getSafeRouteForUser(loggedInUser, from), { replace: true });
    } catch (error) {
      const retryAfterSeconds = error?.retryAfterSeconds;
      if (typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0) {
        setCooldownUntil(Date.now() + retryAfterSeconds * 1000);
        setNow(Date.now());
      }
      toast.error(getApiErrorMessage(error, 'Unable to sign in.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
      {/* Left: Hero with gradient & glassmorphism cards */}
      <section
        className="relative flex min-h-[44vh] w-full flex-col justify-end overflow-hidden p-8 lg:min-h-screen lg:w-[58%] lg:p-16 lg:pr-12"
        style={{
          background: 'linear-gradient(145deg, #0f1f0f 0%, #166534 40%, #15803d 100%)',
        }}
      >
        <div className="absolute inset-0 z-0">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover opacity-25"
            src="/hero-bg.png"
          />
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(145deg, rgba(15,31,15,0.92) 0%, rgba(22,101,52,0.75) 50%, rgba(21,128,61,0.6) 100%)',
            }}
          />
        </div>

        <div className="relative z-20 flex max-w-2xl flex-col gap-8">
          <div className="flex items-center gap-4 animate-slide-up">
            <img
              alt="Parivesh icon"
              className="h-16 w-16 drop-shadow-sm lg:h-20 lg:w-20"
              src="/parivesh-brand-icon.svg"
            />
            <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-sm lg:text-7xl">
              PARIVESH 3.0
            </h1>
          </div>
          <p className="max-w-lg text-lg font-light leading-relaxed text-white/90 lg:text-xl animate-slide-up" style={{ animationDelay: '0.08s' }}>
            Unified environmental clearance workflow across proponent, scrutiny, and MoM portals.
          </p>

          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {portalCards.map((card, i) => (
              <div
                key={card.title}
                className="group rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:border-white/25 hover:bg-white/15 hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.25)] animate-slide-up"
                style={{ animationDelay: `${0.15 + i * 0.06}s` }}
              >
                <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-accent/20 transition-colors duration-200 group-hover:bg-accent/30">
                  <span className="material-symbols-outlined text-accent">{card.icon}</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-white">{card.title}</p>
                <p className="mt-1 text-sm text-white/80">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 mt-10 flex items-center gap-4 border-t border-white/10 pt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent/20 p-1">
            <img alt="Parivesh icon" className="h-full w-full object-contain" src="/parivesh-brand-icon.svg" />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">
            Ministry of Environment, Forest and Climate Change
          </p>
        </div>
      </section>

      {/* Right: Sign-in card */}
      <section className="flex w-full items-center justify-center bg-background-light p-6 lg:w-[42%] lg:p-12">
        <div className="flex w-full max-w-md flex-col gap-8 animate-fade-in">
          <div className="rounded-xl border border-primary/10 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">
                Sign in
              </h2>
              <p className="text-sm text-text-secondary">
                Sign in with your credentials to access your portal.
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleEmailLogin}>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  autoComplete="username"
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  type="email"
                  value={email}
                />
                <label
                  className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 transform text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent"
                  htmlFor="email"
                >
                  Email address
                </label>
              </div>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 pr-12 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <label
                  className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 transform text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent"
                  htmlFor="password"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 z-20 flex items-center text-slate-400 transition-colors hover:text-primary"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-light font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:pointer-events-none disabled:opacity-70"
                disabled={isSubmitting || cooldownSeconds > 0}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    Retry in {cooldownSeconds}s
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary">Session behaviour</p>
              <p className="mt-1 leading-relaxed">
                Sign-in is handled through Supabase Auth. Portal access still depends on your roles in Parivesh.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              className="font-semibold text-primary transition-colors duration-200 hover:text-primary-light"
              to={ROUTES.REGISTER}
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Parivesh3Login;
