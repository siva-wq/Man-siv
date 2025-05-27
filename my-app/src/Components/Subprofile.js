import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart, faCommentDots, faUserPlus, faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { API } from './config';

const Subprofile = () => {
  const [userLikes, setUserLikes] = useState({});
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [userFollows, setUserFollows] = useState({});
  const [totalFollowers, setTotalFollowers] = useState({});
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  const userId = localStorage.getItem('subprofile');
  const fid = localStorage.getItem('userId');
  const uname = localStorage.getItem("username");
  const toggleLike = async (postId) => {
    const hasLiked = userLikes[postId];
    try {
      const data = {
        post_id: postId,
        user_id: user,
        like: !hasLiked,
      };

      const response = await axios.post(`${API}like.php`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setUserLikes((prevLikes) => ({
          ...prevLikes,
          [postId]: !hasLiked,
        }));

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, total_likes: response.data.total_likes }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  const toggleFollow = async () => {
    const currentUser = localStorage.getItem("userId");
    const subprofileId = localStorage.getItem("subprofile");

    const data = {
      user_id: subprofileId,
      follower_id: currentUser,
      follow: !isFollowing,
    };

    try {
      const response = await axios.post(`${API}follow.php`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
    }
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      const currentUser = localStorage.getItem("userId");
      const subprofileId = localStorage.getItem("subprofile");

      const followStatus = await isFollow(subprofileId, currentUser);
      setIsFollowing(followStatus);
    };

    checkFollowStatus();
  }, []);
  const isFollow = async (userId, followerId) => {
    try {
      const response = await axios.get(
        `${API}isfollow.php?user_id=${userId}&follower_id=${followerId}`
      );
      return response.data.status || false;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  };

  const total_likes = async (id) => {
    const hasLiked = userLikes[id];
    try {
      const data = {
        post_id: id,
        user_id: userId,
        like: hasLiked,
      };

      const response = await axios.post(`${API}like.php`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setUserLikes((prevLikes) => ({
          ...prevLikes,
          [id]: !hasLiked,
        }));

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === id
              ? { ...post, total_likes: response.data.total_likes }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        console.error("User ID is not available in localStorage.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get(`${API}user.php?id=${userId}`);
        setUser(userResponse.data);

        // Fetch posts
        try {
          const postsResponse = await axios.get(`${API}getuserposts.php?user_id=${userId}`);
          setPosts(postsResponse.data.posts || []);
        } catch {
          console.log("No posts created");
        }

        // Fetch follow info
        try {
          const followResponse = await axios.get(`${API}getfollowercount.php?user_id=${userId}`);
          setFollowers(followResponse.data.follower_count);
          setFollowing(followResponse.data.following_count);
        } catch {
          console.log("Error fetching follower count");
        }

        // Fetch follow state
        try {
          const followState = await axios.get(
            `${API}isfollowing.php?user_id=${userId}&follower_id=${fid}`
          );
          setUserFollows(prev => ({ ...prev, [userId]: followState.data.isFollowing }));
        } catch {
          console.log("Error fetching follow state");
        }

        // Fetch updated total followers
        const followerCount = await axios.get(
          `${API}getfollowercount.php?user_id=${userId}`
        );
        setTotalFollowers(prev => ({
          ...prev,
          [userId]: followerCount.data.follower_count
        }));

      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, fid, toggleFollow]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error: User not found</div>;

  const profilePicPath = user.profile_pic
    ? user.profile_pic.replace("C:/Users/hp/OneDrive/Desktop/Desktop/ManSiv/my-app/public/", "")
    : "default.jpg";

  return (
    <div className="profile-container">
      <div className='profile-card'>
        <div className='profile-header'>
          <button
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
            <h1 style={{ color: 'black' }}>{user?.username || "Anonymous"}</h1>

            <div>
              <button onClick={() => navigate('/updatename')} className='details'>
                {user.name || "no name"}
              </button>
            </div>

            <div className="profile-bio">
              <button onClick={() => navigate('/bio')} className='details'>
                {user.bio || "No bio available"}
              </button>
            </div>
          </div>
        </div>

        <div className="count">
          <p>followers: {totalFollowers[userId] || 0}</p>
          <p>following: {following}</p>
        </div>

        {userId !== fid && (
          <button
            onClick={toggleFollow}
            className={`follow-btn ${isFollowing ? "following" : ""}`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>

        )}
      </div><br />



      {userId == fid && (
        <button onClick={() => (navigate("/upload"))} className="upload-post">
          Upload Post
        </button>
      )
      }
      <br /><br />

      <div className="post"><b>posts</b></div><br />

      <div className="profile-posts">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <p>{post.content}</p>
              {post.image && (
                <img
                  src={post.image.replace("C:/Users/hp/OneDrive/Desktop/Desktop/ManSiv/my-app/public/", "")}
                  alt="Post"
                  className="post-image"
                />
              )}
              <p className="post-meta">
                <span>Posted on {new Date(post.created_at).toLocaleDateString()}</span>
              </p>

              <FontAwesomeIcon icon={solidHeart} style={{ color: "red" }} />
              ({post.total_likes})




            </div>
          ))
        ) : (
          <p>

            {userId == fid ? "No posts.Create One" : "No posts"}

          </p>
        )}
      </div>
    </div>
  );
};

export default Subprofile;
