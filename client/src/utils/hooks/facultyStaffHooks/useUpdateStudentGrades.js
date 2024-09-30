import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useUpdateStudentGrades = (instructorId, studentId, midtermGrade, finalGrade, refetch) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateGrades = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const response = await axios.post('/api/post_update_final_grade', { // Updated URL
        instructorId,
        studentId,
        midtermGrade,
        finalGrade,
      });
  
      if (response.status === 200) {
        setSuccess(true);
        toast.success("Grades updated successfully!");
        if (refetch) {
          await refetch(); // Refetch data after successful update
        }
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, updateGrades };
};

export default useUpdateStudentGrades;
