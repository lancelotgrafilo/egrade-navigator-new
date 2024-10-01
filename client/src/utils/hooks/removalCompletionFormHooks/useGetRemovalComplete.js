import { useState, useEffect } from 'react';
import axios from 'axios';

const useGetRemovalComplete = () => {
  const [removalCompleteData, setRemovalCompleteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRemovalCompleteData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://egrade-backend.onrender.com/api/removal-completion'); // Adjust URL as needed
        setRemovalCompleteData(response.data);
      } catch (err) {
        setError('Failed to fetch removal completion data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRemovalCompleteData();
  }, []);

  return { removalCompleteData, loading, error };
};

export default useGetRemovalComplete;
