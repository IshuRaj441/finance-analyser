import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  glass?: boolean
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, glass = false, ...props }, ref) => {
    const baseClasses = 'rounded-xl border transition-all duration-300'
    
    const defaultClasses = 'glass p-6'
    
    const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 cursor-pointer' : 'hover:shadow-xl'
    
    const glassClasses = glass ? 'glass' : ''
    
    const classes = twMerge(
      baseClasses,
      defaultClasses,
      hoverClasses,
      glassClasses,
      className
    )

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const classes = twMerge(
      'px-6 py-4 border-b border-border/50',
      className
    )

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    const classes = twMerge('px-6 py-4', className)

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    const classes = twMerge(
      'px-6 py-4 border-t border-border/50 bg-surface-100/30',
      className
    )

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardBody.displayName = 'CardBody'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardBody, CardFooter }
