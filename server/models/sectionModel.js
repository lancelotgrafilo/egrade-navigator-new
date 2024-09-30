const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  section: {type: String, required: true},
}, {collection: 'sections'});

const sectionModel = mongoose.model("Sections", sectionSchema)
module.exports = sectionModel;
