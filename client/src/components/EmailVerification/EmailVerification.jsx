import React from 'react';
import styleEmailVerification from './forgotPasswordEmailVerification.module.css';
import emailIcon from '../../assets/icons/envelope-solid-24-black.png';

export function EmailVerification({ onSubmit }) {
  return (
    <div className={styleEmailVerification.loginContainer}>
      <form onSubmit={onSubmit}>
        <h1>Email Verification</h1>
        <div className={styleEmailVerification.inputBox}>
          <input type="email" id='emailVerification' name='emailVerification' placeholder=' ' required className={styleEmailVerification.userInput} /> 
          <img src={emailIcon} alt="Email Icon"/>
          <label htmlFor="emailVerification" className={styleEmailVerification.inputLabelUser}>Email Address:</label>
        </div>
        <button type="submit" className={styleEmailVerification.loginButton}>Verify</button>
      </form>
    </div>
  );
}
