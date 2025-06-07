import { render, screen, waitFor } from '@testing-library/react'
import CompaniesList from './CompaniesList'
import React from 'react'
import { vi } from 'vitest'
import api from '../../../services/api'

vi.mock('../../../services/api', () => ({ default: { get: vi.fn() } }))

test('shows error when api fails', async () => {
  api.get.mockRejectedValue({ response: { data: { error: 'fail' } } })
  render(<CompaniesList />)
  await waitFor(() => expect(screen.getByText(/fail/)).toBeInTheDocument())
})
