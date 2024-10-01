import { useState } from 'react';
import axios from 'axios';

const useUpdateCollegeStaffDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const updateCollegeStaffDetails = async (userId, formData) => {
    try {
      setLoading(true);
      await delay(100);
      setError(null);

      const response = await axios.put(`https://egrade-backend.onrender.com/api/college-staff-details/${userId}`, formData, {
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

  return { updateCollegeStaffDetails, loading, error };
};

export default useUpdateCollegeStaffDetails;
