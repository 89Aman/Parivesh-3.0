const LEVEL_STYLES = {
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400',
  HIGH: 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  LOW: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400',
};

const RiskBadge = ({ score, level, showScore = true }) => {
  const l = (level || 'LOW').toUpperCase();
  const style = LEVEL_STYLES[l] || LEVEL_STYLES.LOW;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      <span className="material-symbols-outlined text-[14px]">
        {l === 'CRITICAL' ? 'dangerous' : l === 'HIGH' ? 'warning' : l === 'MEDIUM' ? 'info' : 'check_circle'}
      </span>
      {showScore ? `${l} (${score ?? 0})` : l}
    </span>
  );
};

export default RiskBadge;
