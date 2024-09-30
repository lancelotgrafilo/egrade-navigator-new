const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
  curriculum_effective_year: {type: String, required: true},
}, {collection: 'curriculumEffectiveYears'});

const Curriculum = mongoose.model("Curriculum", curriculumSchema)
module.exports = Curriculum;
