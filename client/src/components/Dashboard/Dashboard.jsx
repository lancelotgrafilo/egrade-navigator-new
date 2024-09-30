import { useContext, useEffect, useState, useCallback } from 'react';
import styleAdmin from './dashboard.module.css';
import instructorIcon from '../../assets/icons/user_list.png';
import studentIcon from '../../assets/icons/users.png';
import chartIcon from '../../assets/icons/chart.png';
import arrowB from '../../assets/icons/arrowB.png';
import arrowG from '../../assets/icons/arrowG.png';
import arrowO from '../../assets/icons/arrowO.png';
import arrowR from '../../assets/icons/arrowR.png';
import activeUsersIcon from '../../assets/icons/active.png';
import { useNavigate } from 'react-router-dom';
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import useDashboardCounts from '../../utils/hooks/useDashboardCounts';
import { jwtDecode } from 'jwt-decode'; 
import { useActiveUsers } from '../../utils/hooks/activeUsersHooks/useActiveUsers';
import { useAnnouncements } from '../../utils/hooks/announcementHooks/useAnnouncement';
import useGetFacultyToClassProg from '../../utils/hooks/facultyStaffHooks/useGetFacultyToClassProg';
import { useSubmitAnnouncement } from '../../utils/hooks/announcementHooks/useSubmitAnnouncement';
import useGetAdminDetails from '../../utils/hooks/adminHooks/useGetAdminDetails';
import useGetCollegeStaffDetails from '../../utils/hooks/collegeStaffHooks/useGetCollegeStaffDetails';
import verifiedIcon from '../../assets/icons/verified.png';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';
import useAcademicYears from '../../utils/hooks/academicYearHooks/useAcademicYears';
import useSemester from '../../utils/hooks/semesterHooks/useSemester';

import useGetGradeSheet from '../../utils/hooks/gradeSheetHooks/useGetGradeSheet';

export function Dashboard() {
  const navigate = useNavigate();
  const { updateActiveButton } = useContext(ActiveButtonContext);
  const { activeUsers } = useActiveUsers();
  const [isAddAnnouncementModalOpen, setAddAnnouncementModalOpen] = useState(false);
  const { announcements, refetch } = useAnnouncements();

  const handleNavigation = (path, btnId) => {
    updateActiveButton(btnId);
    navigate(path);
  };

  const { counts, loading, error } = useDashboardCounts();


  // Extract userId from JWT token
  const token = localStorage.getItem("token");
  let userId = "";
  let userTitle = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
      userTitle = decodedToken.title; // Get the user title from the token
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  const { userDetails } = useGetAdminDetails(userId);
  const { collegeStaffUserDetails } = useGetCollegeStaffDetails(userId);

  let currentUserDetails = null;

  if (userTitle === 'admin' && userDetails) {
    currentUserDetails = userDetails;
  } else if (userTitle === 'college_staff' && collegeStaffUserDetails) {
    currentUserDetails = collegeStaffUserDetails;
  }

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Calculate the number of online users
  const onlineUserCount = [
    ...activeUsers.students,
    ...activeUsers.facultyStaff,
    ...activeUsers.collegeStaff,
    ...activeUsers.admins
  ].filter(user => user.isActive).length;

  const [announcementType, setAnnouncementType] = useState('general');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedFacultyID, setSelectedFacultyID] = useState('');

  const handleAnnouncementTypeChange = (e) => {
    setAnnouncementType(e.target.value);
  };

  const handleMessageChange = (e) => {
    setAnnouncementMessage(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const { faculty, errorFaculty, loadingFaculty } = useGetFacultyToClassProg();

  const handleOpenModal = () => {
    setAddAnnouncementModalOpen(true);
  };
  const handleCloseModal = () => {
    setAddAnnouncementModalOpen(false);
  };
  
  const handleAddInstructorClick = (instructorId) => {
    setSelectedFacultyID(instructorId);
  };

  const { submitAnnouncement, loading: loadingSaveAnnouncement } = useSubmitAnnouncement();

  const handleSaveAnnouncement = async () => {
    if (!announcementMessage.trim() || !dueDate) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      await submitAnnouncement(announcementType, announcementMessage, dueDate, selectedFacultyID);
      refetch();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save announcement:", error);
    }
  };

   // Safely access user details
  const userName = userTitle === 'admin' 
    ? userDetails?.first_name || 'User'
    : userTitle === 'college_staff'
    ? collegeStaffUserDetails?.first_name || 'User'
    : 'User';
  
  const { departments } = useGetDepartments();
  const { academicYears } = useAcademicYears();
  const { semesters } = useSemester();

  const { gradeSheetData } = useGetGradeSheet();

  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [percentage, setPercentage] = useState(0);


  useEffect(() => {
    if (departments.length > 0) {
      setDepartment(departments[0].department);
    }
    if (academicYears.length > 0) {
      setAcademicYear(academicYears[0].ay);
    }
    if (semesters.length > 0) {
      setSemester(semesters[0].semester);
    }
  }, [departments, academicYears, semesters]);

  const calculateProgress = () => {
    setPercentage(0); // Reset percentage at the start
  
    if (!gradeSheetData || faculty.length === 0) {
      // console.log("No grade sheet data or faculty available.");
      return; // Exit if no data
    }
  
    // Log current filters
    // console.log(`Current Filters - Department: ${department || "None"}, Academic Year: ${academicYear || "None"}, Semester: ${semester || "None"}`);
  
    const filteredData = gradeSheetData.filter(item => {
      return (
        (department ? item.course === department : true) && // Change to match your data structure
        (academicYear ? item.academic_year === academicYear : true) &&
        (semester ? item.semester === semester : true)
      );
    });
  
    if (filteredData.length === 0) {
      // console.log("No matching data found. Percentage set to 0.");
      return setPercentage(0); // No data, percentage stays 0
    }
  
    const completedCount = filteredData.filter(item => item.isSubmitted).length;
  
    const facultyNames = faculty.map(member => {
      return `${member.first_name} ${member.middle_initial ? member.middle_initial + ' ' : ''}${member.last_name}`.trim();
    });
  
    const facultyCompletedCount = filteredData.filter(item => {
      const instructorName = item.instructor_name;
      return item.isSubmitted && facultyNames.includes(instructorName);
    }).length;
  
    const totalFacultyStaff = faculty.length;
  
    const newPercentage = totalFacultyStaff > 0 ? (facultyCompletedCount / totalFacultyStaff) * 100 : 0;
    setPercentage(newPercentage);
  
    // console.log(`Total Faculty: ${totalFacultyStaff}, Faculty Completed: ${facultyCompletedCount}, Percentage: ${newPercentage.toFixed(2)}%`);
  };  

  useEffect(() => {
    calculateProgress();
  }, [department, academicYear, semester, gradeSheetData, faculty]);
  

  const [isFacultyModalOpen, setFacultyModalOpen] = useState(false);
  const [facultySubmissions, setFacultySubmissions] = useState([]);

  const handleOpenFacultyModal = () => {
    const filteredFaculty = faculty.filter(member => {
      return department ? member.department === department : true;
    });

    const submissionStatus = filteredFaculty.map(member => {
      // Get the instructor name for matching
      const instructorName = `${member.first_name} ${member.middle_initial ? member.middle_initial + ' ' : ''}${member.last_name}`.trim();

      // Filter grade sheet data for this instructor
      const instructorSubjects = gradeSheetData.filter(item => item.instructor_name === instructorName);

      // Count submitted and total subjects
      const totalSubjects = instructorSubjects.length;
      const submittedSubjects = instructorSubjects.filter(item => item.isSubmitted).length;

      // Determine status
      let status = 'Not Submitted';
      if (submittedSubjects === totalSubjects && totalSubjects > 0) {
          status = 'Fully Completed';
      } else if (submittedSubjects > 0) {
          status = 'Partially Completed';
      }

      return {
          ...member,
          totalSubjects,
          submittedSubjects,
          status,
      };
    });

    setFacultySubmissions(submissionStatus);
    setFacultyModalOpen(true);
  };

  



  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard data</p>;
  return (
    <>
      <div className={styleAdmin.mainContainer}>

        <div className={styleAdmin.greetingCard}>
          <h2>{greeting}, {userName}!</h2>
          <p>Welcome to your dashboard.</p>
        </div>

        {currentUserDetails?.isVerified ? (
          <div className={styleAdmin.verifiedMessage}>
            <p>
              <img src={verifiedIcon} alt="Verified" className={styleAdmin.verifiedIcon} />
              Your account is verified.
            </p>
          </div>
        ) : (
          <div className={styleAdmin.verificationMessage}>
            <p>Please verify your account in settings to access all features.</p>
          </div>
        )}

        <div className={styleAdmin.announcementCard}>
          <div className={styleAdmin.announcementCardContent}>
            <h3>Announcement</h3>
            {announcements.length > 0 ? (
              <ul>
                {announcements.map((announcement, index) => (
                  <li key={index} className={styleAdmin.announcementBullet}>
                    <p className={styleAdmin.announcementMessage}>{announcement.message}</p>
                    {announcement.dueDate && (
                      <p className={styleAdmin.announcementDueDate}>Due Date: {new Date(announcement.dueDate).toLocaleDateString()}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No announcements at the moment.</p>
            )}
          </div>
          <div>
            <button 
              className={styleAdmin.addAnnouncementBtn} 
              onClick={handleOpenModal}
            >
              Add Announcement
            </button>
          </div>
          
        </div>

        <div className={styleAdmin.progressBarContainer}>
          <div className={styleAdmin.filtersRow}>
            <select onChange={e => setDepartment(e.target.value)} value={department} className={styleAdmin.filters}>
              {departments.map(dept => (
                <option key={dept._id} value={dept.department}>{dept.department}</option>
              ))}
            </select>

            <select onChange={e => setAcademicYear(e.target.value)} value={academicYear} className={styleAdmin.filters}>
              {academicYears.map(ay => (
                <option key={ay._id} value={ay.ay}>{ay.ay}</option>
              ))}
            </select>

            <select onChange={e => setSemester(e.target.value)} value={semester} className={styleAdmin.filters}>
              {semesters.map(sem => (
                <option key={sem._id} value={sem.semester}>{sem.semester}</option>
              ))}
            </select>
          </div>

          {/* Circular Progress Bar */}
          <div className={styleAdmin.progressContainer}>
            <CircularProgressbar
              value={percentage}
              text={`${percentage.toFixed(2)}%`} // Updated for 2 decimal places
              styles={buildStyles({
                textSize: '24px',
                pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
                textColor: '#3e98c7',
                trailColor: '#d6d6d6',
              })}
            />
            <p className={styleAdmin.progressLabel}>Grade Submission Progress</p>
          </div>
          <button 
            className={styleAdmin.viewFacultyBtn} 
            onClick={handleOpenFacultyModal}
          >
            View Faculty Submission Status
          </button>
        </div>

        <div className={styleAdmin.dashboardContent}>
          <div className={styleAdmin.dashboardContainerSubjects}>
            <div className={styleAdmin.dashboardTop}>
              <div>
                <img src={chartIcon} alt="" className={styleAdmin.dashboardIcons} />
              </div>
              <div className={styleAdmin.dashboardDescription}>
                <span className={styleAdmin.spanNum}>{counts.subjects}</span> <br />
                <span className={styleAdmin.spanLabel}>SUBJECTS</span>
              </div>
            </div>
            <button 
              className={styleAdmin.dashboardButtons} 
              id={styleAdmin.dashboardButtonSubjects}
              onClick={() => handleNavigation('/admin/subjects', 'subjects')}
            >
              <span>View Details</span>
              <img src={arrowB} alt="" className={styleAdmin.buttonIcons} />
            </button>  
          </div>

          <div className={styleAdmin.dashboardContainerStudents}>
            <div className={styleAdmin.dashboardTop}>
              <div>
                <img src={studentIcon} alt="" className={styleAdmin.dashboardIcons} />
              </div>
              <div className={styleAdmin.dashboardDescription}>
              <span className={styleAdmin.spanNum}>{counts.students}</span><br />
                <span className={styleAdmin.spanLabel}>STUDENTS</span>
              </div>
            </div>
            <button 
              className={styleAdmin.dashboardButtons} 
              id={styleAdmin.dashboardButtonStudents}
              onClick={() => handleNavigation('/admin/students', 'students')}
            >
              <span>View Details</span>
              <img src={arrowG} alt="" className={styleAdmin.buttonIcons} />
            </button>  
          </div>

          <div className={styleAdmin.dashboardContainerInstructors}>
            <div className={styleAdmin.dashboardTop}>
              <div>
                <img src={instructorIcon} alt="" className={styleAdmin.dashboardIcons} />
              </div>
              <div className={styleAdmin.dashboardDescription}>
              <span className={styleAdmin.spanNum}>{counts.instructors}</span><br />
                <span className={styleAdmin.spanLabel}>INSTRUCTORS</span>
              </div>
            </div>
            <button 
              className={styleAdmin.dashboardButtons} 
              id={styleAdmin.dashboardButtonInstructors}
              onClick={() => handleNavigation('/admin/instructors', 'instructors')}
            >
              <span>View Details</span>
              <img src={arrowO} alt="" className={styleAdmin.buttonIcons} />
            </button>  
          </div>

          <div className={styleAdmin.dashboardContainerActiveUsers}>
            <div className={styleAdmin.dashboardTop}>
              <div>
                <img src={activeUsersIcon} alt="" className={styleAdmin.dashboardIcons} />
              </div>
              <div className={styleAdmin.dashboardDescription}>
                <span className={styleAdmin.spanNum}>{onlineUserCount}</span><br />
                <span className={styleAdmin.spanLabel}>ACTIVE USERS</span>
              </div>
            </div>
            <button 
              className={styleAdmin.dashboardButtons} 
              id={styleAdmin.dashboardButtonActiveUsers}
              onClick={() => handleNavigation('/admin/activeUsers', 'activeUsers')}
            >
              <span>View Details</span>
              <img src={arrowR} alt="" className={styleAdmin.buttonIcons} />
            </button>              
          </div>
        </div>
      </div>

      {isAddAnnouncementModalOpen && (
        <div className={styleAdmin.modalOverlay}>
          <div className={styleAdmin.modal}>
            <h2>Add Announcement</h2>

            {/* Radio Buttons for Announcement Type */}
            <div className={styleAdmin.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="announcementType"
                  value="general"
                  className={styleAdmin.radioType}
                  checked={announcementType === 'general'}
                  onChange={handleAnnouncementTypeChange}
                />
                General
              </label>
              <label>
                <input
                  type="radio"
                  name="announcementType"
                  value="specific"
                  className={styleAdmin.radioType}
                  checked={announcementType === 'specific'}
                  onChange={handleAnnouncementTypeChange}
                />
                Specific to Instructor
              </label>
            </div>

            {announcementType === 'specific' && (
              <>
                {loadingFaculty ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    {faculty.length > 0 ? (
                      <select 
                        className={styleAdmin.selectField} 
                        onChange={(e) => handleAddInstructorClick(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select an Instructor</option>
                        {faculty.map((facultyMember) => (
                          <option 
                            key={facultyMember._id} 
                            value={facultyMember._id}
                          >
                            {facultyMember.facultyID} - {facultyMember.last_name}, {facultyMember.first_name} {facultyMember.middle_initial}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p>No instructors found</p>
                    )}
                  </>
                )}

              </>
            )}

            <textarea
              placeholder="Enter your announcement message here..."
              className={styleAdmin.messageInput}
              value={announcementMessage}
              onChange={handleMessageChange}
            />

            <label className={styleAdmin.dueDateLabel}>
              Due Date:
              <input 
                type="date" 
                value={dueDate} 
                onChange={handleDueDateChange} 
                className={styleAdmin.dueDateInput}
              />
            </label>
            

            <div className={styleAdmin.btnRow}>
              <button type="button" className={styleAdmin.cancelBtn} onClick={handleCloseModal}>
                Close
              </button>
              <button type="submit" 
                className={styleAdmin.saveBtn} 
                onClick={handleSaveAnnouncement}
                disabled={loadingSaveAnnouncement}>
                {loadingSaveAnnouncement ? (
                  <div className={styleAdmin.loader}></div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}  

      {isFacultyModalOpen && (
          <div className={styleAdmin.modalOverlay}>
              <div className={styleAdmin.modal}>
                  <h2>Faculty Submission Status</h2>
                  <div className={styleAdmin.tableContainer}>
                      <table>
                          <thead>
                              <tr>
                                  <th>Faculty Name</th>
                                  <th>Department</th>
                                  <th>Subjects</th>
                                  <th>Status</th>
                              </tr>
                          </thead>
                          <tbody>
                              {facultySubmissions.length > 0 ? (
                                  facultySubmissions.map(member => (
                                      <tr key={member._id}>
                                          <td>{`${member.first_name} ${member.middle_initial || ''} ${member.last_name}`}</td>
                                          <td>{member.department}</td>
                                          <td>{`${member.submittedSubjects}/${member.totalSubjects}`}</td>
                                          <td>{member.status}</td>
                                      </tr>
                                  ))
                              ) : (
                                  <tr>
                                      <td colSpan="4">No faculty found for the selected department</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
                  <div className={styleAdmin.btnRow}>
                      <button type="button" className={styleAdmin.cancelBtn} onClick={() => setFacultyModalOpen(false)}>
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}


    </>
  );
}
