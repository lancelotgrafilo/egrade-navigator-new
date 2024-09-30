import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useGetAllUsers = () => {
  const [users, setUsers] = useState({ admins: [], collegeStaff: [], registrarStaff: [], facultyStaff: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortByLastName = (data) => {
    return {
      admins: data.admins.sort((a, b) => a.last_name.localeCompare(b.last_name)),
      collegeStaff: data.collegeStaff.sort((a, b) => a.last_name.localeCompare(b.last_name)),
      registrarStaff: data.registrarStaff.sort((a, b) => a.last_name.localeCompare(b.last_name)),
      facultyStaff: data.facultyStaff.sort((a, b) => a.last_name.localeCompare(b.last_name)),
    };
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/get_users');
      const sortedUsers = sortByLastName(response.data);
      setUsers(sortedUsers);
      toast.info("👥 User data loaded successfully!");
    } catch (error) {
      setError(error.message || 'Error fetching users');
      toast.error('🚨 ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};
