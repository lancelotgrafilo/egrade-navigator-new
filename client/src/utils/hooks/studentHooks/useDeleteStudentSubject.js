import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeleteStudentSubject = () => {
  const [loadingDelete, setLoading] = useState(false);
  const [errorDelete, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteStudentSubject = useCallback(async (id) => {
    setLoading(true);
    
    console.log(`Attempting to delete Student's Subject with ID: ${id}`);
    try {
      await delay(500);
      const response = await axios.delete(`https://egrade-backend.onrender.com/api/del_student_subject/${id}`);
      console.log(`Response: ${response.status}`); // Log the response status
      toast.success("Student's Subject deleted successfully");
    } catch (err) {
      console.error("Error deleting Student's Subject:", err);
      toast.error("Failed to delete Student's Subject");
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteStudentSubject,
    loadingDelete,
    errorDelete,
  };
};

export default useDeleteStudentSubject;
