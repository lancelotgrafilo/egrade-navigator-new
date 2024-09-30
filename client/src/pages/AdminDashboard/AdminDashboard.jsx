import { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styleAdmin from './adminDashboard.module.css';
import eGradeLogo from '../../assets/images/eGradeLogo-removebg-preview.png';
import dashboard from '../../assets/icons/meterW.png';
import bookmark from '../../assets/icons/bookmark.png';
import boxes from '../../assets/icons/boxes.png';
import instructorIcon from '../../assets/icons/user_list.png';
import studentIcon from '../../assets/icons/users.png';
import leaderboard from '../../assets/icons/leaderboard.png';
import history from '../../assets/icons/history.png';
import settings from '../../assets/icons/settings.png';
import menu from '../../assets/icons/menu1.png';
import userImg from '../../assets/icons/userFinal.png';
import logout from '../../assets/icons/logout.png';
import activeUsers from '../../assets/icons/active.png';
import usersListIcon from '../../assets/icons/usersList.png';
import files from '../../assets/icons/files.png';
import { HeaderDashboard } from '../../components/HeaderDashboard/HeaderDashboard';
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import { usePath } from '../../utils/contexts/PathContext';
import { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';
import useGetAdminDetails from '../../utils/hooks/adminHooks/useGetAdminDetails';

export function AdminDashboard() {
  const { activeButton, updateActiveButton } = useContext(ActiveButtonContext);
  const [isActive, setIsActive] = useState(false);
  
  const sidebarMenuRefs = useRef([]);
  const { updatePath } = usePath();

  useEffect(() => {
    const savedActiveButton = localStorage.getItem('activeButton');
    if (savedActiveButton) {
      updateActiveButton(savedActiveButton);
    }
  }, [updateActiveButton]);

  // Clear local storage on window close
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
  

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleHover = (isHovered) => {
    const sidebar = document.querySelector(`.${styleAdmin.sidebar}`);
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
      await axios.patch(`/api/update-admin-status/${userId}`, { isActive: false });
  
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

  const { userDetails, loading, error } = useGetAdminDetails(userId);
  const [userProfileImage, setUserProfileImage] = useState('');

  // Fetch user profile image URL
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {
        const response = await axios.get(`/api/get-admin-details/${userId}`);
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
    <div className={styleAdmin.dashboardContainer}>

      <div className={`${styleAdmin.sidebar} ${isActive ? styleAdmin.active : ''}`}>
        <div className={styleAdmin.logo}>
          <img src={eGradeLogo} alt="eGrade Logo" className={styleAdmin.eGradeLogo} />
          <img src={menu} onClick={toggleSidebar} id={styleAdmin.btn} />
        </div>

        <div className={styleAdmin.userContainer}>
          <div className={styleAdmin.userImgContainer}>
            <img src={userProfileImage} alt="user_icon" className={styleAdmin.userImg} />
          </div>
          <div className={styleAdmin.userInfo}>
            {loading && <p>Loading...</p>}
            {error && <p>Error fetching user details.</p>}
            {userDetails && (
              <>
                <p className={styleAdmin.userName}>{userDetails.first_name} {userDetails.last_name}</p>
                <p className={styleAdmin.userStatus}>{userDetails.title}</p>
              </>
            )}
          </div>
        </div>

        <ul className={styleAdmin.sidebarMenu}>
          {[
            { to: 'dashboard', label: 'Dashboard', icon: dashboard, btnId: 'dashboard' },
            { to: 'classProgramInformation', label: 'Class Program Information', icon: bookmark, btnId: 'classProgram', disabled: !userDetails?.isVerified },
            { to: 'subjects', label: 'Subjects', icon: boxes, btnId: 'subjects', disabled: !userDetails?.isVerified },
            { to: 'instructors', label: 'Instructors', icon: instructorIcon, btnId: 'instructors', disabled: !userDetails?.isVerified },
            { to: 'students', label: 'Students', icon: studentIcon, btnId: 'students', disabled: !userDetails?.isVerified },
            { to: 'documents', label: 'Documents', icon: files, btnId: 'documents', disabled: !userDetails?.isVerified },
            { to: 'leaderboard', label: 'Leaderboard', icon: leaderboard, btnId: 'leaderboard', disabled: !userDetails?.isVerified },
            { to: 'activityLogHistory', label: 'Activity Log History', icon: history, btnId: 'history', disabled: !userDetails?.isVerified },
            { to: 'activeUsers', label: 'Active Users', icon: activeUsers, btnId: 'activeUsers', disabled: !userDetails?.isVerified },
            { to: 'usersList', label: "Users' List", icon: usersListIcon, btnId: 'usersList', disabled: !userDetails?.isVerified },
            { to: 'settings', label: 'Settings', icon: settings, btnId: 'settings' },
          ].map(({ to, label, icon, btnId, disabled }, index) => (
            <li
              key={btnId}
              className={`${styleAdmin.sidebarMenuItem} ${disabled ? styleAdmin.disabled : ''}`}
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              ref={(el) => (sidebarMenuRefs.current[index] = el)}
              onClick={() => !disabled && handleMenuItemClick(btnId)}
            >
              <Link
                to={disabled ? '#' : to}
                className={`${styleAdmin.sidebarMenuLink} ${activeButton === btnId ? styleAdmin.active : ''} ${disabled ? styleAdmin.disabledLink : ''}`}
                onClick={() => !disabled && updateActiveButton(btnId)}
              >
                <img src={icon} className={styleAdmin.sidebarIcons} alt={`${label} Icon`} />
                <span className={styleAdmin.navItem}>{label}</span>
              </Link>
              <span className={styleAdmin.tooltip}>{label}</span>
            </li>
          ))}
          <li
            className={styleAdmin.sidebarMenuItem}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            ref={(el) => (sidebarMenuRefs.current[sidebarMenuRefs.current.length] = el)}
          >
            <button onClick={handleLogoutClick} className={styleAdmin.sidebarMenuLink}>
              <img src={logout} className={styleAdmin.sidebarIcons} alt="Logout" />
              <span className={styleAdmin.navItem}>Logout</span>
            </button>
            <span className={styleAdmin.tooltip}>Logout</span>
          </li>
        </ul>
      </div>

      <div className={styleAdmin.mainContent}>
        <HeaderDashboard />
        <Outlet />
      </div>

      {isLogoutModalOpen && (
        <div className={styleAdmin.modalOverlay}>
          <div className={styleAdmin.modal}>
            <h2>Confirm Logout</h2>
            <h4>Are you sure you want to logout?</h4>
            <div className={styleAdmin.buttonRow}>
              <button 
                onClick={handleConfirmLogout} 
                className={styleAdmin.confirmLogoutBtn}
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setLogoutModalOpen(false)} 
                className={styleAdmin.cancelBtn}
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
