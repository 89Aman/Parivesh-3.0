const themeStyles = {
  light: {
    title: 'text-slate-900',
    subtitle: 'text-slate-500',
  },
  primary: {
    title: 'text-primary',
    subtitle: 'text-primary/70',
  },
  dark: {
    title: 'text-white',
    subtitle: 'text-white/65',
  },
};

const sizeStyles = {
  compact: {
    icon: 'h-8 w-8',
    title: 'text-base',
    subtitle: 'text-[10px]',
  },
  regular: {
    icon: 'h-9 w-9',
    title: 'text-lg',
    subtitle: 'text-[10px]',
  },
  large: {
    icon: 'h-10 w-10',
    title: 'text-xl',
    subtitle: 'text-xs',
  },
};

const PariveshBrand = ({
  title = 'PARIVESH 3.0',
  subtitle,
  theme = 'light',
  size = 'regular',
  className = '',
}) => {
  const palette = themeStyles[theme] || themeStyles.light;
  const dimensions = sizeStyles[size] || sizeStyles.regular;

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img alt="Parivesh logo" className={`${dimensions.icon} shrink-0 object-contain`} src="/parivesh-brand-icon.svg" />
      <div className="flex flex-col">
        <h2 className={`${dimensions.title} font-black leading-tight tracking-tight ${palette.title}`}>{title}</h2>
        {subtitle ? <p className={`${dimensions.subtitle} uppercase tracking-[0.18em] font-bold ${palette.subtitle}`}>{subtitle}</p> : null}
      </div>
    </div>
  );
};

export default PariveshBrand;