import { useState, useEffect } from 'react';
import axios from 'axios';

const useGetColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/colleges');
        setColleges(response.data);
      } catch (error) {
        setError('Error fetching colleges');
      }
    };

    fetchColleges();
  }, []);

  return { colleges, error };
};

export default useGetColleges;
