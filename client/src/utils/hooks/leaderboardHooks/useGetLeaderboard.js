import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function useGetLeaderboard(searchQuery, academicYear, semester, course) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNotified, setHasNotified] = useState(false); // State to track notification

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get('https://egrade-backend.onrender.com/api/get_leaderboard', {
          params: { search: searchQuery, academicYear, semester, course }
        });
        setLeaderboard(response.data);

        // Show success toast when leaderboard data is loaded
        if (response.data.length > 0) {
          toast.info("🏆 Leaderboard data loaded successfully! 🎉");
        } else {
          toast.info("📄 No data found for the leaderboard.");
        }

        // Set hasNotified to true after leaderboard data is successfully fetched
        setHasNotified(true);
      } catch (err) {
        setError(err.message);
        toast.error(`🚨 Error fetching leaderboard: ${err.message}`); // Display error toast
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [searchQuery, academicYear, semester, course]);

  return { leaderboard, loading, error };
}

export default useGetLeaderboard;
