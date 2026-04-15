import { useMemo } from 'react'

export type Role = 'admin' | 'manager' | 'accountant' | 'employee' | 'viewer'

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'companies', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'transactions', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'budgets', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'audit_logs', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
  ],
  manager: [
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'transactions', actions: ['create', 'read', 'update'] },
    { resource: 'budgets', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['create', 'read'] },
    { resource: 'audit_logs', actions: ['read'] },
  ],
  accountant: [
    { resource: 'transactions', actions: ['create', 'read', 'update'] },
    { resource: 'budgets', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
  ],
  employee: [
    { resource: 'transactions', actions: ['read'] },
    { resource: 'budgets', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
  ],
  viewer: [
    { resource: 'transactions', actions: ['read'] },
    { resource: 'budgets', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
  ],
}

export const routePermissions: Record<string, Role[]> = {
  '/dashboard': ['admin', 'manager', 'accountant', 'employee', 'viewer'],
  '/transactions': ['admin', 'manager', 'accountant', 'employee', 'viewer'],
  '/expenses': ['admin', 'manager', 'accountant', 'employee', 'viewer'],
  '/budgets': ['admin', 'manager', 'accountant', 'employee', 'viewer'],
  '/reports': ['admin', 'manager', 'accountant', 'employee', 'viewer'],
  '/notifications': ['admin', 'manager', 'accountant', 'employee', 'viewer'],
  '/users': ['admin', 'manager'],
  '/companies': ['admin'],
  '/settings': ['admin', 'manager'],
  '/audit-logs': ['admin', 'manager'],
}

interface UsePermissionsOptions {
  role?: Role
}

export const usePermissions = ({ role = 'viewer' }: UsePermissionsOptions = {}) => {
  const permissions = useMemo(() => rolePermissions[role] || [], [role])

  const hasPermission = useMemo(() => {
    return (resource: string, action: string) => {
      const permission = permissions.find(p => p.resource === resource)
      return permission?.actions.includes(action as any) || false
    }
  }, [permissions])

  const canAccessRoute = useMemo(() => {
    return (route: string) => {
      const allowedRoles = routePermissions[route]
      return allowedRoles?.includes(role) || false
    }
  }, [role])

  const getAccessibleRoutes = useMemo(() => {
    return Object.entries(routePermissions)
      .filter(([_, allowedRoles]) => allowedRoles.includes(role))
      .map(([route]) => route)
  }, [role])

  return {
    permissions,
    hasPermission,
    canAccessRoute,
    getAccessibleRoutes,
    role,
  }
}
