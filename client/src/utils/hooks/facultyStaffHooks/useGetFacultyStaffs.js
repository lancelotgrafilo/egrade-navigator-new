import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchFacultyStaffs = (searchQuery) => {
  const [faculty, setFaculty] = useState([]);
  const [originalFaculty, setOriginalFaculty] = useState([]);
  const [errorFaculty, setErrorFaculty] = useState("");
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [hasNotified, setHasNotified] = useState(false); // State to track if the notification has been shown

  const fetchFaculty = useCallback(async () => {
    setFacultyLoading(true);
    try {
      const response = await axios.get('https://egrade-backend.onrender.com/api/get_faculty_staff', {
        params: { search: searchQuery },
      });

      setFaculty(response.data);
      if (searchQuery === "") {
        setOriginalFaculty(response.data);
      }

      // Show toast.info once data is loaded
      if (!hasNotified) {
        toast.info("👨‍🏫 Faculty Staff data loaded successfully! 🎉");
        setHasNotified(true); // Update the state to prevent future notifications
      }
    } catch (error) {
      toast.error("🚨 Error fetching Faculty Staffs: " + error.message);
      setErrorFaculty(error);
    } finally {
      setFacultyLoading(false);
    }
  }, [searchQuery, hasNotified]); // Include hasNotified in the dependencies

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const refetch = () => {
    setHasNotified(false); // Reset notification state for future fetch
    fetchFaculty();
  };

  return { faculty, originalFaculty, errorFaculty, facultyLoading, refetch };
};

export default useFetchFacultyStaffs;
