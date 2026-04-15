import React from 'react'

const Transactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Transactions</h1>
        <p className="text-slate-400 mt-1">Manage and track all financial transactions</p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <p className="text-slate-400">Transactions page will be implemented with full CRUD operations, filtering, and export capabilities.</p>
      </div>
    </div>
  )
}

export default Transactions
