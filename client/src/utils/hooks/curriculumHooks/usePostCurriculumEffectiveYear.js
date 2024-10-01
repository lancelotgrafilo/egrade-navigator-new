import { useState, useEffect } from 'react';
import axios from 'axios';

const usePostCurriculumEffectiveYear = () => {
  const [curriculum_effective_year, setCurriculum] = useState([]);
  const [isLoadingCurriculum, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch curriculum_effective_years
  const fetchCurriculums = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/curriculum_effective_year'); // Adjust the endpoint as needed
      setCurriculum(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new curriculum_effective_year
  const addCurriculum = async (curriculumYear) => {
    if (!curriculumYear) return;

    setIsLoading(true);
    try {
        // Pass the curriculum year directly as a string in the request body
        const response = await axios.post('https://egrade-backend.onrender.com/api/curriculum_effective_year', { curriculum_effective_year: curriculumYear });
        setCurriculum((prevCurriculums) => [...prevCurriculums, response.data]);
    } catch (err) {
        setError(err);
        console.error('Error adding curriculum:', err.response ? err.response.data : err);
    } finally {
        setIsLoading(false);
    }
  };






  
  

  // Fetch curriculum_effective_year when the component mounts
  useEffect(() => {
    fetchCurriculums();
  }, []);

  return { curriculum_effective_year, isLoadingCurriculum, error, addCurriculum };
};

export default usePostCurriculumEffectiveYear;
