import { useState } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

const useUploadFileStudentsToClassProgram = (classProgramId) => {
  const [uploading, setLoading] = useState(false);
  const [errorUpload, setError] = useState(null);
  const [data, setData] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadStudents = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await delay(500);
      setError(null);

      const response = await axios.post(
        `https://egrade-backend.onrender.com/api/upload_students/${classProgramId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('File uploaded successfully!');
      setData(response.data);
    } catch (error) {
      setError(error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  return { uploadStudents, uploading, errorUpload, data };
};

export default useUploadFileStudentsToClassProgram;
