import { useState } from 'react';
import axios from 'axios';
import {toast} from "react-toastify";

export function useSubmitAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const submitAnnouncement = async (announcementType, message, dueDate, instructorID) => {
    
    setError(null);

    try {
      setLoading(true);
      await delay(500);
      const response = await axios.post('https://egrade-backend.onrender.com/api/announcements', { announcementType, message, dueDate, instructorID });
      toast.success("Announcement is Successfully Sent");
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response ? err.response.data.message : 'Error submitting announcement');
      toast.error(err);
      throw err;
    }
  };

  return { submitAnnouncement, loading, error };
}
