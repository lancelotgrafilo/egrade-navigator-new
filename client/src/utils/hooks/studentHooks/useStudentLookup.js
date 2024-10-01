import { useState, useEffect } from 'react';
import axios from 'axios';

const useStudentLookup = (last_name, first_name) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`https://egrade-backend.onrender.com/api/student-lookup`, {
          params: {
            lastName: last_name,
            firstName: first_name,
          }
        });
        setStudentDetails(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (last_name && first_name) {
      fetchStudentDetails();
    }
  }, [last_name, first_name]);

  return { studentDetails, loading, error };
};

export default useStudentLookup;
