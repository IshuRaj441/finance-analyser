import React from 'react'

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your personal information and preferences</p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <p className="text-slate-400">Profile page will be implemented with user management features.</p>
      </div>
    </div>
  )
}

export default Profile
