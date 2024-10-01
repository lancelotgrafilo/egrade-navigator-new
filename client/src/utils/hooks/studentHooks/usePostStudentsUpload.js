import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const usePostStudentsUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    console.log('formData:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    setLoading(true);
    setError(null); // Clear previous error before starting a new upload
    try {
      await delay(500); // Simulated delay
      const response = await axios.post('https://egrade-backend.onrender.com/api/post_student_upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('File uploaded successfully!');
      return response.data; // Returning the response data for further use
    } catch (err) {
      console.error('Upload error:', err); // Log the error
      toast.error('Failed to upload file. Please try again.');
      setError(err); // Set the error state
      throw err; // Re-throw the error to allow the caller to handle it
    } finally {
      setLoading(false); // Always stop loading, whether success or failure
    }
  };
  

  return { uploadFile, loading, error };
};

export default usePostStudentsUpload;
