import { useState, useEffect } from 'react';
import axios from 'axios';

const useDepartments = () => {
  const [addDepartments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/departments'); // Adjust the endpoint as needed
      setDepartments(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addDepartment = async (departmentName) => {
    if (!departmentName) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/departments', { department: departmentName });
      setDepartments((prevDepartments) => [...prevDepartments, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { addDepartments, isLoading, error, addDepartment };
};

export default useDepartments;
