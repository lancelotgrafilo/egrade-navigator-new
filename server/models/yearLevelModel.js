const mongoose = require('mongoose');

const yearLevelsSchema = new mongoose.Schema({
  yearLevel: {type: String, required: true},
}, {collection: 'yearLevels'});

const yearLevelModel = mongoose.model("YearLevel", yearLevelsSchema)
module.exports = yearLevelModel;
