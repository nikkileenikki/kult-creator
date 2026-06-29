import { createAuthClient } from 'better-auth/client'

export const creatorAuthClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  basePath: '/api/creator-auth',
})
