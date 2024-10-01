import { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

const useGetFacultyToClassProg = (searchQuery) => {
  const [faculty, setFaculty] = useState([]);
  const [originalFaculty, setOriginalFaculty] = useState([]);
  const [errorFaculty, setErrorFaculty]= useState("");

  useEffect(() => {
    const fetchFaculty = async () => {

      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/get_faculty_to_class_prog', {
          params: { search: searchQuery },
        })

        setFaculty(response.data);
        if(searchQuery === ""){
          setOriginalFaculty(response.data);
        }
      } catch (error) {
        toast.error("Error fetching Faculty Staffs", error.message);
        setErrorFaculty(error);
      }
    };
    fetchFaculty();
  },[searchQuery])
  return { faculty, originalFaculty, errorFaculty};
};

export default useGetFacultyToClassProg;