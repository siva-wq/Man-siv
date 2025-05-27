import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Messaging.css";
import Webcam from 'react-webcam';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API } from "./config";
import { 
  faImage, 
  faUpload, 
  faCamera, 
  faTimes, 
  faShare,
  faCameraRotate,
  
} from "@fortawesome/free-solid-svg-icons";

const Messaging = () => {
  const [facingMode, setFacingMode] = useState("user");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showChatBox, setShowChatBox] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [selectedReceiverimg,setselectedReceiverimg]=useState("")
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [sfollowers, setsfollowers] = useState([]);
  const [totalFollowers, setTotalFollowers] = useState({});
  const [userFollows, setUserFollows] = useState({});
  const [following, setFollowing] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sharesearch,setsharesearch]=useState("");
  const [notifications, setNotifications] = useState([]);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [openModalMessageId, setOpenModalMessageId] = useState(null);
  const [sharemsgid,setsharemsgid]=useState(0);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  
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
        ${API}isfollow.php?user_id=${userid}&follower_id=${followerid}
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
        ${API}getusers.php
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
          ${API}getfollowercount.php?user_id=${follower.id}
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

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`
        ${API}message.php?sender_id=${userId}&receiver_id=${receiverId}
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
        `${API}uploadmessage.php`,
        formData,
        {
           headers: { "Content-Type": "multipart/form-data" }
        }
      );
      console.log(response.data)
      if (response.data.status === "success") {
        const newMessage = {
          id: response.data.message_id,
          sender_id: userId,
          receiver_id: receiverId,
          message: message,
          images: response.data.images ? response.data.images : null,
          created_at:  new Date().toISOString(),
        };
  
       setMessages((prevMessages) => [...(Array.isArray(prevMessages) ? prevMessages : []), newMessage]);

        setMessage("");
        setFile(null);
        setImagePreview(null);
        resetFileInput();
        
        scrollToBottom();
        
        const notirespo=axios.post(
          `${API}notifications.php`,{receiverId,message:`Message from ${userId}`}
        )
      } else {
        console.log(response.data)
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
  const handleShare = async (receiver_id,shared_message_id) => {
    try {
      console.log("Sharing message", {
      sender_id: Number(userId),
      receiver_id,
      shared_message_id
      });
      const response=await axios.post(`${API}share.php`, {
        sender_id:Number(userId),
        receiver_id:Number(receiver_id),
        shared_message_id,
      }, {
         headers: {
            "Content-Type": "application/json",
          },
      });
      console.log(response)
      addNotification({
        type: 'share',
        from: userId,
        content: 'new message',
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error sharing message:", error);
      alert("failed to share message try again...")
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


  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get(`${API}get_online_users.php`);
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
        await axios.post(`${API}mark_messages_seen.php`, {
          sender_id: receiverId,
          receiver_id: userId
        });
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    }
  };

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
              <li key={follower.id} className="user-item" onClick={() => 
                  {
                    console.log('User clicked:', follower.username);
                    setReceiverId(follower.id);
                    setSelectedReceiver(follower.username || "Anonymous");
                    setselectedReceiverimg(follower.profile_pic)
                    setShowChatBox(true);
                  }
                }>
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
                    />
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
          <div style={{background:"skyblue"}}>
              <div
                className="user-avatar"
                onClick={()=>{
                  console.log(receiverId)
                  localStorage.setItem("subprofile", Number(receiverId));
                  navigate("/Subprofile")
                }}
                style={{
                  backgroundImage: `url(${selectedReceiverimg})`,
                  margin:"20px",
                }
              }/>
          </div>
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
                      onClick={() =>{ 
                      setsharemsgid(msg.id)
                      setOpenModalMessageId(msg.id)
                      }}  
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
                        src={`http://localhost${msg.images}`}
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
      {error && alert(error)}
       {openModalMessageId === sharemsgid && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
            <h2 style={{color:"white"}}>Select a user to share with</h2>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                <div className="users-section">
                <div className="search-container">
                <input
                  type="text"
                  value={sharesearch}
                  onChange={(e) => setsharesearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-4 py-2 mb-4 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
         </div>
  <ul>
    {sfollowers.filter((follower) =>
      follower.username.toLowerCase().includes(sharesearch.toLowerCase())
    ).map((follower) => (
      
        <div className="flex items-center gap-3">
          <div
            className="user-avatar"
            onClick={(e) => {
              handleShare(follower.id,sharemsgid)
              setOpenModalMessageId(null)
            }}
            style={{
              backgroundImage: `url(${follower.profile_pic})`,
            }}
            
          >
            
          </div>
          <span className="username">{follower.username || "Anonymous"}</span>
            <span className={`online-status ${onlineUsers[follower.id] ? 'online' : 'offline'}`}>
              {onlineUsers[follower.id] ? 'Online' : 'Offline'}
            </span>
         
        </div>
      
    ))}
  </ul>
  <div className="mt-6 text-center">
        <button
          onClick={() => setOpenModalMessageId(null)}
          className="text-sm text-gray-500 hover:text-blue-500"
        >
          Cancel
        </button>
      </div>
</div>
                                  </ul>
                               
                              </div>
                    </div>
                     )}
    </div>
  );

};

export default Messaging;