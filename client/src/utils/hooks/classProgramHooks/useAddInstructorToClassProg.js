import { useState } from 'react';
import axios from 'axios';

const useAddInstructorToClassProg = (classProgramId) => {
  const [isLoadingAddInstructor, setIsLoading] = useState(false);
  const [errorAddInstructor, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const addInstructor = async (instructorData) => {
    if (!classProgramId) {
      console.error("Class Program ID is not defined.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      await delay(500);
      const response = await axios.post(`/api/post_class_program_instructor/${classProgramId}/add_instructor`, instructorData);
      setIsLoading(false);
      return response.data; // Return the updated class program
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response ? err.response.data : 'Error adding instructor';
      console.error("Error adding instructor:", errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  return { addInstructor, isLoadingAddInstructor, errorAddInstructor };
};

export default useAddInstructorToClassProg;
