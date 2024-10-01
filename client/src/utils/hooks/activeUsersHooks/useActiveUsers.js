// hooks/useActiveUsers.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useActiveUsers() {
  const [activeUsers, setActiveUsers] = useState({
    students: [],
    facultyStaff: [],
    collegeStaff: [],
    admins: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/all-users'); // Adjust endpoint as needed
        setActiveUsers(response.data);
        // Show success toast if users are loaded
        toast.info("👥 Active users loaded successfully! 🎉");
      } catch (err) {
        // Show error toast with message
        toast.error("🚨 Error fetching active users: " + err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { activeUsers, loading, error };
}
