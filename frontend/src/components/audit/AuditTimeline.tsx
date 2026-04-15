import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface AuditLog {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  action: string
  resource: string
  resourceId?: string
  details: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user: { name: 'John Doe', email: 'john@example.com' },
    action: 'created',
    resource: 'transaction',
    resourceId: 'txn_123',
    details: 'Created new transaction for $5,000',
    timestamp: '2024-01-15T10:30:00Z',
    severity: 'low'
  },
  {
    id: '2',
    user: { name: 'Jane Smith', email: 'jane@example.com' },
    action: 'updated',
    resource: 'user',
    resourceId: 'user_456',
    details: 'Updated user role from employee to manager',
    timestamp: '2024-01-15T09:15:00Z',
    severity: 'high'
  },
  {
    id: '3',
    user: { name: 'Bob Johnson', email: 'bob@example.com' },
    action: 'deleted',
    resource: 'budget',
    resourceId: 'budget_789',
    details: 'Deleted Q4 2023 marketing budget',
    timestamp: '2024-01-15T08:45:00Z',
    severity: 'medium'
  },
  {
    id: '4',
    user: { name: 'Alice Brown', email: 'alice@example.com' },
    action: 'viewed',
    resource: 'report',
    resourceId: 'report_101',
    details: 'Accessed monthly financial report',
    timestamp: '2024-01-14T16:30:00Z',
    severity: 'low'
  },
  {
    id: '5',
    user: { name: 'System', email: 'system@company.com' },
    action: 'exported',
    resource: 'transactions',
    details: 'Exported 150 transactions to CSV',
    timestamp: '2024-01-14T14:00:00Z',
    severity: 'low'
  }
]

const AuditTimeline: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  const getSeverityColor = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-danger/20 text-danger border-danger/30'
      case 'medium':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'low':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      default:
        return 'bg-surface-200/50 text-text-muted border-border/50'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <PlusIcon className="w-4 h-4" />
      case 'updated':
        return <PencilIcon className="w-4 h-4" />
      case 'deleted':
        return <TrashIcon className="w-4 h-4" />
      case 'viewed':
        return <EyeIcon className="w-4 h-4" />
      case 'exported':
        return <ArrowDownTrayIcon className="w-4 h-4" />
      default:
        return <CogIcon className="w-4 h-4" />
    }
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'user':
        return <UserIcon className="w-4 h-4" />
      case 'transaction':
        return <CurrencyDollarIcon className="w-4 h-4" />
      case 'budget':
        return <CogIcon className="w-4 h-4" />
      case 'report':
        return <DocumentTextIcon className="w-4 h-4" />
      default:
        return <CogIcon className="w-4 h-4" />
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const groupLogsByDate = (logs: AuditLog[]) => {
    const grouped: Record<string, AuditLog[]> = {}
    logs.forEach(log => {
      const date = new Date(log.timestamp).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(log)
    })
    return grouped
  }

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity
    
    return matchesSearch && matchesSeverity
  })

  const groupedLogs = groupLogsByDate(filteredLogs)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Timeline View</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 glass border border-border/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
            />
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 glass border border-border/50 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/50" />

        {/* Timeline Items */}
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([date, logs], dateIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: dateIndex * 0.1 }}
            >
              {/* Date Header */}
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-primary-600 rounded-full border-4 border-background z-10" />
                <h3 className="ml-4 text-lg font-semibold text-text-primary">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>

              {/* Logs for this date */}
              <div className="ml-12 space-y-4">
                {logs.map((log, logIndex) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: logIndex * 0.05 }}
                    className="glass border border-border/50 rounded-xl p-4 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={twMerge(
                          'w-10 h-10 rounded-full flex items-center justify-center border',
                          getSeverityColor(log.severity)
                        )}>
                          {getActionIcon(log.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-text-primary capitalize">
                              {log.action}
                            </span>
                            <span className="text-text-muted">·</span>
                            <div className="flex items-center text-sm text-text-secondary">
                              {getResourceIcon(log.resource)}
                              <span className="ml-1 capitalize">{log.resource}</span>
                            </div>
                            <span className={twMerge(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                              getSeverityColor(log.severity)
                            )}>
                              {log.severity}
                            </span>
                          </div>

                          <p className="text-sm text-text-secondary mb-2">
                            {log.details}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-text-muted">
                            <div className="flex items-center space-x-1">
                              <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">
                                  {log.user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span>{log.user.name}</span>
                            </div>
                            <span>·</span>
                            <span title={formatFullDate(log.timestamp)}>
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-200/50 rounded-lg transition-all duration-200">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-surface-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FunnelIcon className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No audit logs found</h3>
          <p className="text-text-secondary">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AuditTimeline
