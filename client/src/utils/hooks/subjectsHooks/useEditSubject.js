// useEditSubject.js

import { useState } from 'react';
import axios from 'axios';

const useEditSubject = () => {
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const updateSubject = async (id, updatedData) => {
    setLoadingEdit(true);
    setErrorEdit(null);

    try {
      await delay(500);
      const response = await axios.put(`/api/update_subject/${id}`, updatedData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 200) {
        throw new Error('Failed to update subject');
      }
    } catch (error) {
      setErrorEdit(error.response?.data?.message || 'Failed to update subject');
      throw error;
    } finally {
      setLoadingEdit(false);
    }
  };

  return {
    updateSubject,
    loadingEdit,
    errorEdit,
  };
};

export default useEditSubject;
