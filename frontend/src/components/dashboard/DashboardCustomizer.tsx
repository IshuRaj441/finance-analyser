import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  EyeSlashIcon,
  RectangleGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BellIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Widget {
  id: string
  type: 'kpi' | 'chart' | 'transactions' | 'insights' | 'notifications' | 'reports'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  isVisible: boolean
  config?: Record<string, any>
}

interface DashboardCustomizerProps {
  widgets: Widget[]
  onWidgetsChange: (widgets: Widget[]) => void
  onSave: (widgets: Widget[]) => void
  className?: string
}

const widgetTypes = [
  {
    type: 'kpi' as const,
    title: 'KPI Cards',
    icon: <ChartBarIcon className="w-5 h-5" />,
    description: 'Key performance indicators',
    defaultSize: 'medium' as const
  },
  {
    type: 'chart' as const,
    title: 'Charts',
    icon: <ChartBarIcon className="w-5 h-5" />,
    description: 'Financial charts and graphs',
    defaultSize: 'large' as const
  },
  {
    type: 'transactions' as const,
    title: 'Recent Transactions',
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
    description: 'Latest transaction activity',
    defaultSize: 'medium' as const
  },
  {
    type: 'insights' as const,
    title: 'AI Insights',
    icon: <RectangleGroupIcon className="w-5 h-5" />,
    description: 'AI-powered insights',
    defaultSize: 'medium' as const
  },
  {
    type: 'notifications' as const,
    title: 'Notifications',
    icon: <BellIcon className="w-5 h-5" />,
    description: 'Recent notifications',
    defaultSize: 'small' as const
  },
  {
    type: 'reports' as const,
    title: 'Reports',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    description: 'Recent reports',
    defaultSize: 'medium' as const
  }
]

const sizeOptions = [
  { value: 'small', label: 'Small', gridCols: 4 },
  { value: 'medium', label: 'Medium', gridCols: 2 },
  { value: 'large', label: 'Large', gridCols: 1 }
]

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  widgets,
  onWidgetsChange,
  onSave,
  className
}) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const dragCounter = useRef(0)

  const getWidgetIcon = (type: Widget['type']) => {
    const widgetType = widgetTypes.find(w => w.type === type)
    return widgetType?.icon || <RectangleGroupIcon className="w-5 h-5" />
  }

  const getWidgetTitle = (type: Widget['type']) => {
    const widgetType = widgetTypes.find(w => w.type === type)
    return widgetType?.title || type
  }

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = 'move'
    dragCounter.current++
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault()
    
    if (!draggedWidget || draggedWidget === targetWidgetId) return

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget)
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newWidgets = [...widgets]
      const [removed] = newWidgets.splice(draggedIndex, 1)
      newWidgets.splice(targetIndex, 0, removed)
      onWidgetsChange(newWidgets)
    }

    setDraggedWidget(null)
    dragCounter.current--
  }

  const handleToggleVisibility = (widgetId: string) => {
    const newWidgets = widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    )
    onWidgetsChange(newWidgets)
  }

  const handleSizeChange = (widgetId: string, newSize: Widget['size']) => {
    const newWidgets = widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, size: newSize }
        : widget
    )
    onWidgetsChange(newWidgets)
  }

  const handleAddWidget = (type: Widget['type']) => {
    const widgetType = widgetTypes.find(w => w.type === type)
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: widgetType?.title || type,
      size: widgetType?.defaultSize || 'medium',
      position: { x: 0, y: 0 },
      isVisible: true
    }
    
    onWidgetsChange([...widgets, newWidget])
    setShowAddWidget(false)
  }

  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(widget => widget.id !== widgetId)
    onWidgetsChange(newWidgets)
    setSelectedWidget(null)
  }

  const getGridCols = (size: Widget['size']) => {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-2'
      case 'large': return 'col-span-4'
      default: return 'col-span-2'
    }
  }

  const visibleWidgets = widgets.filter(w => w.isVisible)

  return (
    <div className={twMerge('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Customize Dashboard</h2>
          <p className="text-text-secondary mt-1">
            Drag and drop widgets to rearrange your dashboard layout
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Widget</span>
          </button>

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={twMerge(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
              isEditMode
                ? 'bg-accent text-white'
                : 'glass border border-border/50 hover:bg-surface-200/50'
            )}
          >
            <ArrowsUpDownIcon className="w-4 h-4" />
            <span>{isEditMode ? 'Exit Edit' : 'Edit Layout'}</span>
          </button>

          <button
            onClick={() => onSave(widgets)}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 hover:scale-105 transition-all duration-200"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Save Layout</span>
          </button>
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Add Widget</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="p-2 rounded-lg hover:bg-surface-200/50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="space-y-3">
              {widgetTypes.map((widgetType) => (
                <button
                  key={widgetType.type}
                  onClick={() => handleAddWidget(widgetType.type)}
                  className="w-full flex items-center space-x-3 p-3 glass border border-border/50 rounded-lg hover:bg-surface-200/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    {widgetType.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary">{widgetType.title}</h4>
                    <p className="text-xs text-text-muted">{widgetType.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-4 gap-4">
        {visibleWidgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={twMerge(
              'glass border border-border/50 rounded-xl p-4 min-h-[200px] relative group',
              getGridCols(widget.size),
              isEditMode && 'cursor-move',
              selectedWidget === widget.id && 'ring-2 ring-primary-500'
            )}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, widget.id)}
            onClick={() => isEditMode && setSelectedWidget(widget.id)}
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  {getWidgetIcon(widget.type)}
                </div>
                <h3 className="text-sm font-medium text-text-primary">
                  {widget.title}
                </h3>
              </div>

              {/* Edit Controls */}
              {isEditMode && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(widget.id)
                    }}
                    className="p-1 rounded hover:bg-surface-200/50 transition-colors"
                  >
                    {widget.isVisible ? (
                      <EyeIcon className="w-4 h-4 text-text-muted" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveWidget(widget.id)
                    }}
                    className="p-1 rounded hover:bg-danger/20 text-danger transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Widget Content Preview */}
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-16 h-16 bg-surface-200/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {getWidgetIcon(widget.type)}
                </div>
                <p className="text-sm text-text-muted">
                  {widget.type} widget content
                </p>
              </div>
            </div>

            {/* Size Indicator */}
            <div className="absolute bottom-2 right-2">
              <span className="text-xs px-2 py-1 bg-surface-200/50 rounded-full text-text-muted">
                {widget.size}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Widget Controls */}
      {selectedWidget && isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-border/50 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Widget Settings
          </h3>

          {(() => {
            const widget = widgets.find(w => w.id === selectedWidget)
            if (!widget) return null

            return (
              <div className="space-y-4">
                {/* Size Selector */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Widget Size
                  </label>
                  <div className="flex items-center space-x-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => handleSizeChange(widget.id, size.value as Widget['size'])}
                        className={twMerge(
                          'px-3 py-2 rounded-lg text-sm transition-colors',
                          widget.size === size.value
                            ? 'bg-primary-600 text-white'
                            : 'glass border border-border/50 hover:bg-surface-200/50'
                        )}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Visible</span>
                  <button
                    onClick={() => handleToggleVisibility(widget.id)}
                    className={twMerge(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      widget.isVisible ? 'bg-primary-600' : 'bg-surface-200'
                    )}
                  >
                    <span
                      className={twMerge(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        widget.isVisible ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="w-full px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-600 transition-colors"
                >
                  Remove Widget
                </button>
              </div>
            )
          })()}
        </motion.div>
      )}

      {/* Hidden Widgets */}
      {widgets.some(w => !w.isVisible) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-border/50 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Hidden Widgets
          </h3>

          <div className="space-y-2">
            {widgets.filter(w => !w.isVisible).map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 glass border border-border/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-surface-200/50 rounded-lg flex items-center justify-center">
                    {getWidgetIcon(widget.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">
                      {widget.title}
                    </h4>
                    <p className="text-xs text-text-muted">
                      {widget.size} · {widget.type}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleVisibility(widget.id)}
                  className="p-2 rounded-lg hover:bg-surface-200/50 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DashboardCustomizer
