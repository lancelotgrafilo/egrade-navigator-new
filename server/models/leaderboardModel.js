const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
  subject_title: { type: String },
  subject_code: { type: String },
  instructor: { type: String },
  academic_year: { type: String },
  semester: { type: String },
  midterm_grade: { type: Number },
  finalterm_grade: { type: Number },
  GWA: { type: Number }
}, { _id: false }); // _id is set to false to avoid creating a separate _id for each grade entry

const leaderboardSchema = new Schema({
  schoolID: { type: String },
  last_name: { type: String },
  first_name: { type: String },
  middle_initial: { type: String },
  course: { type: String },
  grades: [gradeSchema], // Array of grades
}, { collection: 'students' });

const leaderboardModel = mongoose.model("Leaderboard", leaderboardSchema);
module.exports = leaderboardModel;
