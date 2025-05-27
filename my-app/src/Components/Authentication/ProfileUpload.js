import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../config';
const ProfileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Retrieve user ID from localStorage
  const userId = localStorage.getItem('userId');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file!');
      return;
    }

    if (!userId) {
      alert('User ID not found in localStorage.');
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', selectedFile);
    formData.append('user_id', userId);

    try {
      const response = await axios.post(`${API}UploadProfilePic.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(1)
      setUploadStatus(response.data.message);
      console.log(uploadStatus)
      window.location.href="/profile"
    } catch (error) {
      setUploadStatus('Error uploading the profile picture.');
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div style={{color:"white"}}>
      <h2 style={{color:'white'}}>Upload Your Profile Picture</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}
      
    </div>
  );
};

export default ProfileUpload;
