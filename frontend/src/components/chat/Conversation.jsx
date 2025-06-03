import React from 'react';

export default function Conversation({ conversation, isActive, onSelect }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onSelect === 'function') {
      onSelect(conversation.id);
    }
  };

  if (!conversation) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a conversation to view messages
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`p-2 cursor-pointer hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick(e)}
    >
      <div className="font-semibold">Conversation {conversation.id}</div>
      <div className="text-sm text-gray-600 truncate">{conversation.last_message?.body}</div>
      {conversation.unread_count > 0 && (
        <span className="bg-red-500 text-white text-xs px-1 rounded">{conversation.unread_count}</span>
      )}
    </div>
  );
}
