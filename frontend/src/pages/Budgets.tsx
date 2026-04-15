import React from 'react'

const Budgets: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Budgets</h1>
        <p className="text-slate-400 mt-1">Create and manage budget allocations</p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <p className="text-slate-400">Budgets page will be implemented with budget tracking and alerts.</p>
      </div>
    </div>
  )
}

export default Budgets
