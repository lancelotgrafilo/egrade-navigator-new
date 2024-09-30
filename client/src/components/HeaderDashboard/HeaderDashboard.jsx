import React, { useContext, useState, useEffect } from 'react';
import { usePath } from '../../utils/contexts/PathContext'; // Adjust the path to your context file
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import styleHeaderDashboard from './headerDashboard.module.css';
// import notifBell from '../../assets/icons/bell.png';

import dashboardIcon from '../../assets/icons/meterB.png';
import bookmark from '../../assets/icons/bookmarkB.png';
import subjectIcon from '../../assets/icons/boxesB.png';
import instructorIcon from '../../assets/icons/instructorB.png';
import studentIcon from '../../assets/icons/usersB.png';
import leaderboardIcon from '../../assets/icons/leaderboardB.png';
import historyIcon from '../../assets/icons/historyB.png';
import activeUsers from '../../assets/icons/activeB.png';
import settingIcon from '../../assets/icons/settingsB.png';
import usersListIcon from '../../assets/icons/usersListB.png';
import files from '../../assets/icons/filesB.png';

export function HeaderDashboard() {
  const { activeButton } = useContext(ActiveButtonContext);
  const { currentPath, subPath, updatePath } = usePath();
  // const [isDropdownVisible, setDropdownVisible] = useState(false);
  // const [notifications, setNotifications] = useState([]);

  // useEffect(() => {
  //   fetchNotifications().then((data) => {
  //     setNotifications(data);
  //   });
  // }, []);

  // const fetchNotifications = async () => {
  //   return [
  //     { id: 1, text: 'New message from John' },
  //     { id: 2, text: 'You have a new task assigned' },
  //   ];
  // };

  const renderPath = () => {
    let mainPath;
    switch (activeButton) {
      case 'dashboard':
        mainPath = 'Dashboard';
        break;
      case 'classProgram':
        mainPath = 'Class Program Information';
        break;
      case 'subjects':
        mainPath = 'Subjects List';
        break;
      case 'instructors':
        mainPath = "Instructors' List";
        break;
      case 'students':
        mainPath = "Students' List";
        break;
      case 'documents':
        mainPath = "Documents";
        break;
      case 'leaderboard':
        mainPath = 'Leaderboards';
        break;
      case 'history':
        mainPath = 'Activity Log History';
        break;
      case 'activeUsers':
        mainPath = 'Active Users';
        break;
      case 'usersList':
        mainPath = "Users' List"
        break;
      case 'settings':
        mainPath = 'Settings';
        break;
      default:
        mainPath = 'Dashboard';
    }

    updatePath(mainPath, subPath); // Update the main path and subpath
    return `${mainPath}${subPath ? ` / ${subPath}` : ''}`;
  };

  const renderHeading = () => {
    switch (activeButton) {
      case 'dashboard':
        return 'Dashboard';
      case 'classProgram':
        return 'Class Program Information';
      case 'subjects':
        return 'Subjects List';
      case 'instructors':
        return "Instructors' List";
      case 'students':
        return "Students' List";
      case 'documents':
        return "Documents";
      case 'leaderboard':
        return 'Leaderboards';
      case 'history':
        return 'Activity Log History';
      case 'activeUsers':
        return 'Active Users';
      case 'usersList':
        return "Users' List";
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderHeaderIcon = () => {
    switch (activeButton) {
      case 'dashboard':
        return dashboardIcon;
      case 'classProgram':
        return bookmark;
      case 'subjects':
        return subjectIcon;
      case 'instructors':
        return instructorIcon;
      case 'students':
        return studentIcon;
      case 'documents':
        return files;
      case 'leaderboard':
        return leaderboardIcon;
      case 'history':
        return historyIcon;
      case 'activeUsers':
        return activeUsers;
      case 'usersList':
        return usersListIcon;
      case 'settings':
        return settingIcon;
      default:
        return dashboardIcon;
    }
  };

  // const handleNotificationClick = () => {
  //   setDropdownVisible(!isDropdownVisible);
  // };

  // const handleNotificationItemClick = (id) => {
  //   console.log(`Notification ${id} clicked`);
  // };

  return (
    <div className={styleHeaderDashboard.headerDashboardContainer}>
      <div className={styleHeaderDashboard.dashboardHeader}>
        <div className={styleHeaderDashboard.dashboardEntrance}>
          <h1>{renderHeading()}</h1>
        </div>
        <div className={styleHeaderDashboard.dashboardWelcome}>
          {/* <div className={styleHeaderDashboard.wrapper} data-number="1">
            <button onClick={handleNotificationClick} className={styleHeaderDashboard.notifBtns}>
              <img src={notifBell} alt="bell" className={styleHeaderDashboard.bellIcon} />
            </button>
            {isDropdownVisible && (
              <div className={styleHeaderDashboard.dropdown}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} onClick={() => handleNotificationItemClick(notification.id)}>
                      {notification.text}
                    </div>
                  ))
                ) : (
                  <div>No new notifications</div>
                )}
              </div>
            )}
          </div> */}
        </div>
      </div>

      <div className={styleHeaderDashboard.dashboardSpan}>
        <span>
          <img src={renderHeaderIcon()} className={styleHeaderDashboard.dashboardIconB} />
          <span className={styleHeaderDashboard.path}>
            {renderPath()}
          </span>
        </span>
      </div>

      <hr className={styleHeaderDashboard.hr1} />
    </div>
  );
}
