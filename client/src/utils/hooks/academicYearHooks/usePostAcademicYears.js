import { useState, useEffect } from 'react';
import axios from 'axios';

const usePostAcademicYears = () => {
  const [academicYear, setAcademicYears] = useState([]);
  const [isLoadingAY, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch academic years
  const fetchAcademicYears = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/academic-years'); // Adjust the endpoint as needed
      setAcademicYears(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new academic year
  const addAcademicYear = async (academicYear) => {
    if (!academicYear) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/academic-years', { ay: academicYear }); // Adjust the endpoint as needed
      setAcademicYears((prevYears) => [...prevYears, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch academic years when the component mounts
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  return { academicYear, isLoadingAY, error, addAcademicYear };
};

export default usePostAcademicYears;
