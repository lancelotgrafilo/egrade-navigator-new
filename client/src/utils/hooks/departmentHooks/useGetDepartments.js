import { useState, useEffect } from 'react';
import axios from 'axios';

const useGetDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/departments');
        setDepartments(response.data);
      } catch (error) {
        setError('Error fetching departments');
      }
    };

    fetchDepartments();
  }, []);

  return { departments, error };
};

export default useGetDepartments;
