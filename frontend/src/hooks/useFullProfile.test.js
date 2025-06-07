import { renderHook, waitFor } from '@testing-library/react'
import useFullProfile from './useFullProfile'
import { vi } from 'vitest'

test('useFullProfile loads data', async () => {
  const loadOverview = vi.fn().mockResolvedValue({ id: 1 })
  const loadDetails = vi.fn().mockResolvedValue({ profile: { id: 1 } })

  const { result } = renderHook(() => useFullProfile({ loadOverview, loadDetails }))
  await waitFor(() => expect(result.current.loading).toBe(false))

  expect(loadOverview).toHaveBeenCalled()
  expect(loadDetails).toHaveBeenCalledWith(1)
  expect(result.current.data.profile.id).toBe(1)
})
