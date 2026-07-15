import { cn } from '../../utils';

const variants = {
  primary: 'btn-primary text-white font-semibold',
  secondary: 'bg-dark-surface border border-dark-border text-white hover:bg-dark-hover font-semibold',
  gold: 'btn-gold font-semibold',
  ghost: 'text-gray-400 hover:text-white hover:bg-dark-surface font-medium',
  danger: 'bg-red-600 text-white hover:bg-red-700 font-semibold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
  icon: 'p-2 rounded-xl',
};

const Button = ({ children, variant = 'primary', size = 'md', className, loading, disabled, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
