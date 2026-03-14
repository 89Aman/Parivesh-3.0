const PlantLoader = ({ title = 'Loading...', subtitle = 'Please wait.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center" role="status" aria-live="polite" aria-label={title}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
      <p className="text-lg font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
};

export default PlantLoader;
