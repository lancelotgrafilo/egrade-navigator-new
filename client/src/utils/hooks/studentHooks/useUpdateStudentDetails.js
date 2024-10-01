import { useState } from 'react';
import axios from 'axios';

const useUpdateStudentDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const updateStudentDetails = async (userId, formData) => {
    try {
      setLoading(true);
      await delay(500);
      setError(null);

      const response = await axios.put(`https://egrade-backend.onrender.com/api/student-details/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { updateStudentDetails, loading, error };
};

export default useUpdateStudentDetails;
