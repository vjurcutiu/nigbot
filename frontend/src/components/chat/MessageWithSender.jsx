import React from 'react';
import chatService from '../../services/chatService';

export default function MessageWithSender({ msg }) {
  const [senderName, setSenderName] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      const user = await chatService.getUser(msg.sender_id);
      if (isMounted) {
        setSenderName(chatService.getDisplayName(user));
      }
    }
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [msg.sender_id]);

  return (
    <div
      className={`mb-2 max-w-xs p-2 rounded-lg ${msg.sender_id === chatService.currentUserId ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
      <div className="font-semibold">{senderName || 'Loading...'}</div>
      <div>{msg.body}</div>
      <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</div>
    </div>
  );
}
