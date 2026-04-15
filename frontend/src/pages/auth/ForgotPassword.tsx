import React from 'react'

const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Finance Analyser
          </h1>
          <p className="mt-2 text-slate-400">Reset your password</p>
        </div>
        
        <div className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400">Password reset form will be implemented here.</p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
