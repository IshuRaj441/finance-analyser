import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const Reports: React.FC = () => {
  const reportTemplates = [
    {
      id: 'financial_summary',
      name: 'Financial Summary',
      description: 'Complete overview of financial performance',
      icon: <ChartBarIcon className="h-6 w-6" />,
      color: 'bg-primary-500/20 text-primary-400 border-primary-500/30'
    },
    {
      id: 'profit_loss',
      name: 'Profit & Loss',
      description: 'Detailed profit and loss statement',
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      color: 'bg-secondary/20 text-secondary border-secondary/30'
    },
    {
      id: 'expense_report',
      name: 'Expense Report',
      description: 'Comprehensive expense breakdown',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      color: 'bg-accent/20 text-accent border-accent/30'
    },
    {
      id: 'budget_analysis',
      name: 'Budget Analysis',
      description: 'Budget vs actual spending analysis',
      icon: <ChartBarIcon className="h-6 w-6" />,
      color: 'bg-danger/20 text-danger border-danger/30'
    }
  ]

  const recentReports = [
    {
      id: '1',
      name: 'Q4 2023 Financial Summary',
      type: 'financial_summary',
      generatedAt: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      name: 'December 2023 Expense Report',
      type: 'expense_report',
      generatedAt: '2024-01-10T14:20:00Z',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Monthly Budget Analysis',
      type: 'budget_analysis',
      generatedAt: '2024-01-05T09:15:00Z',
      status: 'processing'
    }
  ]

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'processing':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'failed':
        return 'bg-danger/20 text-danger border-danger/30'
      default:
        return 'bg-surface-200/50 text-text-muted border-border/50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary mt-1">Generate and analyze financial reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 glass border border-border/50 rounded-lg hover:bg-surface-200/50 transition-all duration-200">
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 transition-all duration-200">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text-primary">Generate New Report</h3>
          <p className="text-sm text-text-secondary">Choose a report template to get started</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template, index) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 glass border border-border/50 rounded-xl hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg border ${template.color} group-hover:scale-110 transition-transform duration-200`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-text-primary group-hover:text-primary-400 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-text-muted mt-1">{template.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Recent Reports</h3>
              <p className="text-sm text-text-secondary mt-1">Your recently generated reports</p>
            </div>
            <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View All
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 glass border border-border/50 rounded-xl hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">{report.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(report.generatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {report.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<CalendarIcon className="w-4 h-4" />}
                  >
                    Schedule
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardBody>
            <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <DocumentTextIcon className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">24</h3>
            <p className="text-sm text-text-secondary">Total Reports</p>
          </CardBody>
        </Card>
        
        <Card className="text-center">
          <CardBody>
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowDownTrayIcon className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">142</h3>
            <p className="text-sm text-text-secondary">Downloads</p>
          </CardBody>
        </Card>
        
        <Card className="text-center">
          <CardBody>
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">8</h3>
            <p className="text-sm text-text-secondary">Scheduled</p>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  )
}

export default Reports
