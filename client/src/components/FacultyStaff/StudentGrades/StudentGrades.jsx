import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styleStudentGrades from './studentGrades.module.css';
import backArrow from '../../../assets/icons/back.png';
import useGetFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';
import useUpdateStudentGrades from '../../../utils/hooks/facultyStaffHooks/useUpdateStudentGrades';
import {jwtDecode} from 'jwt-decode';
import useGetRemovalComplete from '../../../utils/hooks/removalCompletionFormHooks/useGetRemovalComplete';

export function StudentGrades() {
  const location = useLocation();

  const navigate = useNavigate();
  const { instructorId, studentId, subjectId } = useParams();

  const [midtermGrade, setMidtermGrade] = useState('');
  const [finalGrade, setFinalGrade] = useState('');
  const [finalGradeAverage, setFinalGradeAverage] = useState('');

  const { subjectTitle, subjectCode } = location.state || {};

  const handleBackClick = () => {
    navigate('/facultyStaff/students');
  };

  const token = localStorage.getItem('token');
  let userId = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { userDetails, refetch } = useGetFacultyDetails(userId);
  const subject = userDetails?.load.find(subj => subj._id === subjectId);
  const student = subject?.students.find(stud => stud._id === studentId);

  const { removalCompleteData, error: removalCompleteError } = useGetRemovalComplete();
  const [ratingObtained, setRatingObtained] = useState('');
  const [removalComplete, setRemovalComplete] = useState(false);

  useEffect(() => {
    if (student) {
      setMidtermGrade(student.midterm_grade || '');
      setFinalGrade(student.finalterm_grade || '');
      setFinalGradeAverage(student.FINAL_GRADE || '');
      setRatingObtained(student.FINAL_GRADE || ''); 
    }
  }, [student]);

  useEffect(() => {
    if (removalCompleteData) {
      const studentRemovalStatus = removalCompleteData.find((data) => data.last_name === student?.last_name);
      setRemovalComplete(!!studentRemovalStatus);
      if (studentRemovalStatus) {
        setRatingObtained(studentRemovalStatus.rating_obtained);
      }
    }
  }, [removalCompleteData, student]);

  const fetchStudentData = async () => {
    await refetch();
  };

  const { loading, error, updateGrades } = useUpdateStudentGrades(
    instructorId, 
    studentId, 
    midtermGrade, 
    finalGrade,
    fetchStudentData
  );

  const handleGradeChange = () => {
    updateGrades();
  };

  return (
    <div className={styleStudentGrades.mainContainer}>
      <div className={styleStudentGrades.dashboardContent}>
        <div className={styleStudentGrades.searchBarContainer}>
          <div className={styleStudentGrades.searchBar}>
            <button onClick={handleBackClick} className={styleStudentGrades.backBtn}>
              <img src={backArrow} className={styleStudentGrades.backArrow} alt="Back" />
            </button>
          </div>
        </div>

        <div className={styleStudentGrades.studentLabel}>
          Grades for Subject: {subjectCode} {subjectTitle} 
        </div>

        <div className={styleStudentGrades.tableContainer}>
          {student ? (
            <div>
              <table className={styleStudentGrades.classInfoTable}>
                <thead>
                  <tr>
                    <th>Last Name</th>
                    <th>First Name</th>
                    <th>Middle Initial</th>
                    <th>Midterm</th>
                    <th>Final</th>
                    <th>FINAL GRADE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={student._id}>
                    <td>{student.last_name}</td>
                    <td>{student.first_name}</td>
                    <td>{student.middle_initial}</td>
                    <td className={parseFloat(midtermGrade) > 3.0 ? styleStudentGrades.lowGrade : ''}>
                      {midtermGrade}
                    </td>
                    <td className={parseFloat(finalGrade) > 3.0 ? styleStudentGrades.lowGrade : ''}>
                      {finalGrade}
                    </td>
                    <td className={parseFloat(finalGradeAverage) > 3.0 || parseFloat(ratingObtained) > 3.0 ? styleStudentGrades.lowGrade : ''}>
                      {removalComplete ? (
                        <>
                          {finalGradeAverage} / {ratingObtained}
                        </>
                      ) : (
                        finalGradeAverage
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className={styleStudentGrades.gradeCard}>
                <h3>Update Grades</h3>
                <div className={styleStudentGrades.gradeInputs}>
                  <label>
                    Midterm Grade:
                    <input
                      type="number"
                      step="0.01"
                      value={midtermGrade}
                      onChange={(e) => setMidtermGrade(e.target.value)}
                    />
                  </label>
                  <label>
                    Final Grade:
                    <input
                      type="number"
                      step="0.01"
                      value={finalGrade}
                      onChange={(e) => setFinalGrade(e.target.value)}
                    />
                  </label>
                </div>
                <button onClick={handleGradeChange} className={styleStudentGrades.submitBtn} disabled={loading}>
                  Submit Changes
                </button>
                {error && <p>Error: {error}</p>}
                {removalCompleteError && <p>Error fetching removal complete status: {removalCompleteError}</p>}
              </div>
            </div>
          ) : (
            <p>No student found with the provided ID.</p>
          )}
        </div>
      </div>
    </div>
  );
}
