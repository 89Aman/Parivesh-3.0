import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import authService, { getDefaultRouteForUser } from '../services/authService';
import { getApiErrorMessage } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let isActive = true;

    const finishOAuth = async () => {
      const oauthError = searchParams.get('error_description') || searchParams.get('error');
      if (oauthError) {
        toast.error(oauthError);
        navigate('/login', { replace: true });
        return;
      }

      const code = searchParams.get('code');
      if (!code) {
        toast.error('No OAuth authorization code was returned.');
        navigate('/login', { replace: true });
        return;
      }

      try {
        const user = await authService.completeOAuthCallback(code);
        if (!isActive || !user) {
          return;
        }

        toast.success('Signed in successfully.');
        navigate(getDefaultRouteForUser(user), { replace: true });
      } catch (error) {
        if (!isActive) {
          return;
        }

        toast.error(getApiErrorMessage(error, 'Unable to complete Google sign-in.'));
        navigate('/login', { replace: true });
      }
    };

    finishOAuth();

    return () => {
      isActive = false;
    };
  }, [navigate, searchParams, toast]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-primary/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Parivesh 3.0</p>
        <h1 className="mt-3 text-2xl font-black text-slate-900">Completing Google sign-in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Finalizing your Supabase session and loading your portal access.
        </p>
      </div>
    </main>
  );
};

export default AuthCallback;
