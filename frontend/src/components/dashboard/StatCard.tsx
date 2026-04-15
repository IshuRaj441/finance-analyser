import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardBody } from '../ui'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: LucideIcon
  iconColor: string
  iconBg: string
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  loading = false
}) => {
  if (loading) {
    return (
      <Card hover className="animate-pulse">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="h-12 w-12 bg-gray-700 rounded-lg"></div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="group">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              
              {change && (
                <div className="flex items-center mt-2">
                  <span className={`
                    inline-flex items-center text-xs font-medium
                    ${change.type === 'increase' ? 'text-success-400' : 'text-danger-400'}
                  `}>
                    {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
                  </span>
                  <span className="text-xs text-text-muted ml-2">{change.period}</span>
                </div>
              )}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`
                h-12 w-12 rounded-lg flex items-center justify-center
                ${iconBg} group-hover:scale-110 transition-transform duration-200
              `}
            >
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </motion.div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

export default StatCard
