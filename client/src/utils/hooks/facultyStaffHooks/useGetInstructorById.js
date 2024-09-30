import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useGetInstructorById = (facultyID) => {
  const [instructor, setInstructor] = useState(null);
  const [errorInstructor, setErrorInstructor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch instructor data by ID
  const fetchInstructorById = useCallback(async () => {
    if (facultyID !== null) { // Only fetch if the ID is set
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`/api/get_faculty_staff/${facultyID}`);
        setInstructor(response.data);
        setErrorInstructor(null); // Clear any previous errors
      } catch (error) {
        setErrorInstructor(error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
  }, [facultyID]);

  // Fetch data when the ID changes
  useEffect(() => {
    fetchInstructorById();
  }, [fetchInstructorById]);

  // Refetch function to manually trigger data fetching
  const refetchInstructor = () => {
    fetchInstructorById();
  };

  return { instructor, loading, errorInstructor, refetchInstructor };
};

export default useGetInstructorById;
