// hooks/useConfirmStudents.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useConfirmStudents = () => {
  const [confirmStudents, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/confirm-students');
      setStudents(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { confirmStudents, loading, error, refetchConfirm: fetchStudents };
};

export default useConfirmStudents;
