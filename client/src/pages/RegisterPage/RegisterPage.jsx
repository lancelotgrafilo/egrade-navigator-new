import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import { toast } from 'react-toastify';
import eGradeLogo from '../../assets/images/eGradeLogo-nobg.png';
import pageDivider from '../../assets/images/bottomwave.svg';
import eyeIcon from '../../assets/icons/eyeIcon.png'; // Add an eye icon for visibility toggle
import eyeSlashIcon from '../../assets/icons/eyeSlashIcon.png'; // Add an eye-slash icon for hiding password
import useEmailConfirmReg from '../../utils/hooks/usePostEmailConfirmReg';

import styleRegister from './registerPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [data, setData] = useState({
    last_name: "",
    first_name: "",
    middle_initial: "",
    schoolID: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleClickOnDisabledField = (e) => {
    if (e.target.disabled) {
      toast.error("Please enter the correct code first!");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Custom email validation
    if (!validateEmail(data.email)) {
      toast.error("Invalid email format");
      return;
    }
  
    // Define the schema for validation
    const schema = Joi.object({
      last_name: Joi.string().required().label("Last Name"),
      first_name: Joi.string().required().label("First Name"),
      middle_initial: Joi.string().required().label("Middle Initial"),
      schoolID: Joi.string().required().label("School ID"),
      email: Joi.string().email({ tlds: { allow: false } }).required().label("Email Address"), // Updated line
      password: passwordComplexity().required().label("Password"),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().label("Confirm Password")
        .messages({ 'any.only': 'Passwords do not match' })
    });
  
    const { error: validationError } = schema.validate(data, { abortEarly: false });
  
    if (validationError) {
      const errorMessages = validationError.details.map(detail => detail.message).join(', ');
      toast.error(`Validation Error: ${errorMessages}`);
      return;
    }
  
    try {
      setSubmitLoading(true);
      await delay(500);
      const response = await axios.post("/api/confirm-register", {
        last_name: data.last_name,
        first_name: data.first_name,
        middle_initial: data.middle_initial,
        schoolID: data.schoolID,
        email: data.email,
        password: data.password
      });
  
      if (response.status === 201) {
        toast.success("Successful Registration");
        navigate("/login");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message || "Invalid input. Please check your data.");
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setSubmitLoading(false); // Ensure loading state is reset
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

  return (
    <div className={styleRegister.loginPageContainer}>
      <header className={styleRegister.header}>
        <nav className={styleRegister.navBar}>
          <img src={eGradeLogo} alt="eGrade Navigator" className={styleRegister.navLogo} />
          <ul className={styleRegister.navUl}>
            <li className={styleRegister.navLi}>
              <Link to="/" className={styleRegister.navButton}>Home</Link>
            </li>
            <li className={styleRegister.navLi}>
              <Link to="/#About" className={styleRegister.navButton}>About</Link>
            </li>
            <li>
              <Link to="/login" className={styleRegister.login}>Login</Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className={styleRegister.homeSection} id='Home'>
        <div className={styleRegister.homeContainer}>
          <h1 className={styleRegister.homeH1}>
            Welcome, <br/>
            <span className={styleRegister.spanH1}>
              Start <span className={styleRegister.successSpan}>Navigating</span><br/> Your Journey <br/> with us!
            </span>
          </h1>
          <div className={styleRegister.loginContainer}>
            <form onSubmit={handleSubmit}>
              <h1>Register</h1>
              <div className={styleRegister.sendContainer}>
                <div className={styleRegister.inputBox}>
                  <input 
                    type="email" 
                    id='email' 
                    name='email'
                    value={data.email || dataEmail.email} 
                    onChange={(e) => {
                      handleChange(e);
                      handleChangeEmail(e);
                    }}
                    placeholder=' ' 
                    required 
                    className={styleRegister.userPass}/> 
                  <label htmlFor="email" className={styleRegister.inputLabelUser}>Email Address:</label>
                </div>
                <button 
                  type="button" 
                  className={styleRegister.sendCode}
                  onClick={handleSendCode}
                  disabled={isCooldownActive || isLoading}
                >
                  {isLoading ? (
                    <div className={styleRegister.loader}></div> 
                  ) : isCooldownActive ? (
                    `${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, "0")}` 
                  ) : (
                    "Send Code"
                  )}
                </button>
              </div>
              
              <div className={styleRegister.inputBox}>
                <input 
                  id="confirmCode"
                  name="confirmCode"
                  type='number' 
                  className={styleRegister.userInput}
                  value={enteredCode}
                  onChange={handleChangeCode}
                  placeholder=' ' 
                  required
                />
                <label htmlFor="confirmCode" className={styleRegister.inputLabelUser}>Please Enter Code: 
                  {isCodeValid === true && <p className={styleRegister.success} style={{ color: 'green'}}>Code is correct</p>}
                  {isCodeValid === false && <p className={styleRegister.error} style={{ color: 'red' }}>Code is incorrect</p>}
                </label>
              </div>
              <div className={styleRegister.inputBox}>
                <input 
                  type="text" 
                  id='last_name' 
                  name='last_name' 
                  value={data.last_name}
                  onChange={handleChange}
                  placeholder=' ' 
                  required 
                  onClick={handleClickOnDisabledField}
                  className={styleRegister.userInput}/> 
                <label htmlFor="last_name" className={styleRegister.inputLabelUser}>Last Name:</label>
              </div>
              <div className={styleRegister.inputBox}>
                <input 
                  type="text" 
                  id='first_name' 
                  name='first_name' 
                  value={data.first_name}
                  onChange={handleChange}
                  placeholder=' ' 
                  required 
                  onClick={handleClickOnDisabledField}
                  className={styleRegister.userPass}/> 
                <label htmlFor="first_name" className={styleRegister.inputLabelUser}>First Name:</label>
              </div>
              <div className={styleRegister.inputBox}>
                <input 
                  type="text" 
                  id='middle_initial' 
                  name='middle_initial'
                  value={data.middle_initial}
                  onChange={handleChange}
                  placeholder=' ' 
                  required 
                  onClick={handleClickOnDisabledField}
                  className={styleRegister.userPass}/> 
                <label htmlFor="middle_initial" className={styleRegister.inputLabelUser}>Middle Initial:</label>
              </div>
              <div className={styleRegister.inputBox}>
                <input 
                  type="text" 
                  id='schoolID' 
                  name='schoolID' 
                  value={data.schoolID}
                  onChange={handleChange}
                  placeholder=' ' 
                  required 
                  onClick={handleClickOnDisabledField}
                  className={styleRegister.userInput}/> 
                <label htmlFor="schoolID" className={styleRegister.inputLabelUser}>School ID:</label>
              </div>
              <div className={styleRegister.inputBox}>
                <input 
                  type={passwordVisible ? "text" : "password"}
                  id='password' 
                  name='password' 
                  value={data.password}
                  onChange={handleChange}
                  placeholder=' ' 
                  required 
                  onClick={handleClickOnDisabledField}
                  className={styleRegister.userPass} 
                /> 
                <img 
                  className={styleRegister.eyeIcon}
                  src={passwordVisible ? eyeSlashIcon : eyeIcon} 
                  alt="" 
                  onClick={togglePasswordVisibility}
                />
                <label htmlFor="password" className={styleRegister.inputLabelUser}>Password:</label>
              </div>
              <div className={styleRegister.inputBox}>
                <input 
                  type={passwordVisible ? "text" : "password"} 
                  id='confirmPassword' 
                  name='confirmPassword' 
                  value={data.confirmPassword}
                  onChange={handleChange}
                  placeholder=' ' 
                  required 
                  onClick={handleClickOnDisabledField}
                  className={styleRegister.userPass}/> 
                <img 
                  className={styleRegister.eyeIcon}
                  src={passwordVisible ? eyeSlashIcon : eyeIcon} 
                  alt="" 
                  onClick={togglePasswordVisibility}
                />
                <label htmlFor="confirmPassword" className={styleRegister.inputLabelUser}>Confirm Password:</label>
              </div>
              <div className={styleRegister.rememberForgot}>
                <label>
                  <input type="checkbox" required /> 
                  I agree to the 
                    <Link to='' className={styleRegister.termsConditions}>Terms and Conditions</Link>
                  and have read the 
                    <Link className={styleRegister.termsConditions}>Privacy Policy</Link>.
                </label>
              </div>    
              <button 
                type='submit'
                className={styleRegister.registerButton}
                disabled={!isCodeValid || submitLoading}
              >
                {submitLoading ? (
                  <div className={styleRegister.loader}></div> 
                ) : (
                  "Register"
                )}
              </button>

              <div className={styleRegister.register}>
                <p>Already have an account? Login 
                  <Link to='/login' className={styleRegister.registerBtn}> Here</Link> 
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className={styleRegister.pageDivider}>
          <img src={pageDivider} alt="wave" />
        </div>
      </section>
    </div>
  );
}
