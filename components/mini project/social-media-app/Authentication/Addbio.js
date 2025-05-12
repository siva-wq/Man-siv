import React, { useState } from "react";
import axios from 'axios'; 

function AddBio() {
  const [bio, setBio] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if userId is null
    if (!userId) {
      setResponseMessage("User ID is missing.");
      return;
    }

    const requestData = {
      user_id: userId,
      bio: bio,
    };

    try {
      // Send the POST request
      const response = await axios.post('http://192.168.221.249//social_api/api/add_bio.php', requestData);
      console.log("Response:", response.data);

      // Set the response message based on the server response
      setResponseMessage(response.data.message || "Bio added successfully!");
      window.location.href="/profile";

    } catch (error) {
      // Handle error and display the message
      console.error('Error:', error.response ? error.response.data : error.message);
      setResponseMessage("Error adding bio. Please try again.");
    }
  };

  return (
    <div>
      <h2>Add Bio</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Bio:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Bio</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}

      <button onClick={()=>(window.location.href="/profile")}>Profile</button>
    </div>
  );
}

export default AddBio;
