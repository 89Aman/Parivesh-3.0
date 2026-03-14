const SimpleSpinner = ({ title = 'Loading...', subtitle = '' }) => {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50"
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
};

export default SimpleSpinner;
