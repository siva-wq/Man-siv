import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './MessageComponent.css';

const MessageComponent = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Join with userId
    newSocket.emit('join', userId);

    // Load existing messages
    fetchMessages();

    // Load notifications
    fetchNotifications();

    return () => newSocket.disconnect();
  }, [userId]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('receiveMessage', (data) => {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      });

      // Listen for notifications
      socket.on('notification', (notification) => {
        setNotifications(prev => [...prev, notification]);
      });

      // Listen for pending notifications
      socket.on('pendingNotifications', (pendingNotifications) => {
        setNotifications(pendingNotifications);
      });
    }
  }, [socket]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/messages');
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedImage) return;

    try {
      let imageUrl = '';
      
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadResponse = await axios.post('http://localhost:3000/api/upload', formData);
        imageUrl = uploadResponse.data.imageUrl;
      }

      // Send message through socket
      socket.emit('sendMessage', {
        senderId: userId,
        receiverId: 'all', // For group chat. Modify for direct messages
        message: message.trim(),
        imageUrl
      });

      // Clear input
      setMessage('');
      setSelectedImage(null);
      
      // Reset file input
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleShare = async (messageId) => {
    try {
      const messageToShare = messages.find(m => m._id === messageId);
      await axios.post('http://localhost:3000/api/share', {
        senderId: userId,
        receiverId: 'all', // Modify for specific user
        content: messageToShare
      });
    } catch (error) {
      console.error('Error sharing message:', error);
    }
  };

  return (
    <div className="message-container">
      <div className="notifications-panel">
        <h3>Notifications</h3>
        {notifications.map((notification, index) => (
          <div key={index} className="notification">
            <p>
              {notification.type === 'message' 
                ? `New message from ${notification.from}`
                : `${notification.from} shared a post with you`}
            </p>
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <div className="messages-panel">
        <div className="messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <strong>{msg.senderId === userId ? 'You' : msg.senderId}</strong>
                <p>{msg.message}</p>
                {msg.imageUrl && (
                  <div className="message-image">
                    <img src={msg.imageUrl} alt="Shared" />
                  </div>
                )}
                <small>{new Date(msg.timestamp).toLocaleString()}</small>
                <button onClick={() => handleShare(msg._id)}>Share</button>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageChange}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default MessageComponent;
