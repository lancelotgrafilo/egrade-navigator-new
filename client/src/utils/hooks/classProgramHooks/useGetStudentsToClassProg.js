import { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

const useGetStudentToClassProg = (searchQuery) => {
  const [students, setStudents] = useState([]);
  const [originalStudent, setOriginalStudent] = useState([]);
  const [errorStudent, setErrorStudent]= useState("");

  useEffect(() => {
    const fetchStudent = async () => {

      try {
        const response = await axios.get('/api/get_student_to_class_prog', {
          params: { search: searchQuery },
        })

        setStudents(response.data);
        if(searchQuery === ""){
          setOriginalStudent(response.data);
        }
      } catch (error) {
        toast.error("Error fetching Student Staffs", error.message);
        setErrorStudent(error);
      }
    };
    fetchStudent();
  },[searchQuery])
  return { students, originalStudent, errorStudent};
};

export default useGetStudentToClassProg;