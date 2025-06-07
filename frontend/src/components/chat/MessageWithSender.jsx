import React from 'react';
import './MessageWithSender.css';

export default function MessageWithSender({ msg, participantMap, currentUserId }) {
  // If sender_id matches currentUserId, show "You"
  let senderName = null;
  if (msg.sender_id === currentUserId) {
    senderName = 'You';
  } else if (participantMap && participantMap[msg.sender_id]) {
    senderName = participantMap[msg.sender_id];
  } else {
    senderName = 'Loading...';
  }

  // Determine if message is sent by current user
  const isSent = msg.sender_id === currentUserId;

  return (
    <div
      className={`message-with-sender ${isSent ? 'message-with-sender--sent' : 'message-with-sender--received'}`}>
      <div className="message-with-sender__sender">{senderName}</div>
      <div className="message-with-sender__body">{msg.body}</div>
      <div className="message-with-sender__timestamp">{new Date(msg.created_at).toLocaleTimeString()}</div>
    </div>
  );
}
