import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styleNewPassword from './createNewPassword.module.css';
import lockIcon from '../../assets/icons/lock-alt-solid-24.png';

export function CreateNewPassword({ onSubmit }) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform the password creation logic here
    // Once done, set the notification and navigate to the login page
    setNotification('Password successfully changed!');
    setTimeout(() => {
      navigate('/login');
    }, 2000); // Redirect to login after 2 seconds
  };

  return (
    <div className={styleNewPassword.loginContainer}>
      <form onSubmit={handleSubmit}>
        <h1>Create New Password</h1>
        {notification && <div className={styleNewPassword.notification}>{notification}</div>}
        <div className={styleNewPassword.inputBox}>
          <input type="password" id='password' name='password' placeholder=' ' required className={styleNewPassword.userInput}/> 
          <img src={lockIcon} alt="Lock Icon"/>
          <label htmlFor="password" className={styleNewPassword.inputLabelUser}>Password:</label>
        </div>
        <div className={styleNewPassword.inputBox}>
          <input type="password" id='confirmPassword' name='confirmPassword' placeholder=' ' required className={styleNewPassword.userPass}/> 
          <img src={lockIcon} alt="Lock Icon"/>
          <label htmlFor="confirmPassword" className={styleNewPassword.inputLabelPass}>Confirm Password:</label>
        </div>
        <button type="submit" className={styleNewPassword.loginButton}>Create</button>
      </form>
    </div>
  );
}
