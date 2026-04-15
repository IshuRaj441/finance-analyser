import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardBody } from '../ui'
import { PiggyBank, AlertTriangle, CheckCircle } from 'lucide-react'

interface BudgetItem {
  id: string
  category: string
  budget: number
  spent: number
  remaining: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}

interface BudgetUsageProps {
  budgets?: BudgetItem[]
  loading?: boolean
}

const BudgetUsage: React.FC<BudgetUsageProps> = ({
  budgets = [],
  loading = false
}) => {
  const mockBudgets: BudgetItem[] = [
    {
      id: '1',
      category: 'Marketing',
      budget: 5000,
      spent: 4750,
      remaining: 250,
      percentage: 95,
      status: 'danger'
    },
    {
      id: '2',
      category: 'Office',
      budget: 3000,
      spent: 2100,
      remaining: 900,
      percentage: 70,
      status: 'warning'
    },
    {
      id: '3',
      category: 'Software',
      budget: 1500,
      spent: 750,
      remaining: 750,
      percentage: 50,
      status: 'safe'
    },
    {
      id: '4',
      category: 'Travel',
      budget: 2000,
      spent: 400,
      remaining: 1600,
      percentage: 20,
      status: 'safe'
    }
  ]

  const displayBudgets = budgets.length > 0 ? budgets : mockBudgets

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger':
        return 'bg-danger-500'
      case 'warning':
        return 'bg-warning-500'
      case 'safe':
        return 'bg-success-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'danger':
        return 'bg-danger-500/20 text-danger-400'
      case 'warning':
        return 'bg-warning-500/20 text-warning-400'
      case 'safe':
        return 'bg-success-500/20 text-success-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'safe':
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-32"></div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Budget Usage</h3>
            <PiggyBank className="h-5 w-5 text-primary-400" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {displayBudgets.map((budget, index) => (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{budget.category}</span>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg(budget.status)}`}>
                      {getStatusIcon(budget.status)}
                      <span className="ml-1">{budget.percentage}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">
                      ${budget.spent.toLocaleString()} / ${budget.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${budget.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      className={`
                        h-full rounded-full transition-all duration-300
                        ${getStatusColor(budget.status)}
                      `}
                    />
                  </div>
                  
                  {budget.status === 'danger' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <div className="h-4 w-4 bg-danger-500 rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    ${budget.remaining.toLocaleString()} remaining
                  </span>
                  {budget.status === 'danger' && (
                    <span className="text-xs text-danger-400 font-medium">
                      ⚠️ Over budget warning
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
              Manage budgets →
            </button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

export default BudgetUsage
