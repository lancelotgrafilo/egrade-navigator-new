// src/utils/hooks/useDeleteClassProgram.js

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeleteSubject = () => {
  const [loadingDelete, setLoading] = useState(false);
  const [errorDelete, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const deleteSubject = useCallback(async (id) => {
    setLoading(true);
    try {
      await delay(500);
      await axios.delete(`/api/del_subject/${id}`);
      toast.success('Subject deleted successfully');
    } catch (err) {
      console.error('Error deleting subject:', err);
      toast.error('Failed to delete subject');
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteSubject,
    loadingDelete,
    errorDelete,
  };
};

export default useDeleteSubject;
