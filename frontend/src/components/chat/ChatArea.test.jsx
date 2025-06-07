import { render, screen } from '@testing-library/react'
import ChatArea from './ChatArea'
import React from 'react'

test('shows placeholder when no conversation selected', () => {
  render(
    <ChatArea
      activeConv={null}
      messages={[]}
      participantMap={{}}
      msgError={null}
      hasNextPage={false}
      setSize={() => {}}
      size={0}
      inputText=""
      setInputText={() => {}}
      sendMessage={() => {}}
      endRef={null}
      currentUserId={1}
    />
  )
  expect(screen.getByText('Select a conversation')).toBeInTheDocument()
})
