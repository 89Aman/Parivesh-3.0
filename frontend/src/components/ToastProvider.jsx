import React, { createContext, useContext, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

// Green confetti burst for success actions
export const fireSuccessConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#16a34a'],
    ticks: 60,
    gravity: 1.2,
    scalar: 0.9,
  });
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, dismissing: false }]);

    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, dismissing: true } : t))
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);

    // Fire confetti on success toasts
    if (type === 'success') {
      fireSuccessConfetti();
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, dismissing: true } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const iconMap = {
    success: 'check',
    error: 'close',
    info: 'info',
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.dismissing ? 'dismissing' : ''}`}
          >
            <span className="toast-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {iconMap[toast.type]}
              </span>
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
            {!toast.dismissing && <div className="toast-progress" />}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
