// hooks/useSemester.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useSemester = () => {
  const [semesters, setSemester] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/semesters');
        setSemester(response.data);
      } catch (error) {
        setError('Failed to fetch semesters');
      } finally {
        setLoading(false);
      }
    };

    fetchSemester();
  }, []);

  return { semesters, loading, error };
};

export default useSemester;

