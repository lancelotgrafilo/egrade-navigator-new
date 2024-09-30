import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eGradeLogo from '../../assets/images/eGradeLogo-nobg.png';
import styleLoginPage from './loginPage.module.css';
import pageDivider from '../../assets/images/bottomwave.svg';
import userIcon from '../../assets/icons/user-solid-24.png';
import eyeIcon from '../../assets/icons/eyeIcon.png'; // Add an eye icon for visibility toggle
import eyeSlashIcon from '../../assets/icons/eyeSlashIcon.png'; // Add an eye-slash icon for hiding password
import useLogin from '../../utils/hooks/useLogin';
import {toast} from 'react-toastify';

export function LoginPage() {
  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false); 
  const { login, error, loading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(data, navigate);
  };

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className={styleLoginPage.loginPageContainer}>
      <header className={styleLoginPage.header}>
        <nav className={styleLoginPage.navBar}>
          <img src={eGradeLogo} alt="eGrade Navigator" className={styleLoginPage.navLogo} />
          <ul className={styleLoginPage.navUl}>
            <li className={styleLoginPage.navLi}>
              <Link to="/" className={styleLoginPage.navButton}>Home</Link>
            </li>
            <li className={styleLoginPage.navLi}>
              <Link to="/#About" className={styleLoginPage.navButton}>About</Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className={styleLoginPage.homeSection} id='Home'>
        <div className={styleLoginPage.homeContainer}>
          <h1 className={styleLoginPage.homeh1}>
            Welcome, <br /> Join us Navigate <br /> our <span className={styleLoginPage.successSpan}>Success</span>!
          </h1>

          <div className={styleLoginPage.loginContainer}>
            <form onSubmit={handleSubmit}>
              <div className={styleLoginPage.gradeLogo}>
                <img src={eGradeLogo} alt="eGrade Navigator" className={styleLoginPage.formLogo} />
              </div>

              <h1>Login</h1>

              <div className={styleLoginPage.inputBox}>
                <input
                  type="email"
                  id='email'
                  name='email'
                  value={data.email}
                  onChange={handleChange}
                  placeholder=' '
                  required
                  className={styleLoginPage.userInput}
                />
                <img src={userIcon} alt="" />
                <label htmlFor="email" className={styleLoginPage.inputLabelUser}>Email:</label>
              </div>
              <div className={styleLoginPage.inputBox}>
                <input
                  type={showPassword ? "text" : "password"} // Toggle between text and password input
                  id='password'
                  name='password'
                  value={data.password}
                  onChange={handleChange}
                  placeholder=' '
                  required
                  className={styleLoginPage.userPass}
                />
                <label htmlFor="password" className={styleLoginPage.inputLabelPass}>Password:</label>
                <button 
                  type="button" 
                  className={styleLoginPage.togglePasswordButton} 
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
                >
                  <img src={showPassword ? eyeIcon : eyeSlashIcon} alt="" />
                </button>
              </div>

              <button type="submit" className={styleLoginPage.loginButton} disabled={loading}>
                {loading ? (
                  <div className={styleLoginPage.loader}></div>
                  ) : (
                    'Login'
                  )
                }
              </button>

              <div className={styleLoginPage.rememberForgot}>
                <Link to='/forgotPassword' className={styleLoginPage.forgotPass}>Forgot password?</Link>
              </div>
              
            </form>
          </div>
        </div>

        <div className={styleLoginPage.pageDivider}>
          <img src={pageDivider} alt="wave" />
        </div>
      </section>
    </div>
  );
}
