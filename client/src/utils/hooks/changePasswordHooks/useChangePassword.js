import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {useNavigate} from 'react-router-dom';

const useChangePassword = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ password: '', confirmPassword: '' });
  const [isPasswordLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/change-password', {
        password: data.password,
        email: data.email,
      });
      if (response.data.success) {
        toast.success("Password changed successfully!");
      } else {
        toast.error("Failed to change password.");
      }
      navigate('/login');
    } catch (error) {
      toast.error("An error occurred while changing the password.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    handleChange,
    handleSubmit,
    isPasswordLoading,
  };
};

export default useChangePassword;
