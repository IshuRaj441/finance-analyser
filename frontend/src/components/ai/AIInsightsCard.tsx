import React from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface Insight {
  id: string
  type: 'alert' | 'warning' | 'info' | 'opportunity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  timestamp: string
  data?: {
    value?: number
    change?: number
    previous?: number
    trend?: 'up' | 'down'
  }
}

interface AIInsightsCardProps {
  insights: Insight[]
  className?: string
  maxItems?: number
  showViewAll?: boolean
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  insights,
  className,
  maxItems = 3,
  showViewAll = true
}) => {
  const getTypeIcon = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'opportunity':
        return <ArrowTrendingUpIcon className="w-5 h-5" />
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-danger/20 text-danger border-danger/30'
      case 'warning':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'opportunity':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'info':
      default:
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
    }
  }

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-danger/10 text-danger border-danger/20'
      case 'medium':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'low':
        return 'bg-surface-200/50 text-text-muted border-border/50'
      default:
        return 'bg-surface-200/50 text-text-muted border-border/50'
    }
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const displayedInsights = insights.slice(0, maxItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={twMerge('space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
            <p className="text-sm text-text-muted">Smart financial recommendations</p>
          </div>
        </div>

        {showViewAll && insights.length > maxItems && (
          <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View all
          </button>
        )}
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {displayedInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className={twMerge(
              'p-4 rounded-xl border transition-all duration-300 hover:shadow-xl',
              getTypeColor(insight.type)
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Icon */}
                <div className={twMerge(
                  'w-10 h-10 rounded-full flex items-center justify-center border',
                  getTypeColor(insight.type)
                )}>
                  {getTypeIcon(insight.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-text-primary">
                      {insight.title}
                    </h4>
                    <span className={twMerge(
                      'text-xs px-2 py-0.5 rounded-full border font-medium',
                      getImpactColor(insight.impact)
                    )}>
                      {insight.impact} impact
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary mb-2">
                    {insight.description}
                  </p>

                  {/* Data Display */}
                  {insight.data && (
                    <div className="flex items-center space-x-4 text-xs text-text-muted">
                      {insight.data.value && (
                        <span className="font-medium text-text-primary">
                          {formatValue(insight.data.value)}
                        </span>
                      )}
                      
                      {insight.data.change && (
                        <div className="flex items-center space-x-1">
                          {insight.data.trend === 'up' ? (
                            <ArrowTrendingUpIcon className="w-3 h-3 text-secondary" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-3 h-3 text-danger" />
                          )}
                          <span className={twMerge(
                            'font-medium',
                            insight.data.trend === 'up' ? 'text-secondary' : 'text-danger'
                          )}>
                            {insight.data.trend === 'up' ? '+' : ''}{insight.data.change}%
                          </span>
                        </div>
                      )}

                      <span>·</span>
                      <span>{formatTimestamp(insight.timestamp)}</span>
                    </div>
                  )}

                  {/* Action */}
                  {insight.action && (
                    <button
                      onClick={insight.action.onClick}
                      className="mt-3 flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <span>{insight.action.label}</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {insights.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-surface-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No insights yet</h3>
          <p className="text-text-secondary">
            AI insights will appear here as we analyze your financial data
          </p>
        </motion.div>
      )}

      {/* View All CTA */}
      {showViewAll && insights.length > maxItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button className="w-full p-3 glass border border-border/50 rounded-xl hover:bg-surface-200/50 transition-all duration-200 text-center">
            <span className="text-sm text-primary-400">View all {insights.length} insights</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AIInsightsCard
