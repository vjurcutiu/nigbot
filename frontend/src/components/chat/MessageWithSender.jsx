import React from 'react';
import chatService from '../../services/chatService';
import './MessageWithSender.css';

export default function MessageWithSender({ msg }) {
  const [senderName, setSenderName] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchParticipants() {
      const participants = await chatService.getParticipants(msg.conversation_id);
      if (isMounted) {
        const displayName = chatService.getDisplayNameFromMap(msg.sender_id, participants);
        setSenderName(displayName);
      }
    }
    fetchParticipants();
    return () => {
      isMounted = false;
    };
  }, [msg.sender_id, msg.conversation_id]);

  const isSent = msg.sender_id === chatService.currentUserId;

  return (
    <div
      className={`message-with-sender ${isSent ? 'message-with-sender--sent' : 'message-with-sender--received'}`}>
      <div className="message-with-sender__sender">{senderName || 'Loading...'}</div>
      <div className="message-with-sender__body">{msg.body}</div>
      <div className="message-with-sender__timestamp">{new Date(msg.created_at).toLocaleTimeString()}</div>
    </div>
  );
}
