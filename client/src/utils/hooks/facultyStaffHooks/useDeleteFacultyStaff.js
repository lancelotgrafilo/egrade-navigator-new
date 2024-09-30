// src/utils/hooks/useDeleteFacultyStaff.js

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeleteFacultyStaff = () => {
  const [loadingDelete, setLoading] = useState(false);
  const [errorDelete, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteFacultyStaff = useCallback(async (id) => {
    setLoading(true);
    try {
      await delay(500);
      await axios.delete(`/api/del_faculty_staff/${id}`);
      toast.success('Faculty Staff deleted successfully');
    } catch (err) {
      console.error('Error deleting Faculty Staff:', err);
      toast.error('Failed to delete Faculty Staff');
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteFacultyStaff,
    loadingDelete,
    errorDelete,
  };
};

export default useDeleteFacultyStaff;
