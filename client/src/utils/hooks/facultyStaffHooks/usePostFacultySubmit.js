import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import {toast} from 'react-toastify';


const useFacultySubmit = () => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const [dataFaculty, setDataFaculty] = useState({
    email: "",
    facultyID: "",
    last_name: "",
    first_name: "",
    middle_initial: "",
    department: "",
    contact_number: "",
  });

  const resetFacultyForm = () => {
    setDataFaculty({
      email: '',
      facultyID: "",
      last_name: '',
      first_name: '',
      middle_initial: "",
      department: "",
      contact_number: "",
    });
  };
  


  const [isFacultyStaffLoading, setIsFacultyStaffLoading] = useState(false);


  const formatFacultyID = (value) => {
    // Remove any non-alphanumeric characters
    const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '');
  
    // Match two letters followed by three digits
    const match = alphanumeric.match(/^([A-Za-z]{2})(\d{0,3})$/);
    
    if (match) {
      // Format the value
      const formatted = `${match[1]}-${match[2]}`;
      return formatted;
    }
  
    // If the input does not match, return it as is
    return value;
  };
  
  const handleChangeFaculty = (e) => {
    const { name, value } = e.target;
  
    if (name === 'facultyID') {
      const formattedValue = formatFacultyID(value);
      if (formattedValue.replace(/-/g, '').length > 5) {
        toast.warn("Faculty ID cannot exceed the format AB-123.");
        return; // Prevent further changes if limit is exceeded
      }
      setDataFaculty((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setDataFaculty((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  // const handleChangeFaculty = (e) => {
  //   setDataFaculty({ ...dataFaculty, [e.target.name]: e.target.value });
  // };

  

  const handleSubmitFaculty = async() => {
    
   
    const facultyStaffSchema = Joi.object({
      ID: Joi.string(),
      facultyID: Joi.string().required(),
      last_name: Joi.string().required(),
      first_name: Joi.string().required(),
      middle_initial: Joi.string().required(),
      department: Joi.string().required(),
      contact_number: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      subjects: Joi.array().items(Joi.any()).default([]),
      isActive: Joi.boolean().default(true),
      createdAt: Joi.date().default(Date.now),
    });
    
    const { errorFaculty: validationError } = facultyStaffSchema.validate(dataFaculty, { abortEarly: false });

    if (validationError) {
      toast.error("Validation Error:", validationError.details); // Debugging line
      return;
    }

    setIsFacultyStaffLoading(true);

    try {
      await delay(100);
      const response = await axios.post("https://egrade-backend.onrender.com/api/post_faculty_staff", dataFaculty, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 201){
        toast.success("Successfully Added New Faculty Staff");
        setDataFaculty({
          email: "",
          facultyID: "",
          last_name: "",
          first_name: "",
          middle_initial: "",
          department: "",
          contact_number: "",
        });
        
      }else {
        toast.error("Unexpected response status: " + response.status);
      }

    } catch (error) {
      toast.error(`Registration failed. Please try again. ${error.response.data.message}`); 
    } finally {
      setIsFacultyStaffLoading(false);
    }
  }

  return {
    dataFaculty,
    handleChangeFaculty,
    handleSubmitFaculty,
    resetFacultyForm,
    isFacultyStaffLoading
  };
};

export default useFacultySubmit;
