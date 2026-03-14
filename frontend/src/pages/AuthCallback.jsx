import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { supabase } from '../supabase';
import authService, { getDefaultRouteForUser } from '../services/authService';
import { getApiErrorMessage } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let isActive = true;
    let hasCompleted = false;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const complete = (user) => {
      if (!isActive || !user || hasCompleted) {
        return;
      }

      hasCompleted = true;
      clearTimeout(timeout);
      toast.success('Signed in successfully.');
      navigate(getDefaultRouteForUser(user), { replace: true });
    };

    const finishOAuth = async () => {
      const oauthError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

      if (oauthError) {
        toast.error(oauthError);
        navigate('/login', { replace: true });
        return;
      }

      const user = await authService.completeOAuthCallback();
      complete(user);
    };

    const timeout = setTimeout(() => {
      if (!isActive) {
        return;
      }

      toast.error('Google sign-in session was not established.');
      navigate('/login', { replace: true });
    }, 8000);

    finishOAuth().catch((error) => {
      if (!isActive) {
        return;
      }

      toast.error(getApiErrorMessage(error, 'Unable to complete Google sign-in.'));
      navigate('/login', { replace: true });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (!isActive) {
        return;
      }

      if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED') {
        return;
      }

      try {
        const user = await authService.completeOAuthCallback();
        complete(user);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to complete Google sign-in.'));
        navigate('/login', { replace: true });
      }
    });

    return () => {
      isActive = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
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
