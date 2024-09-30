import { useState } from 'react';
import axios from 'axios';

const useUpdateAdminDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const updateAdminDetails = async (userId, formData) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate network delay
      await delay(100);

      const response = await axios.put(`/api/admin-details/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err; // Ensure errors are propagated correctly
    }
  };

  return { updateAdminDetails, loading, error };
};

export default useUpdateAdminDetails;
