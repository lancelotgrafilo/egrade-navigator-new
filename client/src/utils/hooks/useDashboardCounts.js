// hooks/useDashboardCounts.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useDashboardCounts = () => {
  const [counts, setCounts] = useState({ subjects: 0, students: 0, instructors: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/dashboard-counts');
        setCounts(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading, error };
};

export default useDashboardCounts;
