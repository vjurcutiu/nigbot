import { render, screen } from '@testing-library/react'
import LoginForm from './LoginForm'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

test('renders login form', () => {
  render(
    <BrowserRouter>
      <LoginForm onLogin={() => {}} />
    </BrowserRouter>
  )
  expect(screen.getByText('Login')).toBeInTheDocument()
})
