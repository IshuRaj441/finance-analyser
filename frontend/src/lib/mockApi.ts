// Mock API for testing when backend is not fully configured
export const mockApi = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email === 'test@example.com' && password === 'password') {
      return {
        success: true,
        data: {
          data: {
            token: 'mock-jwt-token-12345',
            user: [{
              id: 1,
              company_id: 1,
              first_name: 'Test',
              last_name: 'User',
              email: 'test@example.com',
              phone: '+1234567890',
              avatar: null,
              status: 'active',
              roles: [{ id: 1, name: 'admin' }],
              permissions: [{ id: 1, name: 'all' }],
              company: {
                id: 1,
                name: 'Test Company',
                slug: 'test-company',
                plan: 'enterprise'
              }
            }]
          }
        }
      }
    }
    
    throw new Error('Invalid credentials')
  },
  
  getMe: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: {
        data: {
          id: 1,
          company_id: 1,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '+1234567890',
          avatar: null,
          status: 'active',
          roles: [{ id: 1, name: 'admin' }],
          permissions: [{ id: 1, name: 'all' }],
          company: {
            id: 1,
            name: 'Test Company',
            slug: 'test-company',
            plan: 'enterprise'
          }
        }
      }
    }
  }
}
