import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month')

  // Data for different time periods
  const timeData = {
    week: {
      chartData: [
        { name: 'Mon', income: 2400, expenses: 1800 },
        { name: 'Tue', income: 2800, expenses: 2100 },
        { name: 'Wed', income: 3200, expenses: 2400 },
        { name: 'Thu', income: 2900, expenses: 2200 },
        { name: 'Fri', income: 3500, expenses: 2600 },
        { name: 'Sat', income: 1800, expenses: 1200 },
        { name: 'Sun', income: 1500, expenses: 1000 },
      ],
      stats: {
        balance: { value: '$12,450', change: '+5.2%' },
        income: { value: '$18,100', change: '+3.8%' },
        expenses: { value: '$13,300', change: '+2.1%' }
      },
      categories: [
        { name: 'Food', value: 2800, color: '#3B82F6' },
        { name: 'Transport', value: 1200, color: '#22C55E' },
        { name: 'Shopping', value: 3500, color: '#F59E0B' },
        { name: 'Bills', value: 4500, color: '#EF4444' },
        { name: 'Other', value: 1300, color: '#A855F7' },
      ]
    },
    month: {
      chartData: [
        { name: 'Week 1', income: 4500, expenses: 3200 },
        { name: 'Week 2', income: 5200, expenses: 3800 },
        { name: 'Week 3', income: 4800, expenses: 3500 },
        { name: 'Week 4', income: 5500, expenses: 4000 },
      ],
      stats: {
        balance: { value: '$45,231', change: '+12.5%' },
        income: { value: '$18,000', change: '+8.2%' },
        expenses: { value: '$12,000', change: '-3.1%' }
      },
      categories: [
        { name: 'Marketing', value: 3500, color: '#3B82F6' },
        { name: 'Operations', value: 2800, color: '#22C55E' },
        { name: 'Salaries', value: 5200, color: '#F59E0B' },
        { name: 'Rent', value: 2000, color: '#EF4444' },
        { name: 'Utilities', value: 1200, color: '#A855F7' },
        { name: 'Other', value: 800, color: '#6B7280' },
      ]
    },
    quarter: {
      chartData: [
        { name: 'Jan', income: 12000, expenses: 8000 },
        { name: 'Feb', income: 15000, expenses: 9500 },
        { name: 'Mar', income: 13000, expenses: 8200 },
      ],
      stats: {
        balance: { value: '$135,693', change: '+18.7%' },
        income: { value: '$54,000', change: '+15.3%' },
        expenses: { value: '$36,000', change: '+4.2%' }
      },
      categories: [
        { name: 'Marketing', value: 10500, color: '#3B82F6' },
        { name: 'Operations', value: 8400, color: '#22C55E' },
        { name: 'Salaries', value: 15600, color: '#F59E0B' },
        { name: 'Rent', value: 6000, color: '#EF4444' },
        { name: 'Utilities', value: 3600, color: '#A855F7' },
        { name: 'Other', value: 2400, color: '#6B7280' },
      ]
    },
    year: {
      chartData: [
        { name: 'Q1', income: 40000, expenses: 25700 },
        { name: 'Q2', income: 45000, expenses: 30500 },
        { name: 'Q3', income: 42000, expenses: 28000 },
        { name: 'Q4', income: 48000, expenses: 32000 },
      ],
      stats: {
        balance: { value: '$542,772', change: '+22.4%' },
        income: { value: '$216,000', change: '+19.8%' },
        expenses: { value: '$144,000', change: '+8.7%' }
      },
      categories: [
        { name: 'Marketing', value: 42000, color: '#3B82F6' },
        { name: 'Operations', value: 33600, color: '#22C55E' },
        { name: 'Salaries', value: 62400, color: '#F59E0B' },
        { name: 'Rent', value: 24000, color: '#EF4444' },
        { name: 'Utilities', value: 14400, color: '#A855F7' },
        { name: 'Other', value: 9600, color: '#6B7280' },
      ]
    }
  }

  const currentData = timeData[timeRange as keyof typeof timeData]

  
  const categoryData = currentData.categories

  const budgetData = useMemo(() => {
    return currentData.categories.map(cat => ({
      category: cat.name,
      spent: Math.floor(cat.value * 0.7),
      remaining: Math.floor(cat.value * 0.3)
    }))
  }, [currentData.categories])


  
  
  return (
    <div className="space-y-6 container px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-surface-200 px-4 py-2 pr-10 rounded-lg outline-none text-text-primary border border-border/50 cursor-pointer hover:bg-surface-300 transition-colors duration-200"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { title: 'Balance', ...currentData.stats.balance, icon: DollarSign, color: 'text-emerald-400' },
          { title: 'Income', ...currentData.stats.income, icon: TrendingUp, color: 'text-indigo-400' },
          { title: 'Expenses', ...currentData.stats.expenses, icon: TrendingDown, color: 'text-red-400' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-strong p-6 rounded-2xl hover:shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-surface-200/50 ${item.color.replace('text', 'bg').replace('-400', '/20')}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <span className={`text-sm font-medium ${item.color}`}>{item.change}</span>
            </div>
            <p className="text-text-secondary text-sm mb-1">{item.title}</p>
            <p className="text-3xl font-bold text-text-primary">{item.value}</p>
          </motion.div>
        ))}
      </div>


      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        className="glass-strong p-6 rounded-2xl hover:shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
      >
        <h2 className="mb-6 text-xl font-semibold text-text-primary">Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentData.chartData}>
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                border: '1px solid rgba(75, 85, 99, 0.5)', 
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                color: '#E5E7EB'
              }}
              labelStyle={{ color: '#E5E7EB' }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Budget and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          className="glass-strong p-6 rounded-2xl hover:shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
        >
          <h2 className="mb-6 text-xl font-semibold text-text-primary">Budget Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetData}>
              <XAxis dataKey="category" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid rgba(75, 85, 99, 0.5)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  color: '#E5E7EB'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="spent" fill="#EF4444" radius={[8, 8, 0, 0]} />
              <Bar dataKey="remaining" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="glass-strong p-6 rounded-2xl hover:shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
        >
          <h2 className="mb-6 text-xl font-semibold text-text-primary">Expense Categories</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                innerRadius={40}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                  border: '1px solid rgba(75, 85, 99, 0.5)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  color: '#E5E7EB'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

    </div>
  )
}

export default Dashboard
