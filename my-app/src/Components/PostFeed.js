import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './PostFeed.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart, faCommentDots,faUserPlus,faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { API } from "./config";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [userFollows, setUserFollows] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFollowers, setTotalFollowers] = useState({});
  const navigate = useNavigate();
  const user = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const [commentb, setcommentb] = useState({});
  const [comment, setcomment] = useState("");
  const [postcomments, setpostcomments] = useState({});

  const islike = async (likedid) => {
    try {
      const response = await axios.get(
        `${API}islike.php?user_id=${user}&post_id=${likedid}`
      );
      //console.log(response)
      return response.data.status;
    } catch (error) {
      console.error("Error liking post:", error.message);
      return "error";
    }
  };

  const updatecomment = async (id) => {
    try {
      const data1 = {
        post_id: id,
        user_id: user,
        comment: comment,
      };
      
      const response = await axios.post(
        `${API}comment.php`,
        data1,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("update comment",response.data)
      
      if (response.status === 200) {
        setpostcomments((prev) => ({
          ...prev,
          [id]: [...(prev[id] || []), { comment }],
        }));
        setcomment(""); // Clear input
        setcommentb((prev) => ({ ...prev, [id]: false })); // Hide input field
        console.log(postcomments)
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };
  
  const getcomment = async (id) => {
    try {
      const response = await axios.get(
        `${API}getcomment.php?post_id=${id}`
      );
      //console.log(response.data)
      if (response.data.status) {
        setpostcomments((prev) => ({
          ...prev,
          [id]: response.data.comments.map((c) => ({ comment: c.comment,name: c.username })),
        }));
      }
      console.log("get comment",response.data)
      
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  
  
  
  

  const isfollow = async (userid, followerid) => {
    try {
      const response = await axios.get(
        `${API}isfollow.php?user_id=${userid}&follower_id=${followerid}`
      );
      return response.data.status;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return "error";
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}post.php`);
      setPosts(response.data);
      response.data.forEach(async (post) => {
        
        await getcomment(post.id);
        console.log("post comment from fetch posts",postcomments);
      });
      
      const initialLikes = {}; 
      const initialFollows = {};
      const initialFollowers = {};

      const likePromises = response.data.map(async (post) => {
        const likeStatus = await islike(post.id);

        initialLikes[post.id] = likeStatus;
      });

      const followPromises = response.data.map(async (post) => {
        const followStatus = await isfollow(post.user_id, user);
        initialFollows[post.user_id] = followStatus;
      });

      await Promise.all([...likePromises, ...followPromises]);

      setUserLikes(initialLikes);
      setUserFollows(initialFollows);
      setTotalFollowers(initialFollowers);

      const followerPromises = response.data.map(async (post) => {
        const followerResponse = await axios.get(
          `${API}getfollowercount.php?user_id=${post.user_id}`
        );
        return {
          user_id: post.user_id,
          follower_count: followerResponse.data.follower_count || 0,
        };
      });

      const followerData = await Promise.all(followerPromises);

      const updatedFollowers = { ...totalFollowers };
      followerData.forEach(({ user_id, follower_count }) => {
        updatedFollowers[user_id] = follower_count;
      });

      setTotalFollowers(updatedFollowers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
  }, []);

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

        if (followerResponse.data && followerResponse.data.follower_count) {
          setTotalFollowers((prevFollowers) => ({
            ...prevFollowers,
            [authorId]: followerResponse.data.follower_count,
          }));
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }
  
  return (
    <div className="post-feed">
      
      {posts.map((post) => (
        <div className="post-header"
          key={post.id}
           >
          <h3 className="author-name">{post.username}</h3>
         
          {post.user_id !== Number(user) && (
         
            <button
                style={userFollows[post.user_id] ?{background:"blue"}:{background:"red"}}
                className={`follow-button ${userFollows[post.user_id] ? 'following' : ''}`}
                onClick={() => toggleFollow(post.user_id)}
              >
                {userFollows[post.user_id] ? <FontAwesomeIcon icon={faUserPlus} /> : <FontAwesomeIcon icon={faUserMinus} />}
              </button>
          )}
          
          <div className="post-actions">
            <button
              className={`like-button ${userLikes[post.id] ? 'liked' : ''}`}
              onClick={() => toggleLike(post.id)}
            >
              <FontAwesomeIcon icon={userLikes[post.id] ? solidHeart : regularHeart} style={{ color: userLikes[post.id] ? 'red' : 'gray' }} /> 
              ({post.total_likes})
           </button>
            <button
              className={`comment-toggle-button ${commentb[post.id] ? 'active' : ''}`}
              onClick={() => {
                setcommentb((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                if (!commentb[post.id]) {
                  getcomment(post.id);
                }
              }}
            >
              <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: "5px" }} />
    
            </button>
          </div>
          <div className="post-content">
            <p className="post-text">{post.content}</p>
            {post.image && (
              <img
                src={post.image.replace(
                  "C:/Users/hp/OneDrive/Desktop/Desktop/ManSiv/my-app/public/",
                  ""
                )}
                alt="Post"
                onError={(e) => (e.target.src = "http://192.168.221.249:3000/default.jpg")}
                className="post-image"
              />
            )}
          </div>
          <div className="follower-count">
            Followers: {totalFollowers[post.user_id] || 0}
          </div>
          {commentb[post.id] && (
            <div className="comment-section">
              <div className="comment-input-container">
                <input
                  type="text"
                  className="comment-input"
                  value={comment}
                  onChange={(e) => setcomment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button
                  className="comment-submit-button"
                  onClick={() => {
                    updatecomment(post.id);
                  }}
                >
                  Submit
                </button>
              </div>
              <div className="comment-list">
                {(postcomments[post.id] || []).map((c, index) => (
                  <div key={index} className="comment-item">
                    <span className="comment-username">{c.name}</span>
                    <span className="comment-text">{c.comment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
