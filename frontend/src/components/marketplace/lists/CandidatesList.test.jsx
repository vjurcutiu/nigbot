import { render, screen, waitFor } from '@testing-library/react'
import CandidatesList from './CandidatesList'
import React from 'react'
import { vi } from 'vitest'
import api from '../../../services/api'

vi.mock('../../../services/api', () => ({ default: { get: vi.fn() } }))

test('renders candidates from api', async () => {
  api.get.mockResolvedValue({ data: { candidates: [{ id: 1, name: 'Bob', role: 'Dev' }] } })
  render(<CandidatesList />)
  expect(api.get).toHaveBeenCalledWith('/candidates')
  await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
})
