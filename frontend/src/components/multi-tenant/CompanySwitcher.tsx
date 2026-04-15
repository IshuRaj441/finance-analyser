import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  BuildingOfficeIcon,
  ChevronDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Company {
  id: string
  name: string
  logo?: string
  domain?: string
  plan: 'free' | 'pro' | 'enterprise'
  users: number
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastActive: string
  settings?: {
    timezone: string
    currency: string
    dateFormat: string
  }
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Tech Corp Inc.',
    logo: 'TC',
    domain: 'techcorp.com',
    plan: 'enterprise',
    users: 150,
    status: 'active',
    createdAt: '2023-01-15T10:30:00Z',
    lastActive: '2024-01-15T14:20:00Z',
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    }
  },
  {
    id: '2',
    name: 'Finance Solutions Ltd.',
    logo: 'FS',
    domain: 'finsolutions.io',
    plan: 'pro',
    users: 45,
    status: 'active',
    createdAt: '2023-06-20T09:15:00Z',
    lastActive: '2024-01-14T16:30:00Z',
    settings: {
      timezone: 'Europe/London',
      currency: 'GBP',
      dateFormat: 'DD/MM/YYYY'
    }
  },
  {
    id: '3',
    name: 'Global Enterprises',
    logo: 'GE',
    domain: 'globalent.com',
    plan: 'free',
    users: 12,
    status: 'active',
    createdAt: '2023-11-10T13:45:00Z',
    lastActive: '2024-01-13T11:10:00Z',
    settings: {
      timezone: 'Asia/Tokyo',
      currency: 'JPY',
      dateFormat: 'YYYY/MM/DD'
    }
  },
  {
    id: '4',
    name: 'Startup Ventures',
    logo: 'SV',
    domain: 'startup.ventures',
    plan: 'pro',
    users: 8,
    status: 'inactive',
    createdAt: '2023-09-05T16:20:00Z',
    lastActive: '2023-12-20T10:00:00Z',
    settings: {
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    }
  }
]

interface CompanySwitcherProps {
  currentCompany?: Company
  onCompanyChange?: (company: Company) => void
  className?: string
  compact?: boolean
}

const CompanySwitcher: React.FC<CompanySwitcherProps> = ({
  currentCompany = mockCompanies[0],
  onCompanyChange,
  className,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getPlanColor = (plan: Company['plan']) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'free':
        return 'bg-surface-200 text-text-muted'
      default:
        return 'bg-surface-200 text-text-muted'
    }
  }

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'active':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'inactive':
        return 'bg-surface-200/50 text-text-muted border-border/50'
      case 'suspended':
        return 'bg-danger/20 text-danger border-danger/30'
      default:
        return 'bg-surface-200/50 text-text-muted border-border/50'
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCompanySelect = (company: Company) => {
    onCompanyChange?.(company)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={twMerge('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          'flex items-center space-x-3 transition-all duration-200 hover:bg-surface-200/50 rounded-lg',
          compact ? 'p-2' : 'px-4 py-2'
        )}
      >
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {currentCompany?.logo || currentCompany?.name?.charAt(0)}
          </span>
        </div>
        
        {!compact && (
          <>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">
                {currentCompany?.name}
              </p>
              <p className="text-xs text-text-muted">
                {currentCompany?.plan} plan
              </p>
            </div>
            <ChevronDownIcon className={twMerge(
              'w-4 h-4 text-text-muted transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={twMerge(
                'absolute right-0 mt-2 glass-strong rounded-xl shadow-2xl z-50 border border-border/50',
                compact ? 'w-80' : 'w-96 max-h-[600px]'
              )}
            >
              {/* Header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-text-primary">Switch Company</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-surface-200/50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-100/50 border border-border/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-text-secondary">
                    {filteredCompanies.length} companies
                  </span>
                  <div className="flex items-center p-1 bg-surface-100/50 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={twMerge(
                        'p-1 rounded transition-colors',
                        viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-text-muted hover:text-text-primary'
                      )}
                    >
                      <ChartBarIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={twMerge(
                        'p-1 rounded transition-colors',
                        viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-text-muted hover:text-text-primary'
                      )}
                    >
                      <UserGroupIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Companies List/Grid */}
              <div className="flex-1 overflow-y-auto max-h-96">
                {filteredCompanies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BuildingOfficeIcon className="w-12 h-12 text-text-muted mb-3" />
                    <p className="text-text-secondary">No companies found</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'p-4 grid grid-cols-1 gap-3' : 'divide-y divide-border/30'}>
                    {filteredCompanies.map((company) => (
                      <motion.button
                        key={company.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCompanySelect(company)}
                        className={twMerge(
                          'p-4 rounded-lg border transition-all duration-200 text-left',
                          viewMode === 'grid' 
                            ? 'glass border-border/50 hover:border-primary-500/50 hover:bg-primary-500/5'
                            : 'w-full flex items-center justify-between hover:bg-surface-100/30 border-transparent'
                        )}
                      >
                        {viewMode === 'grid' ? (
                          /* Grid View */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {company.logo || company.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-text-primary">
                                    {company.name}
                                  </h4>
                                  <p className="text-xs text-text-muted">
                                    {company.domain}
                                  </p>
                                </div>
                              </div>
                              
                              {currentCompany?.id === company.id && (
                                <CheckIcon className="w-4 h-4 text-secondary" />
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className={twMerge(
                                'text-xs px-2 py-1 rounded-full font-medium',
                                getPlanColor(company.plan)
                              )}>
                                {company.plan}
                              </span>
                              
                              <span className={twMerge(
                                'text-xs px-2 py-1 rounded-full border font-medium',
                                getStatusColor(company.status)
                              )}>
                                {company.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-text-muted">
                              <span>{company.users} users</span>
                              <span>Last active {formatDate(company.lastActive)}</span>
                            </div>
                          </div>
                        ) : (
                          /* List View */
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {company.logo || company.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-text-primary">
                                  {company.name}
                                </h4>
                                <div className="flex items-center space-x-2 text-xs text-text-muted">
                                  <span>{company.domain}</span>
                                  <span>·</span>
                                  <span>{company.users} users</span>
                                  <span>·</span>
                                  <span>Last active {formatDate(company.lastActive)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={twMerge(
                                'text-xs px-2 py-1 rounded-full font-medium',
                                getPlanColor(company.plan)
                              )}>
                                {company.plan}
                              </span>
                              
                              <span className={twMerge(
                                'text-xs px-2 py-1 rounded-full border font-medium',
                                getStatusColor(company.status)
                              )}>
                                {company.status}
                              </span>

                              {currentCompany?.id === company.id && (
                                <CheckIcon className="w-4 h-4 text-secondary" />
                              )}
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 transition-all duration-200">
                  <PlusIcon className="w-4 h-4" />
                  <span>Create New Company</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompanySwitcher
