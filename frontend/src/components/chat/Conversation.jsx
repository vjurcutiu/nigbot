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

  return (
    <div
      role="button"
      tabIndex={0}
      className={`conversation${isActive ? ' conversation--active' : ''}`}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick(e)}
    >
      <div className="conversation__title">Conversation {conversation.id}</div>
      <div className="conversation__last-message">{conversation.last_message?.body}</div>
      {conversation.unread_count > 0 && (
        <span className="conversation__unread-badge">{conversation.unread_count}</span>
      )}
    </div>
  );
}
