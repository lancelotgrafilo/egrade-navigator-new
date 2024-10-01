// hooks/useActivityLogs.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/activity-logs');
        setLogs(response.data);
        // Show success toast if logs are loaded
        toast.info("📜 Activity logs loaded successfully! 🎉");
      } catch (err) {
        // Show error toast with message
        toast.error("🚨 Error fetching activity logs: " + err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return { logs, loading, error };
}
