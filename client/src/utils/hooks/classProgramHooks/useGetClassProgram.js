import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchClassProgram = (searchQuery) => {
  const [classPrograms, setClassPrograms] = useState([]);
  const [originalClassProgram, setOriginalClassProgram] = useState([]);
  const [errorClassProgram, setErrorClassProgram] = useState(null);
  const [classProgramLoading, setClassProgramLoading] = useState(false); // New loading state

  const fetchClassProgram = useCallback(async () => {
    setClassProgramLoading(true); // Set loading to true before the fetch
    try {
      const response = await axios.get('/api/get_class_program', {
        params: { search: searchQuery },
      });
      setClassPrograms(response.data);
      if (searchQuery === "") {
        setOriginalClassProgram(response.data);
      }

      // More appealing info toast message
      toast.info("📚 Class programs loaded successfully! 🎉");
    } catch (error) {
      toast.error('🚨 Error fetching class program: ' + error.message);
      setErrorClassProgram(error);
    } finally {
      setClassProgramLoading(false); // Set loading to false after the fetch
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchClassProgram();
  }, [fetchClassProgram]);

  return { classPrograms, originalClassProgram, errorClassProgram, classProgramLoading, refetch: fetchClassProgram }; // Include loading in return
};

export default useFetchClassProgram;
