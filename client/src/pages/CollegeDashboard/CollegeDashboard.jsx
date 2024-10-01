import { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styleCollege from './collegeDashboard.module.css';
import eGradeLogo from '../../assets/images/eGradeLogo-removebg-preview.png';
import dashboard from '../../assets/icons/meterW.png';
import bookmark from '../../assets/icons/bookmark.png';
import boxes from '../../assets/icons/boxes.png';
import instructorIcon from '../../assets/icons/user_list.png';
import studentIcon from '../../assets/icons/users.png';
import leaderboard from '../../assets/icons/leaderboard.png';
import settings from '../../assets/icons/settings.png';
import menu from '../../assets/icons/menu1.png';
import userImg from '../../assets/icons/userFinal.png';
import logout from '../../assets/icons/logout.png';
import files from '../../assets/icons/files.png';
import { HeaderDashboard } from '../../components/HeaderDashboard/HeaderDashboard';
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import { usePath } from '../../utils/contexts/PathContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

import useGetCollegeStaffDetails from '../../utils/hooks/collegeStaffHooks/useGetCollegeStaffDetails';

export function CollegeDashboard() {
  const { activeButton, updateActiveButton } = useContext(ActiveButtonContext);
  const [isActive, setIsActive] = useState(false);

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
    const sidebar = document.querySelector(`.${styleCollege.sidebar}`);
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
      await axios.patch(`https://egrade-backend.onrender.com/api/update-college-staff-status/${userId}`, { isActive: false });
  
      // Call the server-side API to log the activity
      await axios.post('https://egrade-backend.onrender.com/api/logout-activity', { 
        userID: id, 
        activityDescription: 'logged out'
      });
  
      // Proceed with logging out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeButton');
      window.location.href = '/'; // Navigate to home page
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging activity during logout:', error);
    }
  };

  // Set paths to null on list item click
  const handleMenuItemClick = (btnId) => {
    updateActiveButton(btnId);
    updatePath(null, null); // Set both paths to null
  };

  const token = localStorage.getItem("token");
  let userId = "";
  let id = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
      id = decodedToken.userId;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }
  const { collegeStaffUserDetails, loading, error } = useGetCollegeStaffDetails(userId);
  const [userProfileImage, setUserProfileImage] = useState('');

  // Fetch user profile image URL
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {
        const response = await axios.get(`https://egrade-backend.onrender.com/api/get-college-staff-details/${userId}`);
        const profileImageUrl = response.data.user_profile;
        const backendUrl = 'https://egrade-backend.onrender.com';
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
    <div className={styleCollege.dashboardContainer}>
      <div className={`${styleCollege.sidebar} ${isActive ? styleCollege.active : ''}`}>
        <div className={styleCollege.logo}>
          <img src={eGradeLogo} alt="eGrade Logo" className={styleCollege.eGradeLogo} />
          <img src={menu} onClick={toggleSidebar} id={styleCollege.btn} />
        </div>

        <div className={styleCollege.userContainer}>
          <div className={styleCollege.userImgContainer}>
            <img src={userProfileImage} alt="user_icon" className={styleCollege.userImg} />
          </div>
          <div className={styleCollege.userInfo}>
            {loading && <p>Loading...</p>}
            {error && <p>Error fetching user details.</p>}
            {collegeStaffUserDetails && (
              <>
                <p className={styleCollege.userName}>{collegeStaffUserDetails.first_name} {collegeStaffUserDetails.last_name}</p>
                <p className={styleCollege.userStatus}>{collegeStaffUserDetails.title}</p>
              </>
            )}
          </div>
        </div>

        <ul className={styleCollege.sidebarMenu}>
          {[
            { to: 'dashboard', label: 'Dashboard', icon: dashboard, btnId: 'dashboard' },
            { to: 'classProgramInformation', label: 'Class Program Information', icon: bookmark, btnId: 'classProgram', disabled: !collegeStaffUserDetails?.isVerified },
            { to: 'subjects', label: 'Subjects', icon: boxes, btnId: 'subjects', disabled: !collegeStaffUserDetails?.isVerified },
            { to: 'instructors', label: 'Instructors', icon: instructorIcon, btnId: 'instructors', disabled: !collegeStaffUserDetails?.isVerified },
            { to: 'students', label: 'Students', icon: studentIcon, btnId: 'students', disabled: !collegeStaffUserDetails?.isVerified },
            { to: 'documents', label: 'Documents', icon: files, btnId: 'documents', disabled: !collegeStaffUserDetails?.isVerified },
            { to: 'leaderboard', label: 'Leaderboard', icon: leaderboard, btnId: 'leaderboard', disabled: !collegeStaffUserDetails?.isVerified },
            { to: 'settings', label: 'Settings', icon: settings, btnId: 'settings' },
          ].map(({ to, label, icon, btnId, disabled }, index) => (
            <li
              key={btnId}
              className={`${styleCollege.sidebarMenuItem} ${disabled ? styleCollege.disabled : ''}`}
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              ref={(el) => (sidebarMenuRefs.current[index] = el)}
              onClick={() => !disabled && handleMenuItemClick(btnId)}
            >
              <Link
                to={disabled ? '#' : to}
                className={`${styleCollege.sidebarMenuLink} ${activeButton === btnId ? styleCollege.active : ''} ${disabled ? styleCollege.disabledLink : ''}`}
                onClick={() => !disabled && updateActiveButton(btnId)}
              >
                <img src={icon} className={styleCollege.sidebarIcons} alt={`${label} Icon`} />
                <span className={styleCollege.navItem}>{label}</span>
              </Link>
              <span className={styleCollege.tooltip}>{label}</span>
            </li>

          ))}
          <li
            className={styleCollege.sidebarMenuItem}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            ref={(el) => (sidebarMenuRefs.current[sidebarMenuRefs.current.length] = el)}
          >
            <button onClick={handleLogoutClick} className={styleCollege.sidebarMenuLink}>
              <img src={logout} className={styleCollege.sidebarIcons} alt="Logout" />
              <span className={styleCollege.navItem}>Logout</span>
            </button>
            <span className={styleCollege.tooltip}>Logout</span>
          </li>
        </ul>
      </div>

      <div className={styleCollege.mainContent}>
        <HeaderDashboard />
        <Outlet />
      </div>


      {isLogoutModalOpen && (
        <div className={styleCollege.modalOverlay}>
          <div className={styleCollege.modal}>
            <h2>Confirm Logout</h2>
            <h4>Are you sure you want to logout?</h4>
            <div className={styleCollege.buttonRow}>
              <button 
                onClick={handleConfirmLogout} 
                className={styleCollege.confirmLogoutBtn}
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setLogoutModalOpen(false)} 
                className={styleCollege.cancelBtn}
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
