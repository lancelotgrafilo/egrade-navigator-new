const asyncHandler = require('express-async-handler');
const LeaderboardModel = require('../models/leaderboardModel');

// @desc    Get Leaderboard
// @route   GET /api/fetch_leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const { search, academicYear, semester, course } = req.query;

  try {
    let query = {};

    if (course) query.course = course;

    // Fetch leaderboards from the database based on the course filter
    let allLeaderboards = await LeaderboardModel.find(query).exec();

    // Filter the students based on academic year and semester
    let filteredLeaderboards = allLeaderboards.filter(student => {
      if (student.grades.length === 0) return false;

      // Check if any grade entry matches the given academic year and semester filters
      const matchingGrades = student.grades.filter(grade => {
        const matchAY = academicYear ? grade.academic_year === academicYear : true;
        const matchSemester = semester ? grade.semester === semester : true;
        return matchAY && matchSemester;
      });

      // Return true if at least one grade entry matches the filters
      return matchingGrades.length > 0;
    });

    // Sort students by their GWA (average of all grades)
    filteredLeaderboards.sort((a, b) => {
      const aAvgGWA = a.grades.reduce((sum, grade) => sum + grade.GWA, 0) / a.grades.length;
      const bAvgGWA = b.grades.reduce((sum, grade) => sum + grade.GWA, 0) / b.grades.length;
      return aAvgGWA - bAvgGWA;
    });

    // Add rank based on GWA and include all grades in the response
    const rankedLeaderboards = filteredLeaderboards.map((leaderboard, index) => ({
      ...leaderboard.toObject(),
      originalLeaderboard: index + 1, // Ranking based on GWA
    }));

    // Apply search filter if provided
    // Apply search filter if provided
    if (search) {
      const lowercasedSearch = search.toLowerCase().trim();

      const finalFilteredLeaderboards = rankedLeaderboards.filter((leaderboard) => {
        const { schoolID, last_name, first_name, middle_initial, course, grades } = leaderboard;

        // Check if student info matches the search query
        const matches = [
          String(schoolID),
          String(last_name).toLowerCase(),
          String(first_name).toLowerCase(),
          String(middle_initial).toLowerCase(),
          String(course).toLowerCase(),
        ];

        // Include grades in the search (academic_year, semester, GWA)
        grades.forEach((grade) => {
          matches.push(String(grade.academic_year).toLowerCase());
          matches.push(String(grade.semester).toLowerCase());
          matches.push(String(grade.GWA));
        });

        // Use exact matches for semester keywords like "1st" and "2nd"
        return matches.some(field => 
          field.includes(lowercasedSearch) || 
          (lowercasedSearch === '1st' && field === '1st') || 
          (lowercasedSearch === '2nd' && field === '2nd')
        );
      });

      return res.status(200).json(finalFilteredLeaderboards);
    }


    // If no search query, return the ranked leaderboards
    res.status(200).json(rankedLeaderboards);
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    res.status(500).json({
      message: 'Failed to fetch leaderboards',
      error: error.message,
    });
  }
});

module.exports = {
  getLeaderboard,
};
