import React from 'react';
import './MessageWithSender.css';

export default function MessageWithSender({ msg, participantMap }) {
  // If sender_id is 'me', show "You"
  let senderName = null;
  if (msg.sender_id === 'me') {
    senderName = 'You';
  } else if (participantMap && participantMap[msg.sender_id]) {
    senderName = participantMap[msg.sender_id];
  } else {
    senderName = 'Loading...';
  }

  // If sender_id is 'me', treat as sent; otherwise, check for current user id if available
  const isSent = msg.sender_id === 'me';

  return (
    <div
      className={`message-with-sender ${isSent ? 'message-with-sender--sent' : 'message-with-sender--received'}`}>
      <div className="message-with-sender__sender">{senderName}</div>
      <div className="message-with-sender__body">{msg.body}</div>
      <div className="message-with-sender__timestamp">{new Date(msg.created_at).toLocaleTimeString()}</div>
    </div>
  );
}
