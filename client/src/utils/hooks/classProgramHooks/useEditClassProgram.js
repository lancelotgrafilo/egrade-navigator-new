import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useEditClassProgram = () => {
  const [loadingEdit, setLoading] = useState(false);
  const [errorEdit, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const updateClassProgram = useCallback(async (id, updatedData) => {
    setLoading(true);
    try {
      await delay(500);
      const response = await axios.put(`/api/update_class_program/${id}`, updatedData);
      toast.success('Class program updated successfully');
      console.log('Updated class program:', response.data);
    } catch (err) {
      console.error('Error updating class program:', err);
      toast.error('Failed to update class program');
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  

  return {
    updateClassProgram,
    loadingEdit,
    errorEdit,
  };
};

export default useEditClassProgram;
