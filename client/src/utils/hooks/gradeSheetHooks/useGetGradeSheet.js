import { useState, useEffect } from 'react';
import axios from 'axios';

const useGetGradeSheets = (url) => {
  const [gradeSheetData, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://egrade-backend.onrender.com/api/get-grade-sheet'); // Fetch data from the API
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { gradeSheetData, loading, error };
};

export default useGetGradeSheets;
