import React, { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { io } from 'socket.io-client';
import Conversation from './Conversation';
import MessageWithSender from './MessageWithSender';
import chatService from '../../services/chatService';
import ChatArea from './ChatArea';
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

  // Local state to force re-render on message updates
  const [localMessages, setLocalMessages] = useState([]);
  const messages = localMessages;

  // Sync localMessages with SWRInfinite pages
  useEffect(() => {
    if (pages) {
      const allMessages = pages.flatMap(p => p.items);
      setLocalMessages(allMessages.slice().reverse());
    } else {
      setLocalMessages([]);
    }
  }, [pages]);
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
      // force revalidation to refetch messages from server
      mutate(`/api/conversations/${activeConv}/messages?limit=50`, undefined, true);
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
    // Optimistically update localMessages
    setLocalMessages(prev => [...prev, optimisticMsg]);
    mutate(
      `/api/conversations/${activeConv}/messages?limit=50`,
      oldPages => {
        if (!oldPages) {
          // If no pages exist yet, create the first page with the optimistic message
          return [{ items: [optimisticMsg], nextCursor: null }];
        }
        // Add the optimistic message to the last of the first page's items array
        return [
          {
            ...oldPages[0],
            items: [...(oldPages[0]?.items || []), optimisticMsg],
          },
          ...oldPages.slice(1),
        ];
      },
      false
    );
    scrollToBottom();
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
        // Replace temp message in localMessages with serverMsg
        setLocalMessages(prev =>
          prev.map(m => m.id === tempId ? serverMsg : m)
        );
        mutate(
          `/api/conversations/${activeConv}/messages?limit=50`,
          oldPages => {
            if (!oldPages) return oldPages;
            // Replace temp message with serverMsg in the first page only
            return [
              {
                ...oldPages[0],
                items: oldPages[0].items.map(m => m.id === tempId ? serverMsg : m),
              },
              ...oldPages.slice(1),
            ];
          }
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

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  };

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
          <div
            key={conv.id}
            className={`inbox__sidebar-item${activeConv === conv.id ? ' inbox__sidebar-item--active' : ''}`}
            onClick={() => setActiveConv(conv.id)}
            role="button"
            tabIndex={0}
            onKeyPress={e => { if (e.key === 'Enter') setActiveConv(conv.id); }}
          >
            <Conversation
              conversation={conv}
              isActive={activeConv === conv.id}
              onSelect={setActiveConv}
            />
          </div>
        ))}
      </div>

      {/* Thread view */}
      <ChatArea
        key={activeConv}
        activeConv={activeConv}
        messages={messages}
        participantMap={participantMap}
        msgError={msgError}
        hasNextPage={hasNextPage}
        setSize={setSize}
        size={size}
        inputText={inputText}
        setInputText={setInputText}
        sendMessage={sendMessage}
        endRef={endRef}
      />
    </div>
  );
}
