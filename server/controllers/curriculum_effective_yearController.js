const Curriculum = require('../models/curriculum_effective_yearModel');

// Controller to get all curriculum
const getCurriculumEffectiveYear = async (req, res) => {
  try {
    const curriculums = await Curriculum.find();
    res.status(200).json(curriculums);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
  }
};

// Controller to add a new curriculum
const addCurriculumEffectiveYear = async (req, res) => {
  try {
      // Extract the curriculum_effective_year directly from the request body
      const { curriculum_effective_year } = req.body;

      // Log incoming data for debugging
      console.log('Incoming data:', req.body); // Should show { curriculum_effective_year: '2019-2020' }

      // Create a new Curriculum instance
      const newCurriculum = new Curriculum({ curriculum_effective_year });

      // Save the instance to the database
      await newCurriculum.save();

      // Send a success response
      res.status(201).send(newCurriculum);
  } catch (error) {
      console.error('Error adding curriculum:', error);
      res.status(400).send({ message: 'Error adding curriculum_effective_year', error });
  }
};






module.exports = { getCurriculumEffectiveYear, addCurriculumEffectiveYear };
