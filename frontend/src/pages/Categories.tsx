import React from 'react'

const Categories: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Categories</h1>
        <p className="text-slate-400 mt-1">Manage expense and income categories</p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <p className="text-slate-400">Categories page will be implemented with category management and analytics.</p>
      </div>
    </div>
  )
}

export default Categories
