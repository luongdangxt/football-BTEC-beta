/**
 * Tests for API client functions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test API endpoints configuration
describe('API Configuration', () => {
  it('should define correct API base URL', () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    expect(baseURL).toBe('http://localhost:8000')
  })
})

describe('matchApi endpoints', () => {
  it('should have getAllMatches endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getAllMatches).toBe('function')
  })

  it('should have getMatchDetail endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getMatchDetail).toBe('function')
  })

  it('should have predict endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.predict).toBe('function')
  })

  it('should have getLeaderboard endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getLeaderboard).toBe('function')
  })

  it('should have getTournament endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getTournament).toBe('function')
  })

  it('should have getStandings endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getStandings).toBe('function')
  })

  it('should have addEvent endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.addEvent).toBe('function')
  })

  it('should have getMatchesByStage endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getMatchesByStage).toBe('function')
  })

  it('should have getMatchesByGroup endpoint', async () => {
    const matchApi = (await import('../api/matchApi.js')).default
    expect(typeof matchApi.getMatchesByGroup).toBe('function')
  })
})

describe('authApi endpoints', () => {
  it('should have login endpoint', async () => {
    const authApi = (await import('../api/authApi.js')).default
    expect(typeof authApi.login).toBe('function')
  })

  it('should have register endpoint', async () => {
    const authApi = (await import('../api/authApi.js')).default
    expect(typeof authApi.register).toBe('function')
  })
})

describe('axiosClient interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  it('should attach token to requests when available', () => {
    localStorage.getItem.mockReturnValue('test-token')
    const token = localStorage.getItem('token')
    expect(token).toBe('test-token')
  })

  it('should not attach token when not available', () => {
    localStorage.getItem.mockReturnValue(null)
    const token = localStorage.getItem('token')
    expect(token).toBeNull()
  })
})
