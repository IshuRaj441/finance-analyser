import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { TableCellsIcon, ClockIcon } from '@heroicons/react/24/outline'
import AuditTable from '@/components/audit/AuditTable'
import AuditTimeline from '@/components/audit/AuditTimeline'
import { Card, CardHeader, CardBody } from '@/components/ui'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const AuditLogs: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table')

  return (
    <ProtectedRoute resource="audit_logs" action="read">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Audit Logs</h1>
            <p className="text-text-secondary mt-1">
              Track and monitor all system activities and changes
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 glass border border-border/50 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={twMerge(
                'flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200',
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <TableCellsIcon className="w-4 h-4" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={twMerge(
                'flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200',
                viewMode === 'timeline'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <ClockIcon className="w-4 h-4" />
              <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'table' ? <AuditTable /> : <AuditTimeline />}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  )
}

export default AuditLogs
