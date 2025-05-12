import React, { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.post('http://192.168.221.249/social_api/api/UploadProfilePic.php', formData, {
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
    <div className='upload-container'>
      <h2>Upload Your Profile Picture</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}
      <button onClick={()=>(window.location.href = "/profile")}>profile</button>
      <button onClick={()=>window.location.href = "/"}>home</button>
    </div>
  );
};

export default ProfileUpload;
