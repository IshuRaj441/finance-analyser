import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ChartProps {
  type: 'line' | 'bar' | 'pie'
  title: string
  data: any
  options?: any
  className?: string
  loading?: boolean
}

const Chart: React.FC<ChartProps> = ({
  type,
  title,
  data,
  options,
  className,
  loading = false
}) => {
  const chartRef = useRef<any>(null)

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9CA3AF',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#E5E7EB',
        bodyColor: '#9CA3AF',
        borderColor: '#1F2937',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y)
            }
            return label
          }
        }
      }
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          color: 'rgba(31, 41, 55, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: 'rgba(31, 41, 55, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
        }
      }
    } : undefined,
    ...options
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={data} options={defaultOptions} />
      case 'bar':
        return <Bar ref={chartRef} data={data} options={defaultOptions} />
      case 'pie':
        return <Pie ref={chartRef} data={data} options={defaultOptions} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={twMerge('glass rounded-xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="w-32 h-4 bg-surface-200/50 rounded" />
          <div className="w-full h-64 bg-surface-200/50 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={twMerge('glass rounded-xl p-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <div className="h-64">
        {renderChart()}
      </div>
    </motion.div>
  )
}

export default Chart
