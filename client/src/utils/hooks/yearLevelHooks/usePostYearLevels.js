import { useState, useEffect } from 'react';
import axios from 'axios';

const usePostYearLevels = () => {
  const [yearLevel, setYearLevels] = useState([]);
  const [isLoadingYL, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch year levels
  const fetchYearLevels = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/year-levels'); // Adjust the endpoint as needed
      setYearLevels(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new year level
  const addYearLevel = async (yearLevel) => {
    if (!yearLevel) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/year-levels', { yearLevel }); // Adjust the endpoint as needed
      setYearLevels((prevLevels) => [...prevLevels, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch year levels when the component mounts
  useEffect(() => {
    fetchYearLevels();
  }, []);

  return { yearLevel, isLoadingYL, error, addYearLevel };
};

export default usePostYearLevels;
