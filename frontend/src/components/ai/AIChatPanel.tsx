import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  UserIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  isTyping?: boolean
}

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  position?: 'right' | 'left'
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  onClose,
  className,
  position = 'right'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI financial assistant. I can help you analyze transactions, create reports, and provide insights about your financial data. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('transaction') || input.includes('spending')) {
      return 'Based on your recent transactions, I notice that your marketing expenses have increased by 23% this month. Your top spending category is Software Licenses at $2,890. Would you like me to create a detailed spending analysis report?'
    }
    
    if (input.includes('budget') || input.includes('budgeting')) {
      return 'Your current budget utilization is at 78% overall. The marketing department is at 92% utilization and may need adjustment. I recommend reviewing the Q4 marketing budget to prevent overspending.'
    }
    
    if (input.includes('report') || input.includes('analysis')) {
      return 'I can generate several types of reports for you: Financial Summary, Profit & Loss, Expense Breakdown, and Budget Analysis. Which type would you like me to create? I can also customize the date range and include specific metrics.'
    }
    
    if (input.includes('forecast') || input.includes('prediction')) {
      return 'Based on your historical data, I forecast a 12% increase in revenue for Q1 2024, with expenses likely to remain stable. Your profit margin should improve to approximately 34%. Would you like detailed monthly projections?'
    }
    
    return 'I understand you\'re looking for financial insights. I can help with transaction analysis, budget management, report generation, and forecasting. Could you be more specific about what you\'d like to know?'
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={twMerge(
              'fixed top-0 h-full w-full lg:w-96 lg:top-auto lg:bottom-0 lg:right-0 glass-strong border-l border-border/50 z-50 flex flex-col',
              position === 'left' ? 'lg:left-0 lg:right-auto lg:border-r lg:border-l-0' : '',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">AI Assistant</h3>
                  <p className="text-xs text-text-muted">Always here to help</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-surface-200/50 transition-colors">
                  <Cog6ToothIcon className="w-4 h-4 text-text-muted" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-200/50 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={twMerge(
                    'flex items-start space-x-3',
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  )}
                >
                  {/* Avatar */}
                  <div className={twMerge(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-gradient-primary text-white'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                  )}>
                    {message.role === 'user' ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <SparklesIcon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message */}
                  <div className={twMerge(
                    'max-w-[70%] lg:max-w-[80%]',
                    message.role === 'user' ? 'text-right' : ''
                  )}>
                    <div className={twMerge(
                      'inline-block px-4 py-2 rounded-xl text-sm',
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'glass border border-border/50 text-white'
                    )}>
                      {message.content}
                    </div>
                    <p className="text-xs text-text-muted mt-1 px-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                  <div className="glass border border-border/50 px-4 py-2 rounded-xl">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-end space-x-2">
                {/* Voice Input */}
                <button
                  onMouseDown={() => setIsRecording(true)}
                  onMouseUp={() => setIsRecording(false)}
                  onTouchStart={() => setIsRecording(true)}
                  onTouchEnd={() => setIsRecording(false)}
                  className={twMerge(
                    'p-2 rounded-lg transition-colors',
                    isRecording
                      ? 'bg-danger text-white'
                      : 'hover:bg-surface-200/50 text-text-muted'
                  )}
                >
                  {isRecording ? (
                    <StopIcon className="w-5 h-5" />
                  ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                  )}
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about your finances..."
                    className="w-full px-4 py-2 bg-surface-100/50 border border-border/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                    disabled={isTyping}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={twMerge(
                    'p-2 rounded-lg transition-all duration-200',
                    inputValue.trim() && !isTyping
                      ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105'
                      : 'text-text-muted cursor-not-allowed'
                  )}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-danger">
                  <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                  <span>Recording... Release to send</span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Analyze spending',
                  'Budget overview',
                  'Generate report',
                  'Forecast revenue'
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => setInputValue(action)}
                    className="px-3 py-1 text-xs bg-surface-100/50 border border-border/50 rounded-full hover:bg-surface-200/50 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AIChatPanel
