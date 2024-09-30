import { useState, useCallback } from 'react';
import axios from 'axios';

const useDeleteInstructor = (classProgramId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteInstructor = useCallback(async (instructorId) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(3000);
      const response = await axios.delete(`/api/del_class_program_instructor/${classProgramId}/${instructorId}`);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to delete instructor');
      return null;
    } 
  }, [classProgramId]);

  return { deleteInstructor, isLoading, error };
};

export default useDeleteInstructor;
