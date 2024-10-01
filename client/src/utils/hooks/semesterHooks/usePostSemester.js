import { useState, useEffect } from 'react';
import axios from 'axios';

const usePostSemesters = () => {
  const [semester, setSemesters] = useState([]);
  const [isLoadingSem, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch semesters
  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/semesters'); // Adjust the endpoint as needed
      setSemesters(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new semester
  const addSemester = async (semester) => {
    if (!semester) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/semesters', { semester }); // Adjust the endpoint as needed
      setSemesters((prevSemesters) => [...prevSemesters, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch semesters when the component mounts
  useEffect(() => {
    fetchSemesters();
  }, []);

  return { semester, isLoadingSem, error, addSemester };
};

export default usePostSemesters;
