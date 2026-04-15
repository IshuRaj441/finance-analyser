import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, iconPosition = 'left', ...props }, ref) => {
    const baseClasses = 'block w-full px-4 py-2 border rounded-lg placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200'
    
    const defaultClasses = 'bg-surface-100/50 border-border/50 text-text-primary focus:ring-primary-500/50 focus:border-primary-500'
    
    const errorClasses = 'border-danger text-danger-900 placeholder-danger-300 focus:ring-danger-500 focus:border-danger-500'
    
    const classes = twMerge(
      baseClasses,
      error ? errorClasses : defaultClasses,
      icon && (iconPosition === 'left' ? 'pl-10' : 'pr-10'),
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-text-muted">
                {icon}
              </div>
            </div>
          )}
          <input
            ref={ref}
            className={classes}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-text-muted">
                {icon}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
