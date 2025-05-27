import React, { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRInfinite from 'swr/infinite';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';
const fetcher = url => fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());

// Initialize socket outside component to avoid reconnects
const socket = io(`${API_URL}/inbox`, {
  auth: { token: localStorage.getItem('token') },
});

export default function Inbox() {
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState('');

  // 1. Conversations list
  const { data: convos = [], error: convError } = useSWR(
    '/api/conversations',
    fetcher,
    { refreshInterval: 10000 }
  );

  // 2. Messages pagination
  const getKey = (pageIndex, previousPage) => {
    if (!activeConv) return null;
    if (pageIndex === 0) return `/api/conversations/${activeConv}/messages?limit=50`;
    if (!previousPage.nextCursor) return null;
    return `/api/conversations/${activeConv}/messages?cursor=${previousPage.nextCursor}&limit=50`;
  };

  const {
    data: pages,
    size,
    setSize,
    error: msgError,
  } = useSWRInfinite(getKey, fetcher);

  const messages = pages ? pages.flatMap(p => p.messages) : [];
  const hasNextPage = pages && pages[pages.length - 1].nextCursor;

  // 3. Real-time updates
  useEffect(() => {
    if (!activeConv) return;
    socket.emit('join', { conversation_id: activeConv });
    socket.on('new_message', msg => {
      if (msg.conversation_id !== activeConv) return;
      // update SWR cache
      mutate(`/api/conversations/${activeConv}/messages?limit=50`, old => {
        return {
          messages: [...(old?.messages || []), msg],
          nextCursor: old?.nextCursor,
        };
      }, false);
      // refresh conversations list
      mutate('/api/conversations');
    });
    return () => {
      socket.emit('leave', { conversation_id: activeConv });
      socket.off('new_message');
    };
  }, [activeConv]);

  // 4. Mark read on conv change
  useEffect(() => {
    if (activeConv) {
      fetch(`/api/conversations/${activeConv}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(() => mutate('/api/conversations'));
    }
  }, [activeConv]);

  // 5. Send message
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const body = inputText.trim();
    setInputText('');
    const url = `/api/conversations/${activeConv}/messages`;
    // optimistic update
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = { id: tempId, sender_id: 'me', body, created_at: new Date().toISOString() };
    mutate(
      `/api/conversations/${activeConv}/messages?limit=50`,
      old => ({ messages: [...old.messages, optimisticMsg], nextCursor: old.nextCursor }),
      false
    );
    // POST
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ body }),
    })
      .then(res => res.json())
      .then(serverMsg => {
        // replace temp message
        mutate(
          `/api/conversations/${activeConv}/messages?limit=50`,
          old => ({
            messages: old.messages.map(m => m.id === tempId ? serverMsg : m),
            nextCursor: old.nextCursor
          })
        );
        mutate('/api/conversations');
      });
  };

  // 6. Scroll to bottom
  const endRef = useRef();
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (convError) return <div>Error loading conversations</div>;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-2 overflow-y-auto">
        {convos.map(conv => (
          <div
            key={conv.id}
            className={`p-2 cursor-pointer hover:bg-gray-100 ${activeConv === conv.id ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveConv(conv.id)}
          >
            <div className="font-semibold">Conversation {conv.id}</div>
            <div className="text-sm text-gray-600 truncate">{conv.last_message?.body}</div>
            {conv.unread_count > 0 && (
              <span className="bg-red-500 text-white text-xs px-1 rounded">{conv.unread_count}</span>
            )}
          </div>
        ))}
      </div>

      {/* Thread view */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {msgError && <div>Error loading messages</div>}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-2 max-w-xs p-2 rounded-lg ${msg.sender_id === 'me' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
              <div>{msg.body}</div>
              <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={endRef} />
          {hasNextPage && <button onClick={() => setSize(size + 1)} className="w-full p-2">Load more</button>}
        </div>
        <div className="p-2 border-t flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Type a message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
0
