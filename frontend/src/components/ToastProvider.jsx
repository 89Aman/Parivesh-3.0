import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toDisplayText = useCallback((message) => {
    if (typeof message === 'string') return message;
    if (message == null) return '';
    if (typeof message === 'number' || typeof message === 'boolean') return String(message);

    if (Array.isArray(message)) {
      return message
        .map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry)))
        .join(' | ');
    }

    if (typeof message === 'object') {
      return message.message || JSON.stringify(message);
    }

    return String(message);
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message: toDisplayText(message), type, dismissing: false }]);

    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, dismissing: true } : t))
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);

    return id;
  }, [toDisplayText]);

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

  const contextValue = useMemo(
    () => ({ addToast, removeToast, success, error, info }),
    [addToast, removeToast, success, error, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
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
