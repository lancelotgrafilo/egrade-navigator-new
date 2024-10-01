import { useState } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

const useUploadSubjectCSV = () => {
  const [uploading, setLoading] = useState(false);
  const [errorUpload, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadCSV = async (file) => {
    
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await delay(500);
      const response = await axios.post('https://egrade-backend.onrender.com/api/post_upload_subjects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccess(true);
        toast.success("Successfully Added New Subject");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload the file.');
      toast.error('Failed to upload the file.', err);
    } finally {
      setLoading(false);
    }
  };

  return { uploadCSV, uploading, errorUpload, success };
};

export default useUploadSubjectCSV;
