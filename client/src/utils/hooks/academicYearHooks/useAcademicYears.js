// hooks/useAcademicYears.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useAcademicYears = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get('/api/academic-years');
        setAcademicYears(response.data);
      } catch (error) {
        setError('Failed to fetch academic years');
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  return { academicYears, loading, error };
};

export default useAcademicYears;
