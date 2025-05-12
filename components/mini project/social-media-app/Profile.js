import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const [background, setBackground] = useState();
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        console.error("User ID is not available in localStorage.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user details
        const userResponse = await axios.get(`http://192.168.221.249/social_api/api/user.php?id=${userId}`);
        setUser(userResponse.data);
        console.log(userResponse.data)
        // Fetch user's posts
        try{
        const postsResponse = await axios.get(`http://192.168.221.249/social_api/api/getuserposts.php?user_id=${userId}`);
        setPosts(postsResponse.data.posts || []); 
        }
        catch(error){
          console.log("no posts created")
        }// Assuming `posts` is returned as an array
        try{
          const follow = await axios.get(`http://192.168.221.249/social_api/api/getfollowercount.php?user_id=${userId}`)
          setFollowers(follow.data.follower_count);
          setFollowing(follow.data.following_count);
           // Assuming `follower_count` is returned as a number
        }catch(error){
          console.log("Error fetching follower count")
        }
        
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error: User not found</div>;
  }

  // Determine the profile picture path
  const profilePicPath = user.profile_pic
    ? user.profile_pic.replace(
        "C:/Users/durga/OneDrive/Desktop/Desktop/fed/React/myapp/public/",
        ""
      )
    : "default.jpg";

  return (
    <div className="profile-container">
      
  <div className='profile-card'>
    <div className='profile-header'>
      <button
        onClick={() => {
          setBackground(profilePicPath);
          navigate('/uploadprofilepic');
        }}
        style={{
          backgroundImage: `url(${profilePicPath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
        }}
      ></button>
      <div className='username'>
      <h1 style={{color:'black'}}>{user?.username || "User"}</h1>
      <div>
      {user.name ? (
        <button onClick={() => navigate('/updatename')} className='details'>
          {user.name}
        </button>
      ) : (
        <button onClick={() => navigate('/updatename')} className='details'>
          no name
        </button>
      )}
    </div>
    <div className="profile-bio">
      {user.bio ? (
        <p>
          <strong>
            <button onClick={() => navigate('/bio')} className='details'>
              {user.bio}
            </button>
          </strong>
        </p>
      ) : (
        <button onClick={() => navigate('/bio')} className='details'>
          No bio available
        </button>
      )}
    </div>
      </div>
    </div>
    <div className="count">
      <p>followers: {followers}</p>
      <p>following: {following}</p>
    </div>


  </div><br/>
      <button onClick={() => (navigate("/upload"))} className="upload-post">
        
        Upload Post
      </button><br/><br/>
      <div className="post"><b>posts</b></div><br/>
      <div className="profile-posts">
        
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <p>post{post.content}</p>
              
              {post.image && (
                <img
                className="post-image"
                  src={post.image.replace(
                    "C:/Users/durga/OneDrive/Desktop/Desktop/fed/React/myapp/public/",
                    ""
                  )}
                  alt="Post"
                  
                />
              )}
              <div className="post-meta">
                <span>
                  Posted on {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No posts yet. Create one!</p>
        )}
      </div>

      
    </div>
  );
};

export default Profile;
