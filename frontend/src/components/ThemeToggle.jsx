import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
        isDark
          ? 'border-white/10 bg-white/[0.05] hover:border-[#22c55e]/25 hover:bg-[#22c55e]/10'
          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50'
      } ${className}`}
    >
      <span
        className={`material-symbols-outlined text-lg transition-all duration-200 group-hover:scale-110 ${
          isDark ? 'text-white/80 group-hover:text-[#22c55e]' : 'text-slate-600 group-hover:text-emerald-600'
        }`}
      >
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
