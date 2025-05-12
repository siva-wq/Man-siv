import React, { useState } from "react";

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
      const response = await fetch("http://192.168.221.249/social_api/api/uploadpost.php", {
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
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Upload Post</h2>
      <form onSubmit={handleSubmit}>
        
        <div style={{ marginBottom: "10px" }}>
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
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="postFile">File:</label>
          <input
            type="file"
            id="postFile"
            onChange={handleFileChange}
            required
            style={{
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
            color: "white",
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
      <button onClick={()=>(window.location.href="/profile")}>profile</button>
    </div>
  );
};

export default UploadPost;
