import { render, screen } from '@testing-library/react'
import ProfileCard from './ProfileCard'
import React from 'react'

test('renders title and fields', () => {
  const fields = [{ label: 'Name', value: 'Alice' }]
  render(<ProfileCard title="Info" fields={fields} />)
  expect(screen.getByText('Info')).toBeInTheDocument()
  expect(screen.getByText('Name:')).toBeInTheDocument()
  expect(screen.getByText('Alice')).toBeInTheDocument()
})
