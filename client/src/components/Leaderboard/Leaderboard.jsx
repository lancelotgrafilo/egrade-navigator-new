import { useState } from 'react';
import styleLeaderboard from './leaderboard.module.css';
import useGetLeaderboard from '../../utils/hooks/leaderboardHooks/useGetLeaderboard';

import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';
import useAcademicYears from '../../utils/hooks/academicYearHooks/useAcademicYears';
import useSemester from '../../utils/hooks/semesterHooks/useSemester';

export function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');

  const { departments } = useGetDepartments();
  const { academicYears } = useAcademicYears();
  const { semesters } = useSemester();

  const { leaderboard, loading, error } = useGetLeaderboard(searchQuery, academicYear, semester, course);

  return (
    <div className={styleLeaderboard.mainContainer}>
      <div className={styleLeaderboard.dashboardContent}>
        <div className={styleLeaderboard.searchBar}>
          <input
            type="text"
            placeholder='Search Subject, Academic Year...'
            className={styleLeaderboard.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styleLeaderboard.filters}>
          <select
            className={styleLeaderboard.filterDropdown}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept.department}>{dept.department}</option>
            ))}
          </select>

          <select
            className={styleLeaderboard.filterDropdown}
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(ay => (
              <option key={ay._id} value={ay.ay}>{ay.ay}</option>
            ))}
          </select>

          <select
            className={styleLeaderboard.filterDropdown}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={sem.semester}>{sem.semester}</option>
            ))}
          </select>
        </div>

        <div className={styleLeaderboard.tableContainer}>
          <table className={styleLeaderboard.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Initial</th>
                <th>Course</th>
                <th>AY</th>
                <th>Semester</th>
                <th>GWA</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>
                    Error: {error}
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                leaderboard.map((student, index) => {
                  const { _id, last_name, first_name, middle_initial, schoolID, course, grades } = student;

                  // Filter grades by selected semester (if a semester is selected)
                  const filteredGrades = grades.filter((grade) => {
                    return semester ? grade.semester === semester : true;
                  });

                  // For each student, display a row for each filtered grade (per semester)
                  return filteredGrades.map((grade, gradeIndex) => {
                    const { GWA = '', academic_year = '', semester = '' } = grade;

                    // Determine the class for top 3 students based on rank
                    let rowClass = '';
                    if (index === 0) rowClass = styleLeaderboard.first;
                    else if (index === 1) rowClass = styleLeaderboard.second;
                    else if (index === 2) rowClass = styleLeaderboard.third;
                    else rowClass = styleLeaderboard.regular;

                    return (
                      <tr key={`${_id}-${gradeIndex}`} className={rowClass}>
                        <td>{index + 1}</td> {/* Display rank based on student index */}
                        <td>{schoolID}</td>
                        <td>{last_name}</td>
                        <td>{first_name}</td>
                        <td>{middle_initial}</td>
                        <td>{course}</td>
                        <td>{academic_year}</td>
                        <td>{semester}</td>
                        <td>{GWA}</td>
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
