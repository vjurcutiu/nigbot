import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Conversation from './Conversation'
import React from 'react'
import { vi } from 'vitest'

test('shows placeholder when no conversation', () => {
  render(<Conversation conversation={null} />)
  expect(screen.getByText('Select a conversation to view messages')).toBeInTheDocument()
})

test('applies active class when isActive', () => {
  const conv = { id: 1, last_message: { body: 'hi' }, unread_count: 0 }
  render(<Conversation conversation={conv} isActive={true} onSelect={() => {}} />)
  expect(screen.getByRole('button').className).toContain('conversation--active')
})

test('calls onSelect when clicked', async () => {
  const conv = { id: 2, last_message: { body: 'hey' }, unread_count: 0 }
  const onSelect = vi.fn()
  render(<Conversation conversation={conv} isActive={false} onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button'))
  expect(onSelect).toHaveBeenCalledWith(2)
})
