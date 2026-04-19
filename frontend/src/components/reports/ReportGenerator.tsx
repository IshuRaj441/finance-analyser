import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardBody, Button, Input } from '../ui'
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  icon: React.ReactNode
  defaultParameters: any
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'financial_summary',
    name: 'Financial Summary',
    description: 'Complete overview of financial performance',
    type: 'financial_summary',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    defaultParameters: {
      include_charts: true,
      include_details: true
    }
  },
  {
    id: 'profit_loss',
    name: 'Profit & Loss',
    description: 'Detailed profit and loss statement',
    type: 'profit_loss',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    defaultParameters: {
      include_charts: true,
      include_details: true
    }
  },
  {
    id: 'expense_report',
    name: 'Expense Report',
    description: 'Comprehensive expense breakdown',
    type: 'expense_report',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    defaultParameters: {
      include_charts: true,
      include_details: true
    }
  },
  {
    id: 'budget_report',
    name: 'Budget Analysis',
    description: 'Budget vs actual spending analysis',
    type: 'budget_report',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    defaultParameters: {
      include_charts: true,
      include_details: true
    }
  },
  {
    id: 'tax_report',
    name: 'Tax Report',
    description: 'Tax-ready financial statements',
    type: 'tax_report',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    defaultParameters: {
      include_charts: false,
      include_details: true
    }
  }
]

interface ReportGeneratorProps {
  onReportGenerated?: (report: Report) => void
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onReportGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [reportName, setReportName] = useState('')
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeDetails, setIncludeDetails] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<Report[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportName || !dateRange.from || !dateRange.to) {
      return
    }

    setIsGenerating(true)

    try {
      const reportData: CreateReportData = {
        name: reportName,
        type: selectedTemplate.type as any,
        description: `${selectedTemplate.description} - ${dateRange.from} to ${dateRange.to}`,
        parameters: {
          date_from: dateRange.from,
          date_to: dateRange.to,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          include_charts: includeCharts,
          include_details: includeDetails
        }
      }

      const response = await reportsService.generate(reportData)
      const newReport = response.data
      
      setGeneratedReports(prev => [newReport, ...prev])
      onReportGenerated?.(newReport)

      // Reset form
      setSelectedTemplate(null)
      setReportName('')
      setDateRange({ from: '', to: '' })
      setIncludeCharts(true)
      setIncludeDetails(true)
      setSelectedCategories([])

    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = async (report: Report) => {
    try {
      await reportsService.download(report.id)
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-400" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-danger-400" />
      default:
        return <Clock className="h-4 w-4 text-warning-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-400 bg-success-500/10'
      case 'failed':
        return 'text-danger-400 bg-danger-500/10'
      default:
        return 'text-warning-400 bg-warning-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">Select Report Type</h3>
            <p className="text-sm text-text-secondary mt-1">
              Choose a template to get started with your report
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTemplate(template)}
                  className={`
                    p-4 rounded-lg border text-left transition-all duration-200
                    ${selectedTemplate?.id === template.id
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-border/50 bg-surface-100/30 text-text-secondary hover:border-border hover:bg-surface-200/50'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      p-2 rounded-lg
                      ${selectedTemplate?.id === template.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-200 text-text-muted'
                      }
                    `}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-text-muted mt-1">{template.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Report Configuration */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Configure Report</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Customize your {selectedTemplate.name} report
                  </p>
                </div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {showAdvanced ? 'Simple' : 'Advanced'}
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Report Name */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Report Name
                  </label>
                  <Input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name..."
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-border/50"
                  >
                    {/* Include Charts */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-text-secondary">
                        Include Charts
                      </label>
                      <button
                        onClick={() => setIncludeCharts(!includeCharts)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${includeCharts ? 'bg-primary-600' : 'bg-surface-200'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${includeCharts ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>

                    {/* Include Details */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-text-secondary">
                        Include Detailed Breakdown
                      </label>
                      <button
                        onClick={() => setIncludeDetails(!includeDetails)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${includeDetails ? 'bg-primary-600' : 'bg-surface-200'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${includeDetails ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !reportName || !dateRange.from || !dateRange.to}
                  loading={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Recent Reports</h3>
              <p className="text-sm text-text-secondary mt-1">
                Your recently generated reports
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {generatedReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg glass border border-border/50"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-text-muted" />
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">{report.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(report.status)}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {report.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          icon={<ArrowDownTrayIcon className="h-4 w-4" />}
                        >
                          Download
                        </Button>
                      )}
                      {report.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setGeneratedReports(prev => prev.filter(r => r.id !== report.id))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default ReportGenerator
