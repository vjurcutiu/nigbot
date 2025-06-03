import React from 'react';
import MessageWithSender from './MessageWithSender';
import './Inbox.css';

export default function ChatArea({
  activeConv,
  messages,
  participantMap,
  msgError,
  hasNextPage,
  setSize,
  size,
  inputText,
  setInputText,
  sendMessage,
  endRef,
  currentUserId,
}) {
  if (!activeConv) {
    return (
      <div className="inbox__chat">
        <div className="inbox__chat-header">Select a conversation</div>
      </div>
    );
  }

  return (
    <div className="inbox__chat">
      <div className="inbox__chat-header">Conversation {activeConv}</div>
      <div className="inbox__messages" ref={endRef}>
        {msgError && <div>Error loading messages</div>}
        {messages.length === 0 && !msgError && (
          <div className="text-center text-gray-500 mt-10">No messages in this conversation yet.</div>
        )}
        {messages.map(msg => (
          <MessageWithSender key={msg.id} msg={msg} participantMap={participantMap} currentUserId={currentUserId} />
        ))}
      </div>
      {hasNextPage && (
        <button
          onClick={() => setSize(size + 1)}
          className="inbox__send-btn"
          style={{ width: '100%' }}
        >
          Load more
        </button>
      )}
      <div className="inbox__input-row">
        <textarea
          className="inbox__input inbox__input--textarea"
          placeholder="Type a message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={2}
        />
        <button onClick={sendMessage} className="inbox__send-btn">Send</button>
      </div>
    </div>
  );
}
