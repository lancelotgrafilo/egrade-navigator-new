// utils/hooks/useAnnouncements.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch announcements when component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, refetch: fetchAnnouncements };
}
