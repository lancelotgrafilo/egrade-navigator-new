import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchStudents = (searchQuery) => {
  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [errorStudent, setErrorStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false); // State for loading
  const [hasNotified, setHasNotified] = useState(false); // State to track notification

  // Function to fetch students from the backend
  const fetchStudents = useCallback(async () => {
    setStudentLoading(true); // Set loading to true before fetching
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/get_students', {
        params: { search: searchQuery },
      });
      setStudents(response.data);

      // If there's no search query, store the original students list
      if (searchQuery === '') {
        setOriginalStudents(response.data);
      }

      // Set hasNotified to true after students are successfully fetched
      setHasNotified(true);
    } catch (error) {
      // Use toast to display the error message correctly
      toast.error(`🚨 Error fetching students: ${error.message}`);
      setErrorStudent(error);
    } finally {
      setStudentLoading(false); // Set loading to false after fetching
    }
  }, [searchQuery]);

  // Fetch students whenever the component mounts or searchQuery changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Show toast notification once the students are successfully loaded
  useEffect(() => {
    if (hasNotified && students.length > 0) {
      toast.info("👩‍🎓 Students data loaded successfully! 🎉");
    }
  }, [students, hasNotified]);

  // Function to manually refetch the students
  const refetch = useCallback(() => {
    setHasNotified(false); // Reset notification state for future refetch
    fetchStudents();
  }, [fetchStudents]);

  return { students, originalStudents, errorStudent, studentLoading, refetch };
};

export default useFetchStudents;
