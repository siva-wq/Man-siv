import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faImage, faMessage, faBars } from '@fortawesome/free-solid-svg-icons';
import Profile from './components/mini project/social-media-app/Profile';
import Subprofile from './components/mini project/social-media-app/Subprofile';
import UploadPost from './components/mini project/social-media-app/UploadPost';
import PostFeed from './components/mini project/social-media-app/PostFeed';
import Login from './components/mini project/social-media-app/Authentication/Login';
import Signup from './components/mini project/social-media-app/Authentication/Signup';
import UploadProfilePic from './components/mini project/social-media-app/Authentication/ProfileUpload';
import MessageComponent from './components/mini project/social-media-app/MessageComponent';
import './App.css';
import ProfileUpload from './components/mini project/social-media-app/Authentication/ProfileUpload';
import Default from './components/mini project/social-media-app/Authentication/Default';
import Home from './components/mini project/social-media-app/Authentication/Home';
import AddBio from './components/mini project/social-media-app/Authentication/Addbio';
import Updatename from './components/mini project/social-media-app/Updatename';
import Messaging from './components/mini project/social-media-app/Messaging';
import Notifications from './components/mini project/social-media-app/Notifications';

const App = () => {
  const [userId, setUserId] = useState(null); 
  const [username, setusername] = useState(null); 
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://192.168.221.249//social_api/api/Login.php', {
        email,
        password,
      });

      if (response.data && response.data.user_id) {
        setUserId(response.data.user_id); 
        localStorage.setItem('userId', response.data.user_id); 
        window.location.href = '/'; 
      } else {
        alert(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(error);
    }
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('userId'); 
    window.location.href = '/'; 
  };

  const handleSignupComplete = (newUserId, newusername) => {
    setUserId(newUserId);
    setusername(newusername);  
    console.log("signup complete")
    localStorage.setItem('userId', newUserId); 
    localStorage.setItem('username', newusername)
    window.location.href = '/profile'; 
  };

  const ProtectedRoute = ({ element }) => {
    return userId ? element : <p>Please log in to view this page.</p>;
  };

  return (
    <Router>
      <div className="App">
        {userId && (
          <nav className="nav-bar">
            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FontAwesomeIcon icon={faBars} />
              {showMenu && (
                <div className="menu-dropdown">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
            <Link to="/" className="nav-link">
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </Link>
            <Link to="/profile" className="nav-link">
              <FontAwesomeIcon icon={faUser} />
              <span>Profile</span>
            </Link>
            <Link to="/postfeed" className="nav-link">
              <FontAwesomeIcon icon={faImage} />
              <span>Posts</span>
            </Link>
            <Link to="/message" className="nav-link">
              <FontAwesomeIcon icon={faMessage} />
              <span>Messages</span>
            </Link>
            {userId && (
              <div className="nav-link">
                <Notifications userId={parseInt(userId)} />
              </div>
            )}
          </nav>
        )}

        <div className="content-wrapper">
          <header>
            <h1>ManSiv</h1>
            {!userId && (
              <div>
                <button onClick={() => window.location.href = '/login'}>Login</button>
                <button onClick={() => window.location.href = '/signup'}>Signup</button>
              </div>
            )}
          </header>

          <main>
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup onSignupComplete={handleSignupComplete} />} />
              <Route path="/uploadprofilepic" element={<ProtectedRoute element={<ProfileUpload userId={userId} />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<Profile userId={userId} />} />} />
              <Route path="/subprofile" element={<ProtectedRoute element={<Subprofile userId={userId} />} />} />
              <Route path="/" element={<ProtectedRoute element={<Home userId={userId} username={username} />} />} /> 
              <Route path="/postfeed" element={<ProtectedRoute element={<PostFeed userId={userId} username={username} />} />} /> 
              <Route path="/bio" element={<AddBio/>} /> 
              <Route path="/upload" element={<UploadPost />} />  
              <Route path="/updatename" element={<Updatename/>} /> 
              <Route path="/message" element={<Messaging userId={userId}/>} /> 
              <Route path="/messages" element={<MessageComponent />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
