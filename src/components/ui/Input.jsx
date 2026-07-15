import { forwardRef } from 'react';
import { cn } from '../../utils';

const Input = forwardRef(({ label, error, className, type = 'text', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-400">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={cn(
          'input-dark w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
