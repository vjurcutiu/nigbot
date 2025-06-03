import React from 'react';
import './Conversation.css';


export default function Conversation({ conversation, isActive, onSelect }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onSelect === 'function') {
      onSelect(conversation.id);
    }
  };

  if (!conversation) {
    return (
      <div className="conversation">
        Select a conversation to view messages
      </div>
    );
  }

  // TODO: Replace mock avatar and name with real data from conversation participants
  const mockAvatarUrl = 'https://via.placeholder.com/40';
  const mockName = `User ${conversation.id}`;

  // Format last message timestamp if available
  const lastMessageTime = conversation.last_message?.created_at
    ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      role="button"
      tabIndex={0}
      className={`conversation${isActive ? ' conversation--active' : ''}`}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick(e)}
    >
      <img src={mockAvatarUrl} alt={`${mockName} avatar`} className="conversation__avatar" />
      <div className="conversation__content">
        <div className="conversation__title">{mockName}</div>
        <div className="conversation__last-message">{conversation.last_message?.body}</div>
      </div>
      <div className="conversation__meta">
        <span className="conversation__time">{lastMessageTime}</span>
        {conversation.unread_count > 0 && (
          <span className="conversation__unread-badge">{conversation.unread_count}</span>
        )}
      </div>
    </div>
  );
}
