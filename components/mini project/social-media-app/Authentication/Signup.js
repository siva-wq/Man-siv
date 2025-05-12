import React, { useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import "./signup.css";
const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name,setname]=useState('');
  const { control, handleSubmit, formState: { errors } } = useForm();
  const handleSignup = async () => {
    // Create the request data object
    const requestData = {
      name,
      username,
      email,
      password
    };

    // Send the POST request with the requestData object
    axios.post('http://192.168.221.249/social_api/api/Signup.php', requestData)
      .then(response => {
        console.log("signup:\n"+response.data);
        window.location.href="/login";
      
      })
      .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
      });
  };

  return (
    <div className='signup-container'>
      <h2 className='h1-semibold'>Signup</h2>
    <div className='form-field'>
    <label className="shad-form_label">username</label>
      <input 
        className='shad'
        type="text" 
        placeholder="username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
    </div>
    <div className='form-field'>
    <label className="shad-form_label">name</label>
      <input 
        className='shad'
        type="text" 
        placeholder="name" 
        value={name} 
        onChange={(e) => setname(e.target.value)} 
      />
    </div>
    <div className='form-field'>
    <label className="shad-form_label">Email</label>
      <input 
        className='shad'
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
    </div>
    <div className='form-field'>
    <label className="shad-form_label">password</label>
      <input 
        className='shad'
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      /><br/><br/>
      <button onClick={handleSignup} className='shad-button_primary'>Signup</button>
      
    </div>
    </div>
  );
};

export default Signup;
