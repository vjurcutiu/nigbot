import candidateService from './candidateService'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import api from './api'

vi.mock('./api', () => ({ default: { get: vi.fn(() => Promise.resolve({ data: { profile: {} } })), post: vi.fn(), patch: vi.fn() } }))

describe('candidateService', () => {
  beforeEach(() => {
    api.get.mockClear()
  })

  it('getProfile calls correct endpoint', async () => {
    await candidateService.getProfile()
    expect(api.get).toHaveBeenCalledWith('/candidate/profile')
  })
})
