import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import {toast} from 'react-toastify';

const useCollegeSubmit = () => {
  const [dataCollege, setDataCollege] = useState({
    email: "",
    last_name: "",
    first_name: "",
    middle_initial: ""
  });
  
  const resetCollegeForm = () => {
    // Example: Clear dataCollege
    setDataCollege({
      email: '',
      last_name: '',
      first_name: '',
      middle_initial: ""
    });
  };

  const [isCollegeStaffLoading, setIsCollegeStaffLoading] = useState(false);

  
  const handleChangeCollege = (e) => {
    setDataCollege({ ...dataCollege, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmitCollegeStaff = async() => {

    if (!validateEmail(dataCollege.email)) {
      toast.warn("Invalid email format")
      return;
    }
   
    const collegeStaffSchema = Joi.object({
      ID: Joi.string(),
      last_name: Joi.string().required(),
      first_name: Joi.string().required(),
      middle_initial: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      isActive: Joi.boolean().default(true),
      createdAt: Joi.date().default(Date.now),
    });
    
    const { errorCollege: validationError } = collegeStaffSchema.validate(dataCollege, { abortEarly: false });

    if (validationError) {
      toast.error(validationError.details.map(detail => detail.message).join(', '));
      return;
    }

    setIsCollegeStaffLoading(true);

    try {
      const response = await axios.post("/api/post_college_staff", {
        email: dataCollege.email,
        last_name: dataCollege.last_name,
        first_name: dataCollege.first_name,
        middle_initial: dataCollege.middle_initial,
      });

      // if (response.status === 201) {
      //   navigate("/login");
      // }

      if (response.status === 201){
        toast.success("Successfully Added New College Staff");
        resetCollegeForm();
      }else {
        toast.error("Unexpected response status: " + response.status)
      }

    } catch (error) {
      toast.error(`Registration failed. Please try again. ${error.response.data.message}`)
    } finally {
      setIsCollegeStaffLoading(false);
    }
  }

  return {
    dataCollege,
    handleChangeCollege,
    handleSubmitCollegeStaff,
    resetCollegeForm,
    isCollegeStaffLoading
  };
};

export default useCollegeSubmit;
