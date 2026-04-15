import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines
}) => {
  const baseClasses = 'animate-pulse bg-surface-200/50'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines && lines > 1) {
    return (
      <div className={twMerge('space-y-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={twMerge(
              baseClasses,
              variantClasses[variant],
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={twMerge(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  )
}

export default Skeleton
