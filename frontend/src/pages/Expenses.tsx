import React from 'react'

const Expenses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Expenses</h1>
        <p className="text-slate-400 mt-1">Track and manage all business expenses</p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <p className="text-slate-400">Expenses page will be implemented with expense tracking, categorization, and reporting features.</p>
      </div>
    </div>
  )
}

export default Expenses
