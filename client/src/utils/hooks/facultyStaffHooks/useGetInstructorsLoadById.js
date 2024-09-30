import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useGetInstructorsLoadById = (instructorId) => {
  const [instructorsLoad, setInstructorsLoad] = useState(null);
  const [errorInstructorsLoad, setError] = useState(null);
  const [loadingInstructorsLoad, setLoading] = useState(true);

  const fetchInstructorsLoad = useCallback(async () => {
    if (!instructorId) return;

    setLoading(true); // Set loading to true when refetching
    try {
      const response = await axios.get(`/api/get_instructors_load_student/${instructorId}`);
      setInstructorsLoad(response.data.load || []); // Set the load data
      setError(null); // Reset any previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    fetchInstructorsLoad();
  }, [fetchInstructorsLoad]);

  return { instructorsLoad, errorInstructorsLoad, loadingInstructorsLoad, refetch: fetchInstructorsLoad };
};

export default useGetInstructorsLoadById;
