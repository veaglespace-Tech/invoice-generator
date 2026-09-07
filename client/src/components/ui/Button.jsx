import React from 'react';
export const Button = React.forwardRef(
  (
    { className = '', variant = 'primary', size = 'md', children, ...props },
    ref
  ) => {
    const baseStyles =
      'btn hover:scale-[1.02] hover:shadow-md transition-all duration-300';
    const variants = {
      primary: 'btn-primary text-white disabled:text-slate-400 dark:disabled:text-slate-500',
      secondary: 'btn-secondary text-white disabled:text-slate-400 dark:disabled:text-slate-500',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-error text-white disabled:text-slate-400 dark:disabled:text-slate-500'
    };
    const sizes = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg'
    };
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
