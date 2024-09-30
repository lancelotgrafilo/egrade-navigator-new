import React from 'react';
import styleEmailCode from './emailCodeVerification.module.css';
import emailIcon from '../../assets/icons/envelope-solid-24-black.png';

export function EmailCodeVerification({ onSubmit }) {
  return (
    <div className={styleEmailCode.loginContainer}>
      <form onSubmit={onSubmit}>
        <h1>Code Verification</h1>
        <div className={styleEmailCode.inputBox}>
          <input type="number" id='emailCodeVerification' name='emailCodeVerification' placeholder=' ' required className={styleEmailCode.userInput}/> 
          <img src={emailIcon} alt="Email Icon"/>
          <label htmlFor="emailCodeVerification" className={styleEmailCode.inputLabelUser}>Enter Code:</label>
        </div>
        <button type="submit" className={styleEmailCode.loginButton}>Verify</button>
      </form>
    </div>
  );
}
