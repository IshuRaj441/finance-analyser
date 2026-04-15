import React from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  loading?: boolean
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  className,
  loading = false
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val)
    }
    return val
  }

  const getTrendIcon = () => {
    if (change) {
      return change.type === 'increase' ? (
        <ArrowTrendingUpIcon className="w-4 h-4 text-secondary" />
      ) : (
        <ArrowTrendingDownIcon className="w-4 h-4 text-danger" />
      )
    }
    return null
  }

  const getTrendColor = () => {
    if (change) {
      return change.type === 'increase' ? 'text-secondary' : 'text-danger'
    }
    return 'text-text-muted'
  }

  if (loading) {
    return (
      <div className={twMerge('glass rounded-xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 bg-surface-200/50 rounded" />
            <div className="w-8 h-8 bg-surface-200/50 rounded-lg" />
          </div>
          <div className="w-32 h-8 bg-surface-200/50 rounded" />
          <div className="flex items-center space-x-2">
            <div className="w-16 h-4 bg-surface-200/50 rounded" />
            <div className="w-20 h-4 bg-surface-200/50 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={twMerge('glass rounded-xl p-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 cursor-pointer', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className="p-2 bg-surface-200/50 rounded-lg">
          {icon}
        </div>
      </div>
      
      <div className="mb-4">
        <motion.div
          className="text-2xl font-bold text-text-primary"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {formatValue(value)}
        </motion.div>
      </div>

      {change && (
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {getTrendIcon()}
          <span className={twMerge('text-sm font-medium', getTrendColor())}>
            {change.type === 'increase' ? '+' : ''}{change.value}%
          </span>
          <span className="text-sm text-text-muted">
            {change.period}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

export default KPICard
