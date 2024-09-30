const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

require("./services/cleanupExpiredAnnouncements.js");

const app = express();
app.use(bodyParser.json());

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// MongoDB Connection
connectDB(); // Connect to MongoDB using Mongoose

// Routes
app.use('/api', require('./routes/studentRoute'));
app.use('/api', require('./routes/subjectRoute'));
app.use('/api', require('./routes/classProgramRoute'));
app.use('/api', require('./routes/leaderboardRoute.js'))
app.use('/api', require('./routes/loginRoute')); 
app.use('/api', require('./routes/registerRoute'));
app.use('/api', require('./routes/adminRoute'));
app.use('/api', require('./routes/collegeStaffRoute'));
app.use('/api/post_registrar_staff', require('./routes/registrarStaffRoute'));
app.use('/api', require('./routes/facultyStaffRoute'));
app.use('/api', require('./routes/emailRegRoute'));
app.use("/api/post_send_email_success_msg", require('./routes/emailSuccessRoute'));
app.use('/api', require('./routes/usersListRoute.js'));
app.use('/api', require('./routes/dashboardRoute.js'));
app.use('/api', require('./routes/removalCompleteRoute.js'));
app.use('/api', require('./routes/fileRoutes.js'));
app.use('/api', require('./routes/activeUsers.js'));
app.use('/api', require('./routes/changePasswordRoute.js'));
app.use('/api', require('./routes/activityLogRoutes.js'));
app.use('/api', require('./routes/announcementRoute.js'));
app.use('/api', require('./routes/departmentRoute.js'));
app.use('/api', require('./routes/academicYearRoute.js'));
app.use('/api', require('./routes/yearLevelRoutes.js'));
app.use('/api', require('./routes/sectionRoute.js'));
app.use('/api', require('./routes/semesterRoute.js'));
app.use('/api', require('./routes/verifyRoute.js'));
app.use('/api', require('./routes/gradeSheetRoute.js'));
app.use('/api', require('./routes/collegesRoute.js'));
app.use('/api', require('./routes/curriculum_effective_yearRoute.js'));
// Error Handling Middleware
app.use(errorHandler);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
