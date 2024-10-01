// hooks/useSections.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/sections');
        setSections(response.data);
      } catch (error) {
        setError('Failed to fetch sections');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  return { sections, loading, error };
};

export default useSections;

