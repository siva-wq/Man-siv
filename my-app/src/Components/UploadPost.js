import React, { useState } from "react";
import { API } from "./config";
const UploadPost = () => {
 
  const [description, setDescription] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const userId = localStorage.getItem("userId");
  const handleFileChange = (e) => {
    console.log(e.target.files[0])
    setPostFile(e.target.files[0]); // Capture the uploaded file
    
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !description || !postFile) {
      setResponseMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("description", description);
    formData.append("post_file", postFile);
    console.log(formData);
    try {
      const response = await fetch(`${API}uploadpost.php`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponseMessage(data.message || "Post uploaded successfully!");
       // window.location.href="/profile";
      } else {
        setResponseMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setResponseMessage("Error: Unable to upload the post.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto",color: "white"}}>
      <h2 style={{color: "white"}}>Upload Post</h2>
      <form onSubmit={handleSubmit}>
        
        <div style={{ marginBottom: "10px",color: "white"}}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="4"
            style={{
              width: "100%",
              padding: "8px",
              margin: "5px 0",
              boxSizing: "border-box",
            }}
          ></textarea>
        </div>
        <div style={{ marginBottom: "10px",color: "white" }}>
          <label htmlFor="postFile">File:</label>
          <input
            type="file"
            id="postFile"
            onChange={handleFileChange}
            required
            style={{
              color:"white",
              width: "100%",
              padding: "8px",
              margin: "5px 0",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Upload Post
        </button>
      </form>
      {responseMessage && (
        <p style={{ marginTop: "20px", color: responseMessage.includes("success") ? "green" : "red" }}>
          {responseMessage}
        </p>
      )}
      
    </div>
  );
};

export default UploadPost;
