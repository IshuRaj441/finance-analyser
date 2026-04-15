import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardBody, Button } from '../ui'
import { 
  Download, 
  Share2, 
  Calendar, 
  FileText,
  Filter,
  Search,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { reportsService, Report, ReportFilters } from '../../services'

interface ReportViewerProps {
  onReportSelect?: (report: Report) => void
}

const ReportViewer: React.FC<ReportViewerProps> = ({ onReportSelect }) => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ReportFilters>({})
  const [selectedReports, setSelectedReports] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadReports()
  }, [filters])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getAll({
        ...filters,
        per_page: 50
      })
      setReports(response.data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (report: Report) => {
    try {
      await reportsService.download(report.id)
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  const handleDelete = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return
    }

    try {
      await reportsService.delete(reportId)
      setReports(prev => prev.filter(r => r.id !== reportId))
      setSelectedReports(prev => prev.filter(id => id !== reportId))
    } catch (error) {
      console.error('Failed to delete report:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedReports.length} reports?`)) {
      return
    }

    try {
      await Promise.all(selectedReports.map(id => reportsService.delete(id)))
      setReports(prev => prev.filter(r => !selectedReports.includes(r.id)))
      setSelectedReports([])
    } catch (error) {
      console.error('Failed to delete reports:', error)
    }
  }

  const handleShare = async (report: Report) => {
    try {
      const response = await reportsService.share(report.id, {
        recipients: [],
        message: 'Check out this report',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      
      // Copy share URL to clipboard
      if (response.data.share_url) {
        navigator.clipboard.writeText(response.data.share_url)
        alert('Share link copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share report:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-2 h-2 bg-success-500 rounded-full" />
      case 'failed':
        return <div className="w-2 h-2 bg-danger-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse" />
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'financial_summary':
        return 'Financial Summary'
      case 'profit_loss':
        return 'Profit & Loss'
      case 'expense_report':
        return 'Expense Report'
      case 'budget_report':
        return 'Budget Report'
      case 'tax_report':
        return 'Tax Report'
      default:
        return type
    }
  }

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="text-gray-400 mt-1">Manage and download your financial reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-4 w-4" />}
          >
            Filters
          </Button>
          <Button
            onClick={loadReports}
            icon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-3"
                >
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      type: e.target.value as any || undefined 
                    }))}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="financial_summary">Financial Summary</option>
                    <option value="profit_loss">Profit & Loss</option>
                    <option value="expense_report">Expense Report</option>
                    <option value="budget_report">Budget Report</option>
                    <option value="tax_report">Tax Report</option>
                  </select>

                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      status: e.target.value as any || undefined 
                    }))}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="generating">Generating</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </motion.div>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedReports.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mt-4"
              >
                <span className="text-sm text-gray-300">
                  {selectedReports.length} report{selectedReports.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReports([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleBulkDelete}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete Selected
                  </Button>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardBody>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No reports found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Generate your first report to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-all duration-200
                      ${selectedReports.includes(report.id)
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports(prev => [...prev, report.id])
                          } else {
                            setSelectedReports(prev => prev.filter(id => id !== report.id))
                          }
                        }}
                        className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
                      />

                      {/* Status Icon */}
                      {getStatusIcon(report.status)}

                      {/* Report Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {report.name}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-400">
                            {getTypeLabel(report.type)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReportSelect?.(report)}
                        icon={<Eye className="h-4 w-4" />}
                      >
                        View
                      </Button>
                      
                      {report.status === 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(report)}
                            icon={<Share2 className="h-4 w-4" />}
                          >
                            Share
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(report)}
                            icon={<Download className="h-4 w-4" />}
                          >
                            Download
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(report.id)}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default ReportViewer
