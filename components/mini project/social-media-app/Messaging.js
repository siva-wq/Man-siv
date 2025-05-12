import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Messaging.css";
import Webcam from 'react-webcam';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faImage, 
  faUpload, 
  faCamera, 
  faTimes, 
  faShare,
  faSearch,
  faCameraRotate,
  
} from "@fortawesome/free-solid-svg-icons";

const Messaging = () => {
  const [facingMode, setFacingMode] = useState("user");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showChatBox, setShowChatBox] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const socket = useRef();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [sfollowers, setsfollowers] = useState([]);
  const [totalFollowers, setTotalFollowers] = useState({});
  const [userFollows, setUserFollows] = useState({});
  const [following, setFollowing] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Webcam configuration
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // Handle webcam capture
  const handleCapture = useCallback(() => {
    if (!webcamRef.current) {
      setError("Camera not ready");
      return;
    }

    setLoading(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const newFile = new File([blob], "webcam-photo.jpg", {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          setFile(newFile);
          setImagePreview(imageSrc);
          setShowCamera(false);
          setError("");
        })
        .catch(err => {
          setError("Failed to process captured image");
          console.error("Error processing capture:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      setError("Failed to capture photo");
      console.error("Capture error:", err);
      setLoading(false);
    }
  }, [webcamRef]);

  // Start camera
  const startCamera = () => {
    setShowCamera(true);
    setShowUploadOptions(false);
  };

  // Stop camera
  const stopCamera = () => {
    setShowCamera(false);
  };

  const handleFileChange = (e) => {
    console.log("File input triggered");
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
  
    console.log("Selected file:", selectedFile);
    
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      setFile(null);
      return;
    }
  
    if (selectedFile.size > 5000000) {
      setError("Image size should be less than 5MB.");
      setFile(null);
      return;
    }
  
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setShowUploadOptions(false);
    setError(""); // Clear previous errors
  };
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  
  const isFollow = async (userid, followerid) => {
    try {
      const response = await axios.get(`
        http://192.168.221.249/social_api/api/isfollow.php?user_id=${userid}&follower_id=${followerid}
      `);
      return response.data.status || false;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  };

  const fetchSuggestedFollowers = async () => {
    try {
      const userResponse = await axios.get(`
        http://192.168.221.249/social_api/api/getusers.php
      `);
      const data = userResponse.data.map((follower) => ({
        ...follower,
        profile_pic: follower.profile_pic
          ? follower.profile_pic.replace(
              "C:/Users/durga/OneDrive/Desktop/Desktop/fed/React/myapp/public/",
              ""
            )
          : "default.jpg",
      }));

      const initialFollows = {};
      const initialFollowers = {};
      const totalFollowing = {};

      const promises = data.map(async (follower) => {
        const followStatus = await isFollow(follower.id, userId);
        initialFollows[follower.id] = followStatus;

        const followerResponse = await axios.get(`
          http://192.168.221.249/social_api/api/getfollowercount.php?user_id=${follower.id}
        `);
        initialFollowers[follower.id] = followerResponse.data?.follower_count || 0;
        totalFollowing[follower.id] = followerResponse.data?.following_count || 0;
      });

      await Promise.all(promises);

      setsfollowers(data);
      setUserFollows(initialFollows);
      setTotalFollowers(initialFollowers);
      setFollowing(totalFollowing);
    } catch (error) {
      console.error("Error fetching suggested followers:", error);
    }
  };

  useEffect(() => {
    socket.current = io("http://192.168.221.249:3001");

    socket.current.emit("join", userId);

    socket.current.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      if (data.senderId !== userId) {
        addNotification({
          type: 'message',
          from: data.senderId,
          content: data.message,
          timestamp: new Date()
        });
      }
      scrollToBottom();
    });

    socket.current.on("notification", (notification) => {
      addNotification(notification);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userId]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`
        http://192.168.221.249/social_api/api/message.php?sender_id=${userId}&receiver_id=${receiverId}
      `);
      setMessages(response.data || []);
      console.log("messsages",messages)
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();
  
    if (!receiverId) return;
  
    if (!message.trim() && !file) {
      setError("Please enter a message or select an image.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const formData = new FormData();
      formData.append("sender_id", userId);
      formData.append("receiver_id", receiverId);
      formData.append("message", message);
  
      if (file) {
        formData.append("image", file);
      }
  
      const response = await axios.post(
        "http://192.168.221.249/social_api/api/uploadmessage.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
  
      if (response.data.status === "success") {
        const newMessage = {
          id: response.data.message_id,
          sender_id: userId,
          receiver_id: receiverId,
          message: message,
          images: file ? response.data.image_url : null,
          timestamp: new Date().toISOString(),
        };
  
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage("");
        setFile(null);
        setImagePreview(null);
        resetFileInput();

        scrollToBottom();
        socket.current.emit("sendMessage", newMessage);
      } else {
        setError("Failed to send message: " + (response.data.message || "Unknown error"));
      }
  
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to send message.");
      setLoading(false);
    }
  };
  
  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const handleShare = async (messageId) => {
    try {
      const messageToShare = messages.find(m => m.id === messageId);
      await axios.post("http://192.168.221.249/social_api/api/share.php", {
        sender_id: userId,
        receiver_id: receiverId,
        shared_message_id: messageId
      });

      addNotification({
        type: 'share',
        from: userId,
        content: messageToShare.message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error sharing message:", error);
      setError("Failed to share message");
    }
  };

  useEffect(() => {
    fetchSuggestedFollowers();
  }, []);

  useEffect(() => {
    if (receiverId) {
      fetchMessages();
    }
  }, [receiverId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //useEffect(() => {
   // const messagesContainer = document.querySelector('.messages-container');
    //if (messagesContainer) {
      //messagesContainer.scrollTop = messagesContainer.scrollHeight;
    //}
  //}, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    setShowUploadOptions(!showUploadOptions);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  

  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get('http://192.168.221.249/social_api/api/get_online_users.php');
      setOnlineUsers(response.data);
      console.log("online users")
      console.log(onlineUsers)
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };
  useEffect(()=>{
    fetchOnlineUsers()
  },[])
  const markMessagesAsSeen = async () => {
    if (receiverId) {
      try {
        await axios.post('http://192.168.221.249/social_api/api/mark_messages_seen.php', {
          sender_id: receiverId,
          receiver_id: userId
        });
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    }
  };

 /* useEffect(() => {
   // updateUserOnlineStatus();
    

    const onlineInterval = setInterval(updateUserOnlineStatus, 30000);
    const fetchInterval = setInterval(fetchOnlineUsers, 10000);

    const handleBeforeUnload = () => {
      const offlineRequest = new XMLHttpRequest();
      offlineRequest.open('POST', 'http://192.168.221.249/social_api/api/update_status.php', false);
      offlineRequest.setRequestHeader('Content-Type', 'application/json');
      offlineRequest.send(JSON.stringify({
        user_id: userId,
        status: 'offline'
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(onlineInterval);
      clearInterval(fetchInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [userId]);*/

  useEffect(() => {
    
    if (receiverId && messages.length > 0) {
      markMessagesAsSeen();
    }
  }, [receiverId, messages]);

  return (
    <div className="messaging-container">
      <div className="users-section">
  <div className="search-container">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search users..."
      className="search-input"
    />
  </div>
  <ul>
    {sfollowers.filter((follower) =>
      follower.username.toLowerCase().includes(searchTerm.toLowerCase())
    ).map((follower) => (
      <li key={follower.id} className="user-item" onClick={() => {
        console.log('User clicked:', follower.username);
        setReceiverId(follower.id);
        setSelectedReceiver(follower.username || "Anonymous");
        setShowChatBox(true);
      }}>
        <div className="user-info">
          <div
            className="user-avatar"
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem("subprofile", follower.id);
              navigate("/Subprofile");
            }}
            style={{
              backgroundImage: `url(${follower.profile_pic})`,
            }}
            
          >
            
          </div>
          
          <div className="user-details">
            <span className="username">{follower.username || "Anonymous"}</span>
            <span className={`online-status ${onlineUsers[follower.id] ? 'online' : 'offline'}`}>
              {onlineUsers[follower.id] ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </li>
    ))}
  </ul>
</div>


      {showChatBox && receiverId && (
        <div className="messages-section">
          <h3>Chat with {selectedReceiver}</h3>
          <div className="messages-container">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-item ${
                    Number(msg.sender_id) === Number(userId)
                      ? "message-sent"
                      : "message-received"
                  }`}
                >
                  <div className="message-content">
                    <button 
                      onClick={() => handleShare(msg.id)} 
                      className="share-button"
                      title="Share this message"
                      style={{ position: 'absolute', top: 0, right: 0 }}
                    >
                      <FontAwesomeIcon icon={faShare} />
                    </button>
                    {msg.message && (
                      <div className="message-text">
                        {msg.message.length > 20
                          ? msg.message.match(/.{1,10}/g).map((chunk, index) => (
                              <div key={index}>{chunk}</div>
                            ))
                          : msg.message}
                      </div>
                    )}
                    {msg.images && (
                      <img
                        src={msg.images}
                        alt="Uploaded"
                        className="message-image"
                        onClick={() => window.open(msg.images, '_blank')}
                        onError={(e) => {
                          console.error("Image load error:", e);
                          e.target.onerror = null;
                          e.target.src = "default-image.jpg";
                        }}
                      />
                    )}
                    <small className="message-time">
                      {msg.created_at}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p>No messages found</p>
            )}
            <div ref={messageEndRef} style={{ height: "1px" }} />
          </div>
          <div className="message-input-container">
            {error && <div className="error-message">{error}</div>}
            <div className="input-wrapper">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                id="file-input"
              />
              <button 
                onClick={() => setShowUploadOptions(!showUploadOptions)} 
                className="attach-btn"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faImage} />
              </button>
              {showUploadOptions && (
                <div className="upload-options">
                  <button onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}>
                    <FontAwesomeIcon icon={faUpload} /> Upload Image
                  </button>
                  <button onClick={startCamera}>
                    <FontAwesomeIcon icon={faCamera} /> Take Photo
                  </button>
                </div>
              )}
              <button 
                onClick={sendMessage} 
                className="send-btn" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
            
            {showCamera && (
              <div className="camera-overlay">
                <div className="camera-container">
                  <div className="video-container">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="webcam-video"
                    />
                  </div>
                  <div className="camera-controls">
                    <button 
                      className="camera-button" 
                      onClick={handleCapture}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faCamera} /> 
                      {loading ? "Processing..." : "Take Photo"}
                    </button>
                    <button 
                      className="camera-button" 
                      onClick={stopCamera}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Cancel
                    </button>
                    <button className="camera-button" 
                            onClick={toggleCamera}>
                              <FontAwesomeIcon icon={faCameraRotate} /> Cancel
                              Switch Camera
                    </button>
                  </div>
                </div>
              </div>
            )}
            {imagePreview && (
              <div className="preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button onClick={() => {
                  setImagePreview(null);
                  setFile(null);
                }} className="remove-preview">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}
          </div>
          <div ref={messageEndRef} />
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Messaging;