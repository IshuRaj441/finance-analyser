import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardBody } from '../ui'
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

interface RecentTransactionsProps {
  transactions?: Transaction[]
  loading?: boolean
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions = [],
  loading = false
}) => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      description: 'Office Rent Payment',
      amount: 2500,
      type: 'expense',
      category: 'Office',
      date: '2024-10-28',
      status: 'completed'
    },
    {
      id: '2',
      description: 'Client Payment - ABC Corp',
      amount: 8500,
      type: 'income',
      category: 'Sales',
      date: '2024-10-27',
      status: 'completed'
    },
    {
      id: '3',
      description: 'Software Licenses',
      amount: 299,
      type: 'expense',
      category: 'Software',
      date: '2024-10-26',
      status: 'completed'
    },
    {
      id: '4',
      description: 'Marketing Campaign',
      amount: 1200,
      type: 'expense',
      category: 'Marketing',
      date: '2024-10-25',
      status: 'pending'
    },
    {
      id: '5',
      description: 'Consulting Services',
      amount: 3200,
      type: 'income',
      category: 'Services',
      date: '2024-10-24',
      status: 'completed'
    }
  ]

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-40"></div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
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
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Recent Transactions</h3>
            <button className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-200/50 rounded-lg transition-colors">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-1">
            {displayTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-200/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center
                    ${transaction.type === 'income' ? 'bg-secondary/20' : 'bg-danger/20'}
                    group-hover:scale-110 transition-transform duration-200
                  `}>
                    {transaction.type === 'income' ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 text-secondary" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-primary-400 transition-colors">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-text-muted">{transaction.category}</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted">{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`
                    text-sm font-semibold
                    ${transaction.type === 'income' ? 'text-secondary' : 'text-danger'}
                  `}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${transaction.status === 'completed' ? 'bg-secondary/20 text-secondary' : ''}
                    ${transaction.status === 'pending' ? 'bg-accent/20 text-accent' : ''}
                    ${transaction.status === 'failed' ? 'bg-danger/20 text-danger' : ''}
                  `}>
                    {transaction.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View all transactions →
            </button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

export default RecentTransactions
