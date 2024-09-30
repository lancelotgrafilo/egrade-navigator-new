// hooks/useUpdateStudentSubjects.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useUpdateStudentSubjects = (userId, matchedStudents) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateSubjects = async () => {
      try {
        // Ensure matchedStudents is an array
        if (!Array.isArray(matchedStudents)) {
          throw new Error('matchedStudents is not an array');
        }

        // Convert matchedStudents to the required subjects format
        const newSubjects = matchedStudents.map((student) => ({
          subject_code: student.subject.subject_code || "N/A",
          subject_title: student.subject.subject_title || "N/A",
          instructor: `${student.faculty.first_name || "N/A"} ${student.faculty.last_name || "N/A"}`,
          semester: student.subject.semester || "N/A",
          academic_year: student.subject.academic_year || "N/A",
          midterm_grade: String(student.midterm_grade || "0"),
          finalterm_grade: String(student.finalterm_grade || "0"),
          FINAL_GRADE: String(student.FINAL_GRADE || "0"),
        }));

        // Fetch the existing student document
        const { data: student } = await axios.get(`/api/students-subjects/${userId}`);
        const existingGrades = student.grades || [];

        // Filter newSubjects to only include unique entries based on academic year and semester
        const uniqueSubjects = newSubjects.filter(newSubject => {
          return !existingGrades.some(existingGrade => 
            existingGrade.academic_year === newSubject.academic_year &&
            existingGrade.semester === newSubject.semester &&
            existingGrade.subjects.some(existingSubject => 
              existingSubject.subject_code === newSubject.subject_code
            )
          );
        });

        if (uniqueSubjects.length > 0) {
          // Add only unique new subjects
          await axios.post(`/api/students/${userId}/add-subjects`, { subjects: uniqueSubjects });
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (matchedStudents && matchedStudents.length > 0) {
      updateSubjects();
    }
  }, [userId, matchedStudents]);

  return { loading, error };
};

export default useUpdateStudentSubjects;
