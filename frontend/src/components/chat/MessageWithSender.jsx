import React from 'react';
import chatService from '../../services/chatService';

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

  return (
    <div
      className={`mb-2 max-w-xs p-2 rounded-lg ${msg.sender_id === chatService.currentUserId ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
      <div className="font-semibold">{senderName || 'Loading...'}</div>
      <div>{msg.body}</div>
      <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</div>
    </div>
  );
}
