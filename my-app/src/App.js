import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faImage, faMessage, faBars } from '@fortawesome/free-solid-svg-icons';
import "./App.css";
import MessageComponent from './Components/MessageComponent';
import Notifications from './Components/Notifications';
import PostFeed from './Components/PostFeed';
import Profile from './Components/Profile';
import Updatename from './Components/Updatename';
import Subprofile from './Components/Subprofile';
import Messaging from './Components/Messaging';
import UploadPost from './Components/UploadPost';
import { API } from './Components/config';

import Login from './Components/Authentication/Login';
import Signup from './Components/Authentication/Signup';
import Home from './Components/Authentication/Home';
import Addbio from './Components/Authentication/Addbio';
import ProfileUpload from './Components/Authentication/ProfileUpload';

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
    console.log(email,password)
    try {
      const response = await axios.post(`${API}Loginuser.php`, {
        email,
        password,
      });
      console.log(response)
      console.log(response.status)
      console.log(response.data.message)
      if (response.status==200 && response.data.user_id) {
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
              <Route path="/bio" element={<Addbio/>} /> 
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
