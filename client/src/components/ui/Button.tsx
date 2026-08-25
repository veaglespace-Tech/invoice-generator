import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'btn hover:scale-[1.02] hover:shadow-md transition-all duration-300';
    
    const variants = {
      primary: 'btn-primary text-white',
      secondary: 'btn-secondary text-white',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-error text-white'
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
