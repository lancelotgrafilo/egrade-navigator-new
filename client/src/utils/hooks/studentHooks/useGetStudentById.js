import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useGetStudentById = (schoolID) => {
  const [studentById, setStudentById] = useState(null);
  const [errorStudentById, setErrorStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch student data by ID
  const fetchStudentById = useCallback(async () => {
    if (schoolID !== null) { // Only fetch if the ID is set
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`https://egrade-backend.onrender.com/api/get_students/${schoolID}`);
        setStudentById(response.data);
        setErrorStudent(null); // Clear any previous errors
      } catch (error) {
        setErrorStudent(error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
  }, [schoolID]);

  // Fetch data when the ID changes
  useEffect(() => {
    fetchStudentById();
  }, [fetchStudentById]);

  // Refetch function to manually trigger data fetching
  const refetch = () => {
    fetchStudentById();
  };

  return { studentById, loading, errorStudentById, refetch };
};

export default useGetStudentById;
