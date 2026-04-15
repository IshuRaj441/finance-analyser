import React from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePermissions } from '@/hooks/usePermissions'
import AccessDenied from './AccessDenied'

interface ProtectedRouteProps {
  children: React.ReactNode
  resource?: string
  action?: string
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  resource,
  action,
  fallback
}) => {
  const location = useLocation()
  const { hasPermission, canAccessRoute } = usePermissions()

  // Check route-level permissions
  if (!canAccessRoute(location.pathname)) {
    return fallback || <AccessDenied />
  }

  // Check resource-level permissions if specified
  if (resource && action && !hasPermission(resource, action)) {
    return fallback || <AccessDenied />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

export default ProtectedRoute
