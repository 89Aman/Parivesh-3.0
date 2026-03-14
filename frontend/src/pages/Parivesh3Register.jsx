import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { ROUTES } from '../constants/routes';

const Parivesh3Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    organization: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      setIsSubmitting(true);
      const result = await authService.registerPP({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        organization: formData.organization,
        phone: formData.phone,
      });

      if (result?.requiresEmailVerification) {
        toast.success('Account created. Verify your email, then sign in.');
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      toast.success('Account created successfully!');
      navigate(ROUTES.PP_DASHBOARD, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
      {/* Left: Hero */}
      <section
        className="relative flex min-h-[38vh] w-full flex-col justify-between overflow-hidden p-8 lg:min-h-screen lg:w-[44%] lg:p-16"
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
        <div className="relative z-20 flex flex-col gap-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="material-symbols-outlined text-4xl text-accent lg:text-5xl">eco</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Project Proponent Onboarding</p>
              <h1 className="text-3xl font-black tracking-tighter text-white lg:text-5xl">Join PARIVESH</h1>
            </div>
          </div>
          <p className="max-w-md text-lg font-light text-white/90">
            Create your account to start managing environmental clearances.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: 'description', title: 'Fast submissions', text: 'Start a new application with guided forms and live workflow tracking.' },
              { icon: 'travel_explore', title: 'Track every milestone', text: 'Watch scrutiny, EDS, and committee stages from one workspace.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="material-symbols-outlined text-accent">{item.icon}</span>
                <p className="mt-2 text-sm font-bold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/75">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 text-xs uppercase tracking-[0.18em] text-white/50">Environment, Forest and Climate Change</div>
      </section>

      {/* Right: Form */}
      <section className="flex w-full items-center justify-center bg-[#f5fbf7] p-6 lg:w-[56%] lg:p-12">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-8 shadow-[0_24px_70px_-30px_rgba(22,101,52,0.35)] backdrop-blur-xl">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">
                Create account
              </h2>
              <p className="text-sm text-text-secondary">
                Anyone can join the Parivesh platform as a Project Proponent.
              </p>
            </div>

            <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleRegister}>
              <div className="relative sm:col-span-2">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  id="full_name"
                  name="full_name"
                  onChange={handleChange}
                  placeholder=" "
                  required
                  type="text"
                  value={formData.full_name}
                />
                <label className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent" htmlFor="full_name">
                  Full name
                </label>
              </div>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder=" "
                  required
                  type="email"
                  value={formData.email}
                />
                <label className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent" htmlFor="email">
                  Email address
                </label>
              </div>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  placeholder=" "
                  type="tel"
                  value={formData.phone}
                />
                <label className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent" htmlFor="phone">
                  Phone (optional)
                </label>
              </div>

              <div className="relative sm:col-span-2">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  id="organization"
                  name="organization"
                  onChange={handleChange}
                  placeholder=" "
                  type="text"
                  value={formData.organization}
                />
                <label className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent" htmlFor="organization">
                  Organization / company
                </label>
              </div>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 pr-12 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder=" "
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                />
                <label className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200/80 bg-white/90 px-4 pb-2.5 pt-6 pr-12 text-text-primary transition-all duration-200 placeholder:opacity-0 focus:border-accent focus:bg-white"
                  id="confirmPassword"
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder=" "
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                />
                <label className="absolute left-4 top-4 z-10 origin-left -translate-y-3 scale-75 text-sm text-text-secondary transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <button
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:pointer-events-none disabled:opacity-70 sm:col-span-2"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">What happens next</p>
              <p className="mt-1">After sign-up, you can begin filing proposals immediately. Email verification may be required depending on your auth configuration.</p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              className="font-semibold text-primary transition-colors duration-200 hover:text-primary-light"
                to={ROUTES.LOGIN}
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Parivesh3Register;
