import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchSubjects = (searchQuery) => {
  const [subjects, setSubjects] = useState([]);
  const [originalSubjects, setOriginalSubjects] = useState([]);
  const [errorSubject, setErrorSubject] = useState(null);
  const [loadingSubject, setLoading] = useState(false); // New loadingSubject state

  const fetchSubjects = useCallback(async () => {
    setLoading(true); // Set loadingSubject to true before fetching
    try {
      const response = await axios.get('/api/get_subjects', {
        params: { search: searchQuery },
      });

      setSubjects(response.data);
      if (searchQuery === '') {
        setOriginalSubjects(response.data);
      }

      // Info toast indicating that data is loaded
      if (response.data.length > 0) {
        toast.info("📚 Subjects loaded successfully! 🎉");
      } else {
        toast.info("🔍 No subjects found.");
      }
    } catch (error) {
      console.error('Error fetching subjects:', error.response || error);
      toast.error('🚨 Error fetching subjects: ' + (error.response?.data?.message || error.message));
      setErrorSubject(error);
    } finally {
      setLoading(false); // Set loadingSubject to false after the fetch
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return { subjects, originalSubjects, errorSubject, loadingSubject, refetch: fetchSubjects }; // Include loadingSubject in return
};

export default useFetchSubjects;
