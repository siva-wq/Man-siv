import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import { API } from "../config";
const Home = () => {
  const navigate = useNavigate();
  const [sfollowers, setsfollowers] = useState([]); // State to hold suggested followers
  const user = localStorage.getItem("userId");
  const [totalFollowers, setTotalFollowers] = useState({});
  const [userFollows, setUserFollows] = useState({});
  const [following, setFollowing] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const uname=localStorage.getItem("username");
  const profile=async(id)=>{
    
      try {
        // Fetch user details
        const userResponse = await axios.get(`${API}user.php?id=${id}`);
        
        
        // Fetch user's posts
         
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } 
    
  }
  const updateUserOnlineStatus = async () => {
    try {
      await axios.post('${API}update_status.php', {
        user_id: user,
        status: 'online'
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  useEffect(()=>{
    updateUserOnlineStatus()
  },[])
  const toggleFollow = async (authorId) => {
    const isFollowing = userFollows[authorId];
    try {
      const data = {
        user_id: authorId,
        follower_id: user,
        follow: !isFollowing,
      };

      const response = await axios.post(`${API}follow.php`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setUserFollows((prevFollows) => ({
          ...prevFollows,
          [authorId]: !isFollowing,
        }));

        const followerResponse = await axios.get(
          `${API}getfollowercount.php?user_id=${authorId}`
        );
        const data1={
          user_id:authorId,
          message:`${uname} follows you`
        }
        const not=await axios.post(`${API}notifications.php`,data1);
        
          setTotalFollowers((prevFollowers) => ({
            ...prevFollowers,
            [authorId]: followerResponse.data.follower_count,
          }));
        //console.log(totalFollowers)
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const isFollow = async (userid, followerid) => {
    try {
      const response = await axios.get(
        `${API}isfollow.php?user_id=${userid}&follower_id=${followerid}`
      );
      return response.data.status || false;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  };

  const fetchSuggestedFollowers = async () => {
    try {
      const userResponse = await axios.get(`${API}getusers.php`);
      const data = userResponse.data.map((follower) => ({
        ...follower,
        profile_pic: follower.profile_pic
          ? follower.profile_pic.replace(
              "C:/Users/hp/OneDrive/Desktop/Desktop/ManSiv/my-app/public/",
              ""
            )
          : "default.jpg", // Use placeholder for missing profile_pic
      }));

      const initialFollows = {};
      const initialFollowers = {};
      const totalFollowing = {};

      const promises = data.map(async (follower) => {
        const followStatus = await isFollow(follower.id, user);
        initialFollows[follower.id] = followStatus;

        const followerResponse = await axios.get(
          `${API}getfollowercount.php?user_id=${follower.id}`
        );
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
    fetchSuggestedFollowers();
  }, []);

  return (
    <div style={{ padding: "20px" }} >
      
    
      <ul className="suggestions-container">
  {sfollowers.map((follower) =>
    follower.id !== user ? (
      <li key={follower.id} className="user-card">
          <button
        onClick={() => {
          
          localStorage.setItem("subprofile",follower.id)
          navigate("/Subprofile")
        }}
        style={{
          backgroundImage: `url(${follower.profile_pic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "200px",
          height: "200px",
          border: "3px solid #4f46e5",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
        }}
        
      ></button>
        <div className="user-info">
          <h4 className="username">{follower.username || "Anonymous"}</h4>
          <p className="bio">{follower.bio || "No bio available"}</p>
          <p><strong>Name:</strong> {follower.name || "N/A"}</p>
          <div className="stats">
            <span>Followers: {totalFollowers[follower.id] || 0}</span>
            <span>Following: {following[follower.id] || 0}</span>
          </div>
          <button
            className={`follow-btn ${userFollows[follower.id] ? "following" : ""}`}
            onClick={() => toggleFollow(follower.id)}
          >
            {userFollows[follower.id] ? "Unfollow" : "Follow"}
          </button>
        </div>
      </li>
    ) : null
  )}
</ul>
    </div>
  );
};

export default Home;
