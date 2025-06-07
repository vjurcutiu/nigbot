import chatService from './chatService'
import { describe, it, expect } from 'vitest'

describe('chatService helpers', () => {
  it('getDisplayNameFromMap works', () => {
    chatService.currentUserId = 1
    const map = { 2: 'Bob' }
    expect(chatService.getDisplayNameFromMap(1, map)).toBe('You')
    expect(chatService.getDisplayNameFromMap(2, map)).toBe('Bob')
    expect(chatService.getDisplayNameFromMap(3, map)).toBe('Unknown')
  })

  it('getDisplayName works', () => {
    chatService.currentUserId = 1
    expect(chatService.getDisplayName({ id: 1, name: 'Alice' })).toBe('You')
    expect(chatService.getDisplayName({ id: 2, username: 'b' })).toBe('b')
    expect(chatService.getDisplayName(null)).toBe('Unknown')
  })
})
