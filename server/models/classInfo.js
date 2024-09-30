const mongoose = require("mongoose");

const classInfoSchema = new mongoose.Schema({
  subject_code: String,
  class_name: String,
  semester: String,
  AY: String,
})

const classInfoModel = mongoose.model("ClassInfo", classInfoSchema)
module.exports = classInfoModel;