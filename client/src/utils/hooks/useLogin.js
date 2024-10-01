import { useState } from 'react';
import axios from '../../axiosConfig';

const useLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  
  const login = async (data, navigate) => {
    setLoading(true);
    setError("");

    try {
      
      const url = `https://egrade-backend.onrender.com/api/login`;
      const response = await axios.post(url, data);
      const { token, title } = response.data;
      
      if (token && title ) {
        // Store token and title in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ title }));
        

        // Re-check that the token and title have been saved correctly
        const savedToken = localStorage.getItem("token");
        const savedUser = JSON.parse(localStorage.getItem("user"));
        
        if (savedToken && savedUser?.title === title) {
          // Navigate based on user title
          switch (title) {
            case 'admin':
              navigate('/admin');
              break;
            case 'student':
              navigate('/student');
              break;
            case 'faculty_staff':
              navigate('/facultyStaff');
              break;
            case 'college_staff':
              navigate('/collegeStaff');
              break;
            case 'registrar_staff':
              navigate('/registrarStaff');
              break;
            default:
              setError("Invalid user title");
              console.log("Invalid title:", title); // Debugging line
          }
        } else {
          setError("Failed to save user data correctly");
          
        }
      } else {
        console.log('Missing token or title:', { token, title });
        setError("Login response does not contain token or title");
      }
    } catch (error) {
      console.error("Login error:", error); // Log for debugging purposes
      if (error.response) {
        if (error.response.status >= 400 && error.response.status <= 500) {
          setError(error.response.data.message || "An error occurred");
        } else {
          setError("An unexpected error occurred");
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
};

export default useLogin;
