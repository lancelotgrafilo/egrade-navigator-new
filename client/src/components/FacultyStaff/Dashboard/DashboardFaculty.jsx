import { useContext, useEffect, useState } from 'react';
import styleDashboardFaculty from './dashboard.module.css';
import studentIcon from '../../../assets/icons/users.png';
import chartIcon from '../../../assets/icons/chart.png';
import arrowB from '../../../assets/icons/arrowB.png';
import arrowG from '../../../assets/icons/arrowG.png';
import verifiedIcon from '../../../assets/icons/verified.png';
import { useNavigate } from 'react-router-dom';
import { ActiveButtonContext } from '../../../utils/contexts/ActiveButtonContext';
import { jwtDecode } from 'jwt-decode';
import { useAnnouncements } from '../../../utils/hooks/announcementHooks/useAnnouncement';
import useGetFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';
import useSemester from '../../../utils/hooks/semesterHooks/useSemester';
import useAcademicYears from '../../../utils/hooks/academicYearHooks/useAcademicYears';

export function DashboardFaculty() {
  const navigate = useNavigate();
  const { updateActiveButton } = useContext(ActiveButtonContext);
  const { announcements } = useAnnouncements();

  const handleNavigation = (path, btnId) => {
    updateActiveButton(btnId);
    navigate(path);
  };

  const token = localStorage.getItem('token');
  let userId = '';
  let userName = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
      userName = decodedToken.first_name || 'User';
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { userDetails, loading, error } = useGetFacultyDetails(userId);
  const { semesters } = useSemester();
  const { academicYears } = useAcademicYears();
  

  const [greeting, setGreeting] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [submittedGradesCount, setSubmittedGradesCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);

  useEffect(() => {
    if (userDetails?.load) {
      const hours = new Date().getHours();
      setGreeting(hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening');

      // By default, all subjects are displayed and count the total subjects
      setFilteredSubjects(userDetails.load);
      setSubjectCount(userDetails.load.length);

      // Calculate total submitted grades for all subjects
      const totalSubmittedGrades = userDetails.load.reduce((total, subject) => {
        return total + (subject.grades?.filter(grade => grade.isSubmitted).length || 0);
      }, 0);
      setSubmittedGradesCount(totalSubmittedGrades);
    }
  }, [userDetails]);

  useEffect(() => {
    if (selectedSemester || selectedAcademicYear) {
        // Filter the subjects based on selected semester and academic year
        const filtered = userDetails?.load?.filter(subject => {
            const matchesSemester = selectedSemester ? subject.semester === selectedSemester : true;
            const matchesAcademicYear = selectedAcademicYear ? subject.academic_year === selectedAcademicYear : true;
            return matchesSemester && matchesAcademicYear;
        }) || [];
        setFilteredSubjects(filtered);
        setSubjectCount(filtered.length);

        // Calculate submitted grades for the filtered subjects
        const totalSubmittedGrades = filtered.reduce((total, subject) => {
            if (subject.grades) { // Check if grades exist
                return total + subject.grades.filter(grade => grade.isSubmitted).length;
            }
            return total; // Return total if grades do not exist
        }, 0);
        setSubmittedGradesCount(totalSubmittedGrades);
    } else {
        // Reset to show all subjects when no filters are selected
        setFilteredSubjects(userDetails?.load || []);
        setSubjectCount(userDetails?.load?.length || 0);

        // Recalculate submitted grades for all subjects
        const totalSubmittedGrades = userDetails?.load?.reduce((total, subject) => {
            if (subject.grades) { // Check if grades exist
                return total + subject.grades.filter(grade => grade.isSubmitted).length;
            }
            return total; // Return total if grades do not exist
        }, 0);
        setSubmittedGradesCount(totalSubmittedGrades);
    }
  }, [selectedSemester, selectedAcademicYear, userDetails]);


  const handleResetFilters = () => {
    setSelectedSemester('');
    setSelectedAcademicYear("");
    setFilteredSubjects(userDetails?.load || []);
  };

  const filteredAnnouncements = announcements.filter(announcement => announcement.instructorID === userId);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard data</p>;

  return (
    <div className={styleDashboardFaculty.mainContainer}>
      <div className={styleDashboardFaculty.greetingCard}>
        <h2>{greeting}, {userDetails?.first_name || userName}!</h2>
        <p>Welcome to your dashboard.</p>
      </div>

      {userDetails?.isVerified ? (
        <div className={styleDashboardFaculty.verifiedMessage}>
          <p>
            <img src={verifiedIcon} alt="Verified" className={styleDashboardFaculty.verifiedIcon} />
            Your account is verified.
          </p>
        </div>
      ) : (
        <div className={styleDashboardFaculty.verificationMessage}>
          <p>Please verify your account in settings to access all features.</p>
        </div>
      )}

      <div className={styleDashboardFaculty.announcementCard}>
        <h3>Announcement</h3>
        {filteredAnnouncements.length > 0 ? (
          <ul>
            {filteredAnnouncements.map((announcement, index) => (
              <li key={index} className={styleDashboardFaculty.announcementBullet}>
                <p className={styleDashboardFaculty.announcementMessage}>
                  {announcement.message}
                </p>
                {announcement.dueDate && (
                  <p className={styleDashboardFaculty.announcementDueDate}>
                    Due Date: {new Date(announcement.dueDate).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No announcements at the moment.</p>
        )}
      </div>

      <div className={styleDashboardFaculty.filters}>
        <select 
          className={styleDashboardFaculty.filterDropdown}
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
        >
          <option value="">All Academic Years</option>
          {academicYears.map(ay => (
            <option key={ay._id} value={ay.ay}>{ay.ay}</option>
          ))}
        </select>

        <select 
          className={styleDashboardFaculty.filterDropdown}
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="">All Semesters</option>
          {semesters.map(sem => (
            <option key={sem._id} value={sem.semester}>{sem.semester}</option>
          ))}
        </select>

        <button className={styleDashboardFaculty.filterDropdown} onClick={handleResetFilters}>
          Reset
        </button>
      </div>

      {/* Display only submitted grades count in the format "Total Submitted Grades: X / Y" */}
      <div className={styleDashboardFaculty.submittedGrades}>
        <p>Total Submitted Grades: {submittedGradesCount} / {subjectCount}</p>
      </div>

      <div className={styleDashboardFaculty.dashboardContent}>

        <div className={styleDashboardFaculty.dashboardContainerSubjects}>
          <div className={styleDashboardFaculty.dashboardTop}>
            <div>
              <img src={chartIcon} alt="" className={styleDashboardFaculty.dashboardIcons} />
            </div>
            <div className={styleDashboardFaculty.dashboardDescription}>
              <span className={styleDashboardFaculty.spanNum}>{subjectCount}</span><br />
              <span className={styleDashboardFaculty.spanLabel}>SUBJECTS</span>
            </div>
          </div>
          <button
            className={styleDashboardFaculty.dashboardButtons}
            id={styleDashboardFaculty.dashboardButtonSubjects}
            onClick={() => handleNavigation('/facultyStaff/subjects', 'subjects')}
          >
            <span>View Details</span>
            <img src={arrowB} alt="" className={styleDashboardFaculty.buttonIcons} />
          </button>
        </div>

        <div className={styleDashboardFaculty.dashboardContainerStudents}>
          <div className={styleDashboardFaculty.dashboardTop}>
            <div>
              <img src={studentIcon} alt="" className={styleDashboardFaculty.dashboardIcons} />
            </div>
            <div className={styleDashboardFaculty.dashboardDescription}>
              <span className={styleDashboardFaculty.spanNum}>
                {filteredSubjects.reduce((total, subject) => total + subject.students.length, 0)}
              </span><br />
              <span className={styleDashboardFaculty.spanLabel}>STUDENTS</span>
            </div>
          </div>
          <button
            className={styleDashboardFaculty.dashboardButtons}
            id={styleDashboardFaculty.dashboardButtonStudents}
            onClick={() => handleNavigation('/facultyStaff/students', 'students')}
          >
            <span>View Details</span>
            <img src={arrowG} alt="" className={styleDashboardFaculty.buttonIcons} />
          </button>
        </div>
      </div>
    </div>
  );
}
