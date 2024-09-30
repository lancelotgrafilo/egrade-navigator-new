import { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styleRegistrar from './registrarDashboard.module.css';
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
import { HeaderDashboard } from '../../components/HeaderDashboard/HeaderDashboard';
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import { usePath } from '../../utils/contexts/PathContext';

export function RegistrarDashboard() {
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

  const handleHover = (isHovered) => {
    const sidebar = document.querySelector(`.${styleRegistrar.sidebar}`);
    if (sidebar) {
      sidebar.style.zIndex = isHovered ? '9999' : 'initial';
    }
  };

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeButton');
    localStorage.removeItem('user');
    window.location.href = '/'; // Navigate to home page
    console.log('Logged out successfully');
  };

  // Set paths to null on list item click
  const handleMenuItemClick = (btnId) => {
    updateActiveButton(btnId);
    updatePath(null, null); // Set both paths to null
  };

  return (
    <div className={styleRegistrar.dashboardContainer}>
      <div className={`${styleRegistrar.sidebar} ${isActive ? styleRegistrar.active : ''}`}>
        <div className={styleRegistrar.logo}>
          <img src={eGradeLogo} alt="eGrade Logo" className={styleRegistrar.eGradeLogo} />
          <img src={menu} onClick={toggleSidebar} id={styleRegistrar.btn} />
        </div>

        <div className={styleRegistrar.userContainer}>
          <div className={styleRegistrar.userImgContainer}>
            <img src={userImg} alt="user_icon" className={styleRegistrar.userImg} />
          </div>
          <div className={styleRegistrar.userInfo}>
            <p className={styleRegistrar.userName}>Lancelot</p>
            <p className={styleRegistrar.userStatus}>Registrar Staff</p>
          </div>
        </div>

        <ul className={styleRegistrar.sidebarMenu}>
          {[
            { to: 'dashboard', label: 'Dashboard', icon: dashboard, btnId: 'dashboard' },
            { to: 'classProgramInformation', label: 'Class Program Information', icon: bookmark, btnId: 'classProgram' },
            { to: 'subjects', label: 'Subjects', icon: boxes, btnId: 'subjects' },
            { to: 'instructors', label: 'Instructors', icon: instructorIcon, btnId: 'instructors' },
            { to: 'students', label: 'Students', icon: studentIcon, btnId: 'students' },
            { to: 'leaderboard', label: 'Leaderboard', icon: leaderboard, btnId: 'leaderboard' },
            { to: 'settings', label: 'Settings', icon: settings, btnId: 'settings' },
          ].map(({ to, label, icon, btnId }, index) => (
            <li
              key={btnId}
              className={styleRegistrar.sidebarMenuItem}
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              ref={(el) => (sidebarMenuRefs.current[index] = el)}
              onClick={() => handleMenuItemClick(btnId)} // Set paths to null on click
            >
              <Link
                to={to}
                className={`${styleRegistrar.sidebarMenuLink} ${activeButton === btnId ? styleRegistrar.active : ''}`}
                onClick={() => updateActiveButton(btnId)}
              >
                <img src={icon} className={styleRegistrar.sidebarIcons} alt={`${label} Icon`} />
                <span className={styleRegistrar.navItem}>{label}</span>
              </Link>
              <span className={styleRegistrar.tooltip}>{label}</span>
            </li>

          ))}
          <li
            className={styleRegistrar.sidebarMenuItem}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            ref={(el) => (sidebarMenuRefs.current[sidebarMenuRefs.current.length] = el)}
          >
            <button onClick={handleLogoutClick} className={styleRegistrar.sidebarMenuLink}>
              <img src={logout} className={styleRegistrar.sidebarIcons} alt="Logout" />
              <span className={styleRegistrar.navItem}>Logout</span>
            </button>
            <span className={styleRegistrar.tooltip}>Logout</span>
          </li>
        </ul>
      </div>

      <div className={styleRegistrar.mainContent}>
        <HeaderDashboard />
        <Outlet />
      </div>

      {isLogoutModalOpen && (
        <div className={styleRegistrar.modalOverlay}>
          <div className={styleRegistrar.modal}>
            <h2>Confirm Logout</h2>
            <h4>Are you sure you want to logout?</h4>
            <div className={styleRegistrar.buttonRow}>
              <button 
                onClick={handleConfirmLogout} 
                className={styleRegistrar.confirmLogoutBtn}
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setLogoutModalOpen(false)} 
                className={styleRegistrar.cancelBtn}
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
