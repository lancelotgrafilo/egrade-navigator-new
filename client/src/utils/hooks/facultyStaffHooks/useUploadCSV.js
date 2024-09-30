import { useState } from 'react';
import axios from 'axios';

const useUploadCSV = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadCSV = async (file, instructorId, loadId) => {
    // Check if file, instructorId, and loadId are provided
    if (!file || !instructorId || !loadId) {
      setError('File, Instructor ID, and Load ID are required.');
      console.warn('Missing file, instructorId, or loadId');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      console.log('Uploading CSV with instructorId:', instructorId, 'and loadId:', loadId);

      // Make a POST request to upload the CSV
      const response = await axios.post(
        `/api/post_instructors_load_upload_students/${instructorId}/load/${loadId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploading(false);
      console.log('Upload successful:', response.data);
      return response.data;
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setUploading(false);
      throw err;
    }
  };

  return { uploadCSV, uploading, error };
};

export default useUploadCSV;
