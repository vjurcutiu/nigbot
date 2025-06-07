import { render, screen, waitFor } from '@testing-library/react'
import JobsList from './JobsList'
import React from 'react'
import { vi } from 'vitest'
import api from '../../../services/api'

vi.mock('../../../services/api', () => ({ default: { get: vi.fn() } }))

test('shows message when no jobs', async () => {
  api.get.mockResolvedValue({ data: { jobs: [] } })
  render(<JobsList />)
  await waitFor(() => expect(screen.getByText('No jobs found')).toBeInTheDocument())
})
