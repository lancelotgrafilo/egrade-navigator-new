import { useState, useEffect } from 'react';
import axios from 'axios';

const usePostSections = () => {
  const [section, setSections] = useState([]);
  const [isLoadingSections, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch sections
  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/sections'); // Adjust the endpoint as needed
      setSections(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new section
  const addSection = async (section) => {
    if (!section) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/sections', { section }); // Adjust the endpoint as needed
      setSections((prevSections) => [...prevSections, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sections when the component mounts
  useEffect(() => {
    fetchSections();
  }, []);

  return { section, isLoadingSections, error, addSection };
};

export default usePostSections;
