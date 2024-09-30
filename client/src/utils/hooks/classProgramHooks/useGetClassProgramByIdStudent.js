import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const useGetClassProgramByIdStudent = (classProgramId) => {
  const [classProgramStudents, setClassProgramStudents] = useState(null);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0); // State to trigger refetch

  const fetchClassProgramById = useCallback(async () => {
    if (classProgramId) { // Only fetch if the ID is set
      try {
        const response = await axios.get(`/api/get_class_program_students/${classProgramId}`);
        setClassProgramStudents(response.data);
        setError(null); // Clear error if fetch is successful
      } catch (error) {
        setError(error);
      }
    }
  }, [classProgramId]);

  // Effect to fetch data on classProgramId or refetchTrigger change
  useEffect(() => {
    fetchClassProgramById();
  }, [classProgramId, refetchTrigger, fetchClassProgramById]);

  // Refetch function
  const refetch = () => {
    setRefetchTrigger(prev => prev + 1); // Increment to trigger useEffect
  };

  return { classProgramStudents, error, refetch };
};

export default useGetClassProgramByIdStudent;
