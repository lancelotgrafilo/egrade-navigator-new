// src/utils/hooks/useDeleteClassProgram.js

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeleteClassProgram = () => {
  const [loadingDelete, setLoading] = useState(false);
  const [errorDelete, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteClassProgram = useCallback(async (id) => {
    setLoading(true);
    try {
      await delay(500);
      await axios.delete(`https://egrade-backend.onrender.com/api/del_class_program/${id}`);
      toast.success('Class program deleted successfully');
    } catch (err) {
      console.error('Error deleting class program:', err);
      toast.error('Failed to delete class program');
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteClassProgram,
    loadingDelete,
    errorDelete,
  };
};

export default useDeleteClassProgram;
