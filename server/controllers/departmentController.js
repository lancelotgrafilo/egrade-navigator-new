const Department = require('../models/departmentModel');

// Controller to get all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

// Controller to add a new department
const addDepartment = async (req, res) => {
  const { department } = req.body;

  if (!department) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  try {
    const newDepartment = new Department({ department });
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding department', error });
  }
};

module.exports = { getDepartments, addDepartment };
