import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import { toast } from 'react-toastify';

const useInstructorsLoadSubmit = (instructorId) => { // Accept instructorId as a parameter
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const [dataInstructorsLoad, setDataInstructorsLoad] = useState({
    subject_code: "",
    subject_title: "",
    course: "",
    year: "",
    section: "",
    semester: "",
    academic_year: "",
  });

  // Function to reset form fields
  const resetInstructorsLoadForm = () => {
    setDataInstructorsLoad({
      subject_code: "",
      subject_title: "",
      course: "",
      year: "",
      section: "",
      semester: "",
      academic_year: "",
    });
  };

  const [isInstructorsLoadLoading, setIsInstructorsLoadLoading] = useState(false);

  const handleChangeInstructorsLoad = (e) => {
    setDataInstructorsLoad({ ...dataInstructorsLoad, [e.target.name]: e.target.value });
  };

  const handleSubmitInstructorsLoad = async () => {
    // Validate data against schema
    const instructorsLoadSchema = Joi.object({
      subject_code: Joi.string().required(),
      subject_title: Joi.string().required(),
      course: Joi.string().required(),
      year: Joi.string().required(),
      section: Joi.string().required(),
      semester: Joi.string().required(),
      academic_year: Joi.string().required(),
      _id: Joi.string().required(), // Ensure _id is required
    });

    const { error: validationError } = instructorsLoadSchema.validate(
      { ...dataInstructorsLoad, _id: instructorId }, // Include _id in validation
      { abortEarly: false }
    );

    if (validationError) {
      const validationMessages = validationError.details.map(detail => detail.message).join(', ');
      toast.error(validationMessages);
      return;
    }

    console.log('Data being submitted:', {
      ...dataInstructorsLoad,
      _id: instructorId,
    });

    setIsInstructorsLoadLoading(true);

    try {
      await delay(500);
      const response = await axios.post("https://egrade-backend.onrender.com/api/post_instructors_load", {
        ...dataInstructorsLoad,
        _id: instructorId, // Include _id in the request data
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        resetInstructorsLoadForm();
        toast.success("New Instructor's Load added successfully");
      } else {
        const unexpectedError = "Unexpected response status: " + response.status;
        toast.error(unexpectedError);
      }
    } catch (error) {
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || "Saving failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsInstructorsLoadLoading(false);
    }
  };

  return {
    dataInstructorsLoad,
    handleChangeInstructorsLoad,
    handleSubmitInstructorsLoad,
    resetInstructorsLoadForm,
    isInstructorsLoadLoading
  };
};

export default useInstructorsLoadSubmit;
