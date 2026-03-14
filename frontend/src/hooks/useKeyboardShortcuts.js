import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const useKeyboardShortcuts = ({ onOpenSearch, onOpenHelp, onCloseAll }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let gBuffer = false;

    const handler = (e) => {
      // Don't fire when typing in inputs / textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      // Ctrl+K → global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Escape → close everything
      if (e.key === 'Escape') {
        onCloseAll?.();
        return;
      }

      // ? → open help
      if (e.key === '?') {
        onOpenHelp?.();
        return;
      }

      // N → new application
      if (e.key === 'n' || e.key === 'N') {
        navigate(ROUTES.PP_NEW_APPLICATION);
        return;
      }

      // G then D → go to dashboard
      if (e.key === 'g' || e.key === 'G') {
        gBuffer = true;
        setTimeout(() => { gBuffer = false; }, 800);
        return;
      }

      if (gBuffer) {
        if (e.key === 'd' || e.key === 'D') {
          navigate(ROUTES.PP_DASHBOARD);
          gBuffer = false;
        } else if (e.key === 'a' || e.key === 'A') {
          navigate(ROUTES.ADMIN_DASHBOARD);
          gBuffer = false;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate, onOpenSearch, onOpenHelp, onCloseAll]);
};

export default useKeyboardShortcuts;
