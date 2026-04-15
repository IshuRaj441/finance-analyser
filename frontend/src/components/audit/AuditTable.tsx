import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChevronDownIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  TrashIcon,
  CurrencyDollarIcon
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
  ipAddress: string
  userAgent: string
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
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
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
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
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
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2024-01-15T07:30:00Z',
    severity: 'low'
  },
  {
    id: '5',
    user: { name: 'System', email: 'system@company.com' },
    action: 'exported',
    resource: 'transactions',
    details: 'Exported 150 transactions to CSV',
    ipAddress: '127.0.0.1',
    userAgent: 'System Scheduler',
    timestamp: '2024-01-15T06:00:00Z',
    severity: 'low'
  }
]

const AuditTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

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
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity
    const matchesAction = selectedAction === 'all' || log.action === selectedAction
    
    return matchesSearch && matchesSeverity && matchesAction
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Audit Logs</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 glass border border-border/50 rounded-lg hover:bg-surface-200/50 transition-all duration-200"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 transition-all duration-200">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass border border-border/50 rounded-xl p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-100/50 border border-border/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-4 py-2 bg-surface-100/50 border border-border/50 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-4 py-2 bg-surface-100/50 border border-border/50 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="viewed">Viewed</option>
                <option value="exported">Exported</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="glass border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-100/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-surface-100/20 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-medium">
                          {log.user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{log.user.name}</div>
                        <div className="text-xs text-text-muted">{log.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-primary capitalize">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text-primary">
                      {getResourceIcon(log.resource)}
                      <span className="ml-2 capitalize">{log.resource}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-secondary max-w-xs truncate" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={twMerge(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                      getSeverityColor(log.severity)
                    )}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-secondary">
          Showing {filteredLogs.length} of {mockAuditLogs.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm glass border border-border/50 rounded-lg hover:bg-surface-200/50 transition-all duration-200">
            Previous
          </button>
          <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-1 text-sm glass border border-border/50 rounded-lg hover:bg-surface-200/50 transition-all duration-200">
            Next
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AuditTable
