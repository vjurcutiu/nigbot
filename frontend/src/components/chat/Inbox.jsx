import React, { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { io } from 'socket.io-client';
import Conversation from './Conversation';
import MessageWithSender from './MessageWithSender';
import chatService from '../../services/chatService';
import './Inbox.css';

const API_URL = import.meta.env.VITE_API_URL || '';
  const fetcher = async url => {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    const res = await fetch(fullUrl, { 
      credentials: 'include'
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Failed to parse JSON response from ${fullUrl}: ${text}`);
    }
  };

// Initialize socket outside component to avoid reconnects
const socket = io(`${API_URL}/inbox`, {
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket', 'polling'],
});


export default function Inbox() {
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState('');
  const [participantMap, setParticipantMap] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const messages = pages ? pages.flatMap(p => p.items) : [];
  const hasNextPage = pages && pages[pages.length - 1].nextCursor;

  // 3. Fetch participants when activeConv changes
  useEffect(() => {
    if (!activeConv) {
      setParticipantMap({});
      return;
    }
    async function fetchParticipants() {
      const participants = await chatService.getParticipants(activeConv);
      setParticipantMap(participants);
    }
    fetchParticipants();
  }, [activeConv]);

  // 4. Real-time updates
  useEffect(() => {
    if (!activeConv) return;
    socket.emit('join', { conversation_id: activeConv });
    socket.on('new_message', msg => {
      if (msg.conversation_id !== activeConv) return;
      // update SWR cache
      mutate(`/api/conversations/${activeConv}/messages?limit=50`, old => {
        return {
          items: [...(old?.items || []), msg],
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

  // 5. Mark read on conv change
  useEffect(() => {
    if (activeConv) {
      console.log('Marking conversation as read:', activeConv);
      fetch(`/api/conversations/${activeConv}/mark_read`, {
        method: 'POST',
        credentials: 'include',
      }).then(response => {
        console.log('Mark read response status:', response.status);
        return response.text();
      }).then(text => {
        console.log('Mark read response text:', text);
        mutate('/api/conversations');
      }).catch(error => {
        console.error('Error marking conversation as read:', error);
      });
    }
  }, [activeConv]);

  // 6. Send message
  const sendMessage = () => {
    if (!inputText.trim() || !activeConv) return;
    const body = inputText.trim();
    setInputText('');
    const url = `/api/conversations/${activeConv}/messages`;
    // optimistic update
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = { id: tempId, sender_id: 'me', body, created_at: new Date().toISOString(), conversation_id: activeConv };
    mutate(
      `/api/conversations/${activeConv}/messages?limit=50`,
      old => ({
        items: [...(old?.items || []), optimisticMsg],
        nextCursor: old?.nextCursor
      }),
      false
    );
    // POST
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ body }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(serverMsg => {
        // replace temp message
        mutate(
          `/api/conversations/${activeConv}/messages?limit=50`,
          old => ({
            items: old?.items.map(m => m.id === tempId ? serverMsg : m) || [],
            nextCursor: old?.nextCursor
          })
        );
        // Also update conversations list to reflect new last message and unread count
        mutate('/api/conversations');
      })
      .catch(err => {
        console.error('Failed to send message:', err);
      });
  };

  // 7. Scroll to bottom
  const endRef = useRef();
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 8. Sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (convError) {
    console.error('Error loading conversations:', convError);
    return <div>Error loading conversations: {convError.message || JSON.stringify(convError)}</div>;
  }

  return (
    <div className={`inbox${sidebarCollapsed ? ' inbox--sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="inbox__sidebar">
        <button className="inbox__sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
        {convos.map(conv => (
          <Conversation
            key={conv.id}
            conversation={conv}
            isActive={activeConv === conv.id}
            onSelect={setActiveConv}
          />
        ))}
      </div>

      {/* Thread view */}
      <div className="inbox__chat">
        <div className="inbox__chat-header">
          {activeConv ? `Conversation ${activeConv}` : 'Select a conversation'}
        </div>
        <div className="inbox__messages">
        {msgError && <div>Error loading messages</div>}
        {messages.length === 0 && !msgError && activeConv && (
          <div className="text-center text-gray-500 mt-10">No messages in this conversation yet.</div>
        )}
        {messages.map(msg => (
          <MessageWithSender key={msg.id} msg={msg} participantMap={participantMap} />
        ))}
      </div>
      <div ref={endRef} />
      {hasNextPage && <button onClick={() => setSize(size + 1)} className="inbox__send-btn" style={{ width: '100%' }}>Load more</button>}
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
    </div>
  );
}
