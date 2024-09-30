import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useGetClassProgramById = (classProgramId) => {
  const [classProgramInstructor, setClassProgramInstructor] = useState(null);
  const [errorInstructor, setErrorInstructor] = useState(null);

  // Function to fetch class program data by ID
  const fetchClassProgramById = useCallback(async () => {
    if (classProgramId !== null) { // Only fetch if the ID is set
      try {
        const response = await axios.get(`/api/get_class_program_instructor/${classProgramId}`);
        setClassProgramInstructor(response.data);
      } catch (error) {
        setErrorInstructor(error);
      }
    }
  }, [classProgramId]);

  // Fetch data when the ID changes
  useEffect(() => {
    fetchClassProgramById();
  }, [fetchClassProgramById]);

  // Refetch function to manually trigger data fetching
  const refetchClassProgram = () => {
    fetchClassProgramById();
  };

  return { classProgramInstructor, errorInstructor, refetchClassProgram };
};

export default useGetClassProgramById;
