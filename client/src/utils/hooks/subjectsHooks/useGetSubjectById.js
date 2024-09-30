import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useGetSubjectById = (subjectId) => {
  const [subjectById, setSubjectById] = useState(null);
  const [errorSubjectById, setErrorSubjectById] = useState(null);

  // Function to fetch class program data by ID
  const fetchClassProgramById = useCallback(async () => {
    if (subjectId !== null) { // Only fetch if the ID is set
      try {
        const response = await axios.get(`/api/get_subject/${subjectId}`);
        setSubjectById(response.data);
      } catch (error) {
        setErrorSubjectById(error);
      }
    }
  }, [subjectId]);

  // Fetch data when the ID changes
  useEffect(() => {
    fetchClassProgramById();
  }, [fetchClassProgramById]);

  // Refetch function to manually trigger data fetching
  const refetchClassProgram = () => {
    fetchClassProgramById();
  };

  return { subjectById, errorSubjectById, refetchClassProgram };
};

export default useGetSubjectById;
