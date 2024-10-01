// hooks/facultyStaffHooks/useDeleteStudent.js

import { useState } from 'react';
import axios from 'axios';

const useDeleteStudent = () => {
  const [isLoadingDeleteStudent, setIsLoading] = useState(false);
  const [errorDeleteStudent, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const deleteStudent = async (instructorId, loadId, studentId) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(500);
      const response = await axios.delete(`https://egrade-backend.onrender.com/api/post_instructors_load_student/${instructorId}/load/${loadId}/student/${studentId}`);
      setIsLoading(false);
      return response.data; // Return the updated instructor
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response ? err.response.data.message : 'Error deleting student';
      setError(errorMessage);
      return null;
    }
  };

  return { deleteStudent, isLoadingDeleteStudent, errorDeleteStudent };
};

export default useDeleteStudent;
