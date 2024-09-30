import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styleSubjects from './subjectFaculty.module.css';
import studentIcon from '../../../assets/icons/usersB.png';
import { jwtDecode } from 'jwt-decode';
import { ActiveButtonContext } from '../../../utils/contexts/ActiveButtonContext';
import { usePath } from '../../../utils/contexts/PathContext';

import useGetFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';

import useAcademicYears from '../../../utils/hooks/academicYearHooks/useAcademicYears';
import useSemester from '../../../utils/hooks/semesterHooks/useSemester';

export function SubjectFaculty() {
  const navigate = useNavigate();
  const { updateActiveButton } = useContext(ActiveButtonContext);
  const { updatePath } = usePath();
  
  const handleSubjectStudents = () => {
    updateActiveButton('students');
    navigate(`/facultyStaff/students`);
    updatePath("Students", "Students");
  }

  // Extract userId from JWT token
  const token = localStorage.getItem('token');
  let userId = '';
  
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { userDetails, loading } = useGetFacultyDetails(userId);

  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');

  const filteredLoad = userDetails?.load?.filter(subject =>
    (!academicYear || subject.academic_year === academicYear) &&
    (!semester || subject.semester === semester)
  ) || [];

  const { academicYears } = useAcademicYears();
  const { semesters } = useSemester();

  return (
    <div className={styleSubjects.mainContainer}>
      <div className={styleSubjects.dashboardContent}>
        <div className={styleSubjects.searchBar}>
          <select 
            className={styleSubjects.filterDropdown}
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(ay => (
              <option key={ay._id} value={ay.ay}>{ay.ay}</option>
            ))}
          </select>

          <select 
            className={styleSubjects.filterDropdown}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={sem.semester}>{sem.semester}</option>
            ))}
          </select>
        </div>

        <div className={styleSubjects.tableContainer}>
          <table className={styleSubjects.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Course</th>
                <th>Year</th>
                <th>Section</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoad.map((subject, index) => (
                <tr key={subject._id}>
                  <td>{index + 1}</td>
                  <td>{subject.subject_code}</td>
                  <td>{subject.subject_title}</td>
                  <td>{subject.course}</td>
                  <td>{subject.year}</td>
                  <td>{subject.section}</td>
                  <td>{subject.semester}</td>
                  <td>{subject.academic_year}</td>
                  <td>
                    <div className={styleSubjects.actionRow}>
                      <button
                        onClick={() => handleSubjectStudents(subject._id)}
                        className={styleSubjects.studentsBtn}
                      >
                        <img src={studentIcon} className={styleSubjects.studentsImg} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
