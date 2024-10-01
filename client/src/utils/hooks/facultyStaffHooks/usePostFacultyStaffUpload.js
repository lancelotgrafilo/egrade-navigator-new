import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const usePostFacultyStaffUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    // console.log( 'formData: ', formData);
    try {
      await delay(100);
      setError(null);
      const response = await axios.post('https://egrade-backend.onrender.com/api/post_faculty_staff_upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // console.log('Upload response:', response.data); // Log the response
      toast.success('File uploaded successfully!');
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Upload error:', err); // Log the error
      toast.error('Failed to upload file. Please try again.');
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { uploadFile, loading, error };
};

export default usePostFacultyStaffUpload;
