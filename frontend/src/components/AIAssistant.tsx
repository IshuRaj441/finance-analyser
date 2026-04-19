import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  Sparkles,
  TrendingUp,
  PieChart,
  DollarSign
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen: controlledIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user, hasPermission } = useAuthStore();

  const suggestedQuestions = [
    "How much did I spend last month?",
    "What are my top expense categories?",
    "Give me some savings advice",
    "Predict next month's expenses",
    "How am I doing on my budgets?",
    "What's my financial health score?"
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Analyze Spending', action: 'analyze' },
    { icon: PieChart, label: 'Budget Review', action: 'budget' },
    { icon: DollarSign, label: 'Savings Tips', action: 'savings' },
    { icon: Sparkles, label: 'AI Insights', action: 'insights' }
  ];

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      // Debug: Log user data and permissions
      console.log('AI Assistant Debug - User:', user);
      console.log('AI Assistant Debug - User permissions:', user?.permissions);
      console.log('AI Assistant Debug - User roles:', user?.roles);
      
      const canUseAI = hasPermission('use_ai_features')
      console.log('AI Assistant Debug - Can use AI:', canUseAI);
      console.log('AI Assistant Debug - Permission check result:', hasPermission('use_ai_features'));
      
      if (!canUseAI) {
        const noPermissionMessage: Message = {
          id: 'no-permission',
          role: 'assistant',
          content: `Hello ${user?.first_name || 'User'},\n\nYou don't have permission to use AI features. Please contact your administrator to get the necessary permissions to access the AI Financial Assistant.\n\nDebug Info:\n- User: ${user?.email}\n- Permissions: ${user?.permissions?.map((p: any) => p.name).join(', ') || 'None'}\n- Roles: ${user?.roles?.map((r: any) => r.name).join(', ') || 'None'}`,
          timestamp: new Date().toISOString()
        };
        setMessages([noPermissionMessage]);
      } else {
        // Add welcome message
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: `Hello ${user?.first_name || 'Admin'} — I'm your AI Financial Assistant.\n\nI can help you:\n• Analyze spending patterns\n• Review budgets and provide recommendations\n• Generate financial insights and predictions\n• Answer questions about your financial data\n\nHow can I assist you today?`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen, isMinimized, messages.length, user?.first_name, hasPermission]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if user is authenticated
    const { user, token } = useAuthStore.getState();
    if (!user || !token) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Please log in to use the AI assistant. You need to be authenticated to access AI features.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const canUseAI = hasPermission('use_ai_features')
    if (!canUseAI) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'You don\'t have permission to use AI features. Please contact your administrator to get the necessary permissions.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        message: messageToSend
      });

      console.log('AI Chat Response:', response.data);

      // Check if response is successful and has the expected format
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'AI service returned an error');
      }

      // Handle both possible response structures
      let aiResponse = null;
      
      if (response.data?.data?.response) {
        // Standard API response format: {success: true, data: {success: true, response: "..."}}
        aiResponse = response.data.data.response;
      } else if (response.data?.response) {
        // Direct response format: {success: true, response: "...", context_used: {...}}
        aiResponse = response.data.response;
      }

      if (!aiResponse) {
        console.error('Invalid AI response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI Chat Error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'I\'m having trouble connecting right now. Please try again in a moment.';
      
      // Use server error message if available
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to use the AI assistant. Your session may have expired.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You don\'t have permission to use AI features. Please contact your administrator for access to AI features.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network connection issue. Please check your internet connection.';
      } else if (error.message === 'AI service returned an error') {
        errorMessage = 'The AI service encountered an error. Please try again later.';
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    let message = '';
    
    switch (action) {
      case 'analyze':
        message = 'Analyze my spending patterns for the last 30 days';
        break;
      case 'budget':
        message = 'Review my current budgets and give recommendations';
        break;
      case 'savings':
        message = 'Give me personalized savings advice based on my financial data';
        break;
      case 'insights':
        message = 'Provide AI-powered insights about my financial health';
        break;
      default:
        return;
    }

    setInputValue(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Financial Assistant"
          title="AI Financial Assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></span>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Financial Assistant
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 w-[360px] h-[520px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      role="dialog"
      aria-labelledby="chat-header"
      aria-describedby="chat-messages"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-5 w-5" aria-hidden="true" />
          <div>
            <h3 id="chat-header" className="font-semibold">AI Financial Assistant</h3>
            <p className="text-xs opacity-90">Powered by advanced AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            id="chat-messages" 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`} aria-hidden="true">
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`px-4 py-3 rounded-xl shadow-md max-w-[75%] leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ml-auto'
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <p className={`text-sm whitespace-pre-wrap ${
                        message.role === 'assistant' ? 'text-gray-100' : 'text-white'
                      }`}>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="p-2 rounded-full bg-gray-800 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-gray-800 shadow-md max-w-[75%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 animate-pulse">AI is typing...</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && true && (
            <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
              <p className="text-xs text-gray-400 mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.action)}
                    disabled={isLoading}
                    className="flex items-center space-x-1 p-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <action.icon className="h-3 w-3" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length <= 1 && true && (
            <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
              <p className="text-xs text-gray-400 mb-2">Suggested Questions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your finances..."
                className="flex-1 resize-none bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                rows={2}
                disabled={isLoading}
                aria-label="Message input"
                aria-describedby="chat-help-text"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AIAssistant;
