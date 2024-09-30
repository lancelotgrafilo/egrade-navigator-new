import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeleteStudent = () => {
  const [loadingDelete, setLoading] = useState(false);
  const [errorDelete, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await delay(500);
      const response = await axios.delete(`/api/del_student/${id}`);
      if (response.status === 200) {
        toast.success('Student deleted successfully');
      } else {
        toast.error(`Failed to delete Student: ${response.statusText}`);
        setError(new Error(`Failed with status ${response.status}`));
      }
    } catch (err) {
      console.error('Error deleting Student:', err.response || err);
      toast.error('Failed to delete Student');
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  

  return {
    deleteStudent,
    loadingDelete,
    errorDelete,
  };
};

export default useDeleteStudent;
