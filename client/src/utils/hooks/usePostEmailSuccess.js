import { useState } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

const useEmailSuccess = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmailSuccessLoading, setIsEmailSuccessLoading] = useState(false);

  const sendEmailSuccess = async (data) => {
    setLoading(true);
    setIsEmailSuccessLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/post_send_email_success_msg', data);
      setLoading(false);
      return response.data;
    } catch (err) {
      toast.error(error);
      setLoading(false);
      setError(err.response ? err.response.data : 'Error sending email');
      throw error;
    } finally {
      setIsEmailSuccessLoading(false);
    }
  };

  return { 
    sendEmailSuccess, 
    loading, 
    error,
    isEmailSuccessLoading,
  };
};

export default useEmailSuccess;
