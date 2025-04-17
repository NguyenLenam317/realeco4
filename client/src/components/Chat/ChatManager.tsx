import React from 'react';
import axios from 'axios';
import SessionStorageManager from '../../utils/sessionStorage';
import { ChatMessage } from '../../types';

const ChatManager = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');

  React.useEffect(() => {
    // Load existing chat history from sessionStorage
    const savedChatHistory = SessionStorageManager.getChatHistory();
    setMessages(savedChatHistory || []);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Send message to server and get AI response
      console.log('Sending message:', JSON.stringify({ content: newMessage }));
      const response = await axios.post('/api/chat/message', 
        JSON.stringify({ content: newMessage }), 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Create user chat message object
      const userMessage: ChatMessage = {
        role: 'user',
        sender: 'user',
        content: newMessage
      };

      // Create AI response message object
      const aiMessage: ChatMessage = {
        role: 'assistant',
        sender: 'ai',
        content: response.data.response
      };

      // Update local state and sessionStorage
      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      SessionStorageManager.saveChatMessage(userMessage);
      SessionStorageManager.saveChatMessage(aiMessage);

      // Clear input
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestBody: { content: newMessage }
      });
      
      // Optionally, add an error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        sender: 'ai',
        content: error.response?.data?.message || 'Sorry, there was an error processing your message.'
      };
      setMessages([...messages, errorMessage]);
    }
  };

  const clearChat = () => {
    // Clear messages from local state and sessionStorage
    setMessages([]);
    SessionStorageManager.clearChatHistory();
  };

  // Debug logging for messages
  React.useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  return (
    <div>
      <div className="chat-messages">
        {messages.length === 0 && <div>No messages yet</div>}
        {messages.map((msg: ChatMessage, index: number) => {
          console.log(`Rendering message ${index}:`, msg);
          return (
            <div 
              key={index} 
              className={`message ${msg.role}`}
              style={{ 
                padding: '10px', 
                margin: '5px', 
                backgroundColor: msg.role === 'user' ? '#e0f7fa' : '#f0f0f0',
                borderRadius: '8px'
              }}
            >
              {msg.content}
            </div>
          );
        })}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={clearChat}>Clear Chat</button>
      </div>
    </div>
  );
};

export default ChatManager;
