import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eGradeLogo from '../../assets/images/eGradeLogo-nobg.png';
import styleForgotPassword from './forgotPassPage.module.css';
import pageDivider from '../../assets/images/bottomwave.svg';
import useEmailConfirmReg from '../../utils/hooks/usePostEmailConfirmReg';
import { toast } from 'react-toastify';
import eyeIcon from '../../assets/icons/eyeIcon.png'; // Add an eye icon for visibility toggle
import eyeSlashIcon from '../../assets/icons/eyeSlashIcon.png'; // Add an eye-slash icon for hiding password
import useChangePassword from '../../utils/hooks/changePasswordHooks/useChangePassword';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Password validation regex: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  const handleClickOnDisabledField = (e) => {
    if (e.target.disabled) {
      toast.error("Please enter the correct code first!");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validatePassword = (password) => {
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
    } else {
      setPasswordError('');
    }
  };

  const {
    dataEmail,
    handleChangeEmail,
    handleSubmitEmail,
    enteredCode,
    handleChangeCode,
    isCodeValid,
    resetCode,
    isCooldownActive,
    cooldownTime,
    isLoading,
  } = useEmailConfirmReg();

  const handleSendCode = () => {
    handleSubmitEmail({ preventDefault: () => {} });
  };

  const { data, handleChange, handleSubmit, isPasswordLoading } = useChangePassword();

  const handlePasswordChange = (e) => {
    handleChange(e);
    validatePassword(e.target.value);
  };

  return (
    <div className={styleForgotPassword.loginPageContainer}>
      <header className={styleForgotPassword.header}>
        <nav className={styleForgotPassword.navBar}>
          <img src={eGradeLogo} alt="eGrade Navigator" className={styleForgotPassword.navLogo} />
          <ul className={styleForgotPassword.navUl}>
            <li className={styleForgotPassword.navLi}>
              <Link to="/" className={styleForgotPassword.navButton}>Home</Link>
            </li>
            <li className={styleForgotPassword.navLi}>
              <Link to="/#About" className={styleForgotPassword.navButton}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className={styleForgotPassword.homeSection} id="Home">
        <div className={styleForgotPassword.homeContainer}>
          <div className={styleForgotPassword.loginContainer}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
              <div className={styleForgotPassword.sendContainer}>
                <div className={styleForgotPassword.inputBox}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={dataEmail.email || data.email}
                    onChange={(e) => {
                      handleChangeEmail(e);
                      handleChange(e);
                    }}
                    placeholder=" "
                    required
                    className={styleForgotPassword.userInput}
                  />
                  <label htmlFor="email" className={styleForgotPassword.inputLabelUser}>Email Address:</label>
                </div>
                <button
                  type="button"
                  className={styleForgotPassword.sendCode}
                  onClick={handleSendCode}
                  disabled={isCooldownActive || isLoading}
                >
                  {isLoading ? (
                    <div className={styleForgotPassword.loader}></div>
                  ) : isCooldownActive ? (
                    `${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, "0")}`
                  ) : (
                    "Send Code"
                  )}
                </button>
              </div>

              <div className={styleForgotPassword.inputBox}>
                <input 
                  id="confirmCode"
                  name="confirmCode"
                  type='number' 
                  className={styleForgotPassword.userInput}
                  value={enteredCode}
                  onChange={handleChangeCode}
                  placeholder=' ' 
                  required
                />
                
                <label htmlFor="confirmCode" className={styleForgotPassword.inputLabelUser} id={styleForgotPassword.labelConfirmCode}>Please Enter Code: 
                  {isCodeValid === true && <p className={styleForgotPassword.success} style={{ color: 'green'}}>Code is correct</p>}
                  {isCodeValid === false && <p className={styleForgotPassword.error} style={{ color: 'red' }}>Code is incorrect</p>}
                </label>
              </div>

              <div className={styleForgotPassword.inputBox}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={data.password}
                  onChange={handlePasswordChange}
                  placeholder=" "
                  required
                  onClick={handleClickOnDisabledField}
                  className={styleForgotPassword.userPass}
                />
                <img
                  className={styleForgotPassword.eyeIcon}
                  src={passwordVisible ? eyeSlashIcon : eyeIcon}
                  alt=""
                  onClick={togglePasswordVisibility}
                />
                <label htmlFor="password" className={styleForgotPassword.inputLabelPass}>Password:</label>
                {passwordError && <p className={styleForgotPassword.error} style={{ color: 'red' }}>{passwordError}</p>}
              </div>

              <div className={styleForgotPassword.inputBox}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  onClick={handleClickOnDisabledField}
                  className={styleForgotPassword.userPass}
                />
                <img
                  className={styleForgotPassword.eyeIcon}
                  src={passwordVisible ? eyeSlashIcon : eyeIcon}
                  alt=""
                  onClick={togglePasswordVisibility}
                />
                <label htmlFor="confirmPassword" className={styleForgotPassword.inputLabelPass}>Confirm Password:</label>
              </div>

              <div className={styleForgotPassword.btnRow}>
                <button type="button" className={styleForgotPassword.cancelBtn} onClick={() => navigate('/login')} >Close</button>
                <button
                  type="submit"
                  className={styleForgotPassword.saveBtn}
                  disabled={!isCodeValid || isPasswordLoading || passwordError}
                >
                  {isPasswordLoading ? (
                    <div className={styleForgotPassword.loader}></div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className={styleForgotPassword.pageDivider}>
          <img src={pageDivider} alt="wave" />
        </div>
      </section>
    </div>
  );
}
