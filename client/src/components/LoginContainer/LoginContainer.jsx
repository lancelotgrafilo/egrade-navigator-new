import React from "react";
import styleLogin from './loginContainer.module.css'
import eGradeLogo from '../../assets/images/eGradeLogo-nobg.png'
import { Outlet, Link } from 'react-router-dom'
import userIcon from '../../assets/icons/user-solid-24.png'
import lockIcon from '../../assets/icons/lock-alt-solid-24.png'

function LoginContainer({onSubmit}){
  return (
    <div className={styleLogin.loginContainer}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
            }}>
              <div className={styleLogin.gradeLogo}>
                <img src={eGradeLogo} alt="eGrade Navigator" className={styleLogin.formLogo} />
              </div>
              
              <h1>Login</h1>
                  
              <div className={styleLogin.inputBox}>
                
                <input type="text" id='username' name='username' placeholder=' ' required className={styleLogin.userInput}/> <img src={userIcon} alt="" />
                <label htmlFor="username" className={styleLogin.inputLabelUser}>Username:</label>
              </div>
              <div className={styleLogin.inputBox}>
                
                <input type="password" id='password' name='password' placeholder=' '  required className={styleLogin.userPass}/> <img src={lockIcon} alt="" />
                <label htmlFor="password" className={styleLogin.inputLabelPass}>Password:</label>
              </div>

              <div className={styleLogin.rememberForgot}>
                <label><input type="checkbox" /> Remember me</label>
                <Link to='/forgotPassword' className={styleLogin.forgotPass}>Forgot password?</Link>
              </div>

              <button className={styleLogin.loginButton}>Login</button>

              <div className={styleLogin.register}> 
                <p>Don&apos;t have an account?  
                  <Link to='/register' className={styleLogin.registerBtn}> Register</Link> 
                </p>
              </div>
              <Outlet/>
            </form>
          </div>
  )
}

export default LoginContainer;