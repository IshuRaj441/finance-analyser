import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  glass?: boolean
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, glass, glow, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white font-medium hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 active:scale-95',
      secondary: 'bg-surface-200 hover:bg-surface-300 text-text-primary font-medium hover:scale-105 active:scale-95',
      ghost: 'hover:bg-surface-200/50 text-text-secondary hover:text-text-primary font-medium',
      danger: 'bg-danger hover:bg-danger-600 text-white font-medium hover:scale-105 hover:shadow-lg hover:shadow-danger-500/25 active:scale-95',
      outline: 'border border-border/50 text-text-primary hover:bg-surface-200/50 font-medium',
      success: 'bg-secondary hover:bg-secondary-600 text-white font-medium hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/25 active:scale-95',
      warning: 'bg-accent hover:bg-accent-600 text-white font-medium hover:scale-105 hover:shadow-lg hover:shadow-accent-500/25 active:scale-95'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    const classes = twMerge(
      baseClasses,
      variants[variant],
      sizes[size],
      glass && 'glass',
      glow && 'animate-glow',
      className
    )

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
