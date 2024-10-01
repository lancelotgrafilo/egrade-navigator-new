import { useState } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify'
const useUploadRemovalCompletionForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const uploadRemovalCompletionForm = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/post-upload-removal-completion-form', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(response.data.message);
      toast.success("Successful");
    } catch (error) {
      toast.error(error);
      setError(error.response?.data?.message || 'Failed to upload form');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    uploadRemovalCompletionForm,
  };
};

export default useUploadRemovalCompletionForm;
