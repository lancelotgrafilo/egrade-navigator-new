import { useState } from 'react';
import axios from 'axios';

const useUploadGradeSheet = (instructorId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const uploadGradeSheet = async (file, last_name, onSuccess) => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('instructorId', instructorId);
    formData.append('last_name', last_name);

    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/post_upload_gradeSheet', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        onSuccess(response.data);
      }
    } catch (err) {
      // Log the error for debugging
      console.error('Error uploading grade sheet:', err.response ? err.response.data : err.message);

      // Throw the error to be caught in handleSubmit
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadGradeSheet, loading, error };
};

export default useUploadGradeSheet;
