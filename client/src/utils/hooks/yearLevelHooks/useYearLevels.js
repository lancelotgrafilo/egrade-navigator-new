// hooks/useYearLevels.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useYearLevels = () => {
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchYearLevels = async () => {
      try {
        const response = await axios.get('/api/year-levels');
        setYearLevels(response.data);
      } catch (error) {
        setError('Failed to fetch year levels');
      } finally {
        setLoading(false);
      }
    };

    fetchYearLevels();
  }, []);

  return { yearLevels, loading, error };
};

export default useYearLevels;

