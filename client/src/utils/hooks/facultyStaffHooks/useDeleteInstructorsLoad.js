import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeleteInstructorsLoad = () => {
  const [loadingDelete, setLoading] = useState(false);
  const [errorDelete, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteInstructorsLoad = useCallback(async (id) => {
    setLoading(true);
    console.log(`Attempting to delete Instructor's Load with ID: ${id}`);
    try {
      await delay(500);
      console.log(`Deleting from URL: /api/del_instructors_load/${id}`);
      const response = await axios.delete(`/api/del_instructors_load/${id}`);
      console.log(`Response: ${response.status}`); // Log the response status
      toast.success("Instructor's Load deleted successfully");
    } catch (err) {
      console.error("Error deleting Instructor's Load:", err);
      toast.error("Failed to delete Instructor's Load");
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteInstructorsLoad,
    loadingDelete,
    errorDelete,
  };
};

export default useDeleteInstructorsLoad;
