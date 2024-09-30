// hooks/useGetFiles.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useGetFiles() {
  const [files, setFiles] = useState({ gradeSheets: [], removalForms: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNotified, setHasNotified] = useState(false); // State to track notification

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('/api/files');
        setFiles(response.data);
        // Set hasNotified to true after files are successfully fetched
        setHasNotified(true);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Show toast notification once the files are successfully loaded
  useEffect(() => {
    if (hasNotified && files.gradeSheets.length > 0 && files.removalForms.length > 0) {
      toast.info("📂 Files loaded successfully!");
    }
  }, [files, hasNotified]);

  return { files, loading, error };
}
