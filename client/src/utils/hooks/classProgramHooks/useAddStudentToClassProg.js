import { useState } from 'react';
import axios from 'axios';

const useAddStudentToClassProg = (classProgramId) => {
  const [isLoadingAddStudent, setIsLoading] = useState(false);
  const [errorAddStudent, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const addStudent = async (studentData) => {
    if (!classProgramId) {
      console.error("Class Program ID is not defined.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      await delay(500);
      const response = await axios.post(`https://egrade-backend.onrender.com/api/post_class_program_students/${classProgramId}/add_student`, studentData);
      setIsLoading(false);
      return response.data; // Return the updated class program
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response ? err.response.data : 'Error adding student';
      console.error("Error adding student:", errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  return { addStudent, isLoadingAddStudent, errorAddStudent };
};

export default useAddStudentToClassProg;
