// hooks/useCurriculumEffectiveYear.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useCurriculumEffectiveYear = () => {
  const [curriculumEffectiveYear, setSemester] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/curriculum_effective_year');
        setSemester(response.data);
      } catch (error) {
        setError('Failed to fetch curriculum Effective Year');
      } finally {
        setLoading(false);
      }
    };

    fetchSemester();
  }, []);

  return { curriculumEffectiveYear, loading, error };
};

export default useCurriculumEffectiveYear;

