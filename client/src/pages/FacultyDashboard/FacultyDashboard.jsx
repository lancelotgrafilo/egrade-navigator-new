import { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import styleFaculty from './facultyDashboard.module.css';
import eGradeLogo from '../../assets/images/eGradeLogo-removebg-preview.png';
import dashboard from '../../assets/icons/meterW.png';
import boxes from '../../assets/icons/boxes.png';
import studentIcon from '../../assets/icons/users.png';
import leaderboard from '../../assets/icons/leaderboard.png';
import settings from '../../assets/icons/settings.png';
import menu from '../../assets/icons/menu1.png';
import userImg from '../../assets/icons/userFinal.png';
import logout from '../../assets/icons/logout.png';
import { HeaderDashboard } from '../../components/HeaderDashboard/HeaderDashboard';
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import { usePath } from '../../utils/contexts/PathContext';
import axios from 'axios';
import useGetFacultyDetails from '../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';
import {toast} from 'react-toastify';
export function FacultyDashboard() {
  const { activeButton, updateActiveButton } = useContext(ActiveButtonContext);
  const [isActive, setIsActive] = useState(false);

  // Extract userId from JWT token
  const token = localStorage.getItem("token");
  let userId = "";
  let id = "";
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
      id = decodedToken.userId;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  const { userDetails, loading, error } = useGetFacultyDetails(userId);

  const sidebarMenuRefs = useRef([]);

  // Access the path context
  const { updatePath } = usePath();

  useEffect(() => {
    const savedActiveButton = localStorage.getItem('activeButton');
    if (savedActiveButton) {
      updateActiveButton(savedActiveButton);
    }
  }, [updateActiveButton]);

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // If your backend has a way to verify the token, make a request to validate it
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Get current time in seconds
          if (decodedToken.exp < currentTime) {
            // Token expired, clear localStorage
            console.warn("Token expired, logging out.");
            handleLogout();
          }
        } catch (error) {
          console.error("Invalid token, clearing localStorage.", error);
          handleLogout();
        }
      } else {
        // No token found, ensure proper login flow
        handleLogout();
      }
    };
  
    validateToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeButton');
    window.location.href = '/login'; // Redirect to login page or wherever you need
  };

  const handleHover = (isHovered) => {
    const sidebar = document.querySelector(`.${styleFaculty.sidebar}`);
    if (sidebar) {
      sidebar.style.zIndex = isHovered ? '9999' : 'initial';
    }
  };

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {

      // Update isActive to false
      await axios.patch(`/api/update-faculty-staff-status/${userId}`, { isActive: false });
  
      // Call the server-side API to log the activity
      await axios.post('/api/logout-activity', { 
        userID: id, 
        activityDescription: 'logged out'
      });

      // Proceed with logging out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeButton');
      window.location.href = '/'; // Navigate to home page
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging activity during logout:', error);
    }
  };
  const handleMenuItemClick = (btnId) => {
    updateActiveButton(btnId);
    updatePath(null, null); // Set both paths to null
  };

  const [userProfileImage, setUserProfileImage] = useState('');

  // Fetch user profile image URL
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {
        const response = await axios.get(`/api/get_faculty_details/${userId}`);
        const profileImageUrl = response.data.user_profile;
        const backendUrl = 'http://localhost:5000';
        const fullProfileImageUrl = profileImageUrl
          ? `${backendUrl}${profileImageUrl.startsWith('/uploads') ? '' : '/uploads/user-profiles/'}${profileImageUrl}`
          : userImg;
        setUserProfileImage(fullProfileImageUrl);
      } catch (error) {
        console.error('Error fetching user profile image:', error);
      }
    };

    if (userId) {
      fetchUserProfileImage();
    }
  }, [userId]);

  return (
    <div className={styleFaculty.dashboardContainer}>

      <div className={`${styleFaculty.sidebar} ${isActive ? styleFaculty.active : ''}`}>
        <div className={styleFaculty.logo}>
          <img src={eGradeLogo} alt="eGrade Logo" className={styleFaculty.eGradeLogo} />
          <img src={menu} onClick={toggleSidebar} id={styleFaculty.btn} />
        </div>

        <div className={styleFaculty.userContainer}>
          <div className={styleFaculty.userImgContainer}>
            <img src={userProfileImage} alt="user_icon" className={styleFaculty.userImg} />
          </div>
          <div className={styleFaculty.userInfo}>
            {loading && <p>Loading...</p>}
            {error && <p>Error fetching user details.</p>}
            {userDetails && (
              <>
                <p className={styleFaculty.userName}>{userDetails.first_name} {userDetails.last_name}</p>
                <p className={styleFaculty.userStatus}>{userDetails.title}</p>
              </>
            )}
          </div>
        </div>

        <ul className={styleFaculty.sidebarMenu}>
          {[
            { to: 'dashboard', label: 'Dashboard', icon: dashboard, btnId: 'dashboard' },
            { to: 'subjects', label: 'My Subjects', icon: boxes, btnId: 'subjects', disabled: !userDetails?.isVerified },
            { to: 'students', label: 'My Students', icon: studentIcon, btnId: 'students', disabled: !userDetails?.isVerified },
            { to: 'leaderboard', label: 'Leaderboard', icon: leaderboard, btnId: 'leaderboard', disabled: !userDetails?.isVerified },
            { to: 'settings', label: 'Settings', icon: settings, btnId: 'settings' },
          ].map(({ to, label, icon, btnId, disabled }, index) => (
            <li
              key={btnId}
              className={`${styleFaculty.sidebarMenuItem} ${disabled ? styleFaculty.disabled : ''}`}
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              ref={(el) => (sidebarMenuRefs.current[index] = el)}
              onClick={() => !disabled && handleMenuItemClick(btnId)}
            >
              <Link
                to={disabled ? '#' : to}
                className={`${styleFaculty.sidebarMenuLink} ${activeButton === btnId ? styleFaculty.active : ''} ${disabled ? styleFaculty.disabledLink : ''}`}
                onClick={() => !disabled && updateActiveButton(btnId)}
              >
                <img src={icon} className={styleFaculty.sidebarIcons} alt={`${label} Icon`} />
                <span className={styleFaculty.navItem}>{label}</span>
              </Link>
              <span className={styleFaculty.tooltip}>{label}</span>
            </li>
          ))}
          <li
            className={styleFaculty.sidebarMenuItem}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            ref={(el) => (sidebarMenuRefs.current[sidebarMenuRefs.current.length] = el)}
          >
            <button onClick={handleLogoutClick} className={styleFaculty.sidebarMenuLink}>
              <img src={logout} className={styleFaculty.sidebarIcons} alt="Logout" />
              <span className={styleFaculty.navItem}>Logout</span>
            </button>
            <span className={styleFaculty.tooltip}>Logout</span>
          </li>
        </ul>
      </div>

      <div className={styleFaculty.mainContent}>
        <HeaderDashboard />
        <Outlet />
      </div>

      {isLogoutModalOpen && (
        <div className={styleFaculty.modalOverlay}>
          <div className={styleFaculty.modal}>
            <h2>Confirm Logout</h2>
            <h4>Are you sure you want to logout?</h4>
            <div className={styleFaculty.buttonRow}>
              <button 
                onClick={handleConfirmLogout} 
                className={styleFaculty.confirmLogoutBtn}
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setLogoutModalOpen(false)} 
                className={styleFaculty.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
