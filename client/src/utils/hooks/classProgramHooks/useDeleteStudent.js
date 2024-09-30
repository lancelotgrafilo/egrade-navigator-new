import { useState, useCallback } from 'react';
import axios from 'axios';

const useDeleteStudent = (classProgramId) => {
  const [isLoadingDeleteStudent, setIsLoading] = useState(false);
  const [errorDeleteStudent, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteStudent = useCallback(async (schoolId) => {
    setIsLoading(true);
    setError(null);
  
    // console.log(`Deleting student with ID: ${schoolId}`);
    
    try {
      await delay(500); // Simulate delay
      const response = await axios.delete(`/api/del_class_program_student/${classProgramId}/${schoolId}`);
      // console.log('Delete response:', response.data);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Delete error:', err);
      setIsLoading(false);
      setError(err.message || 'Failed to delete student');
      return null;
    }
  }, [classProgramId]);
  

  return { deleteStudent, isLoadingDeleteStudent, errorDeleteStudent };
};

export default useDeleteStudent;
