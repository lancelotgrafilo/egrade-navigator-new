// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Required for CORS
const connectDB = require('./config/db');
const dotenv = require('dotenv').config(); // Environment variables
const { errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

// Optional service for cleaning up expired announcements
require("./services/cleanupExpiredAnnouncements.js");

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend communication
app.use(cors({
  origin: 'https://egrade-frontend.onrender.com', // Your frontend URL deployed on Render
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], // Allowed methods
  credentials: true // Allow cookies or auth headers if needed
}));

// MongoDB Connection
connectDB(); // Call to connect to MongoDB

// Routes for different parts of the application
app.use('/api', require('./routes/studentRoute'));
app.use('/api', require('./routes/subjectRoute'));
app.use('/api', require('./routes/classProgramRoute'));
app.use('/api', require('./routes/leaderboardRoute'));
app.use('/api', require('./routes/loginRoute')); 
app.use('/api', require('./routes/registerRoute'));
app.use('/api', require('./routes/adminRoute'));
app.use('/api', require('./routes/collegeStaffRoute'));
app.use('/api/post_registrar_staff', require('./routes/registrarStaffRoute'));
app.use('/api', require('./routes/facultyStaffRoute'));
app.use('/api', require('./routes/emailRegRoute'));
app.use("/api/post_send_email_success_msg", require('./routes/emailSuccessRoute'));
app.use('/api', require('./routes/usersListRoute'));
app.use('/api', require('./routes/dashboardRoute'));
app.use('/api', require('./routes/removalCompleteRoute'));
app.use('/api', require('./routes/fileRoutes'));
app.use('/api', require('./routes/activeUsers'));
app.use('/api', require('./routes/changePasswordRoute'));
app.use('/api', require('./routes/activityLogRoutes'));
app.use('/api', require('./routes/announcementRoute'));
app.use('/api', require('./routes/departmentRoute'));
app.use('/api', require('./routes/academicYearRoute'));
app.use('/api', require('./routes/yearLevelRoutes'));
app.use('/api', require('./routes/sectionRoute'));
app.use('/api', require('./routes/semesterRoute'));
app.use('/api', require('./routes/verifyRoute'));
app.use('/api', require('./routes/gradeSheetRoute'));
app.use('/api', require('./routes/collegesRoute'));
app.use('/api', require('./routes/curriculum_effective_yearRoute'));

// Error Handling Middleware
app.use(errorHandler);

// Serve static files (e.g., for uploaded content)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
