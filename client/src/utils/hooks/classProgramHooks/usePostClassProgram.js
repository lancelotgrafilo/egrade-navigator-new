import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import { toast } from 'react-toastify';

const useClassProgramSubmit = () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [dataClassProgram, setDataClassProgram] = useState({
    department: "",
    subject_code: "",
    subject_title: "",
    yearLevel: "",
    section: "",
    semester: "",
    academic_year: "",
  });

  // Function to reset form fields
  const resetClassProgramForm = () => {
    setDataClassProgram({
      department: "",
      subject_code: "",
      subject_title: "",
      yearLevel: "",
      section: "",
      semester: "",
      academic_year: "",
    });
  };

  const [isClassProgramLoading, setIsClassProgramLoading] = useState(false);

  const handleChangeClassProgram = (e) => {
    const { name, value } = e.target;

    if (name === "subject") {
      try {
        // Parse the JSON value containing subject_code and subject_title
        const selectedSubject = JSON.parse(value);
        setDataClassProgram((prevData) => ({
          ...prevData,
          subject_code: selectedSubject.subject_code,
          subject_title: selectedSubject.subject_title,
        }));
      } catch (error) {
        toast.error("Invalid subject format");
      }
    } else {
      setDataClassProgram((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmitClassProgram = async () => {
    const classProgramSchema = Joi.object({
      department: Joi.string().required(),
      subject_code: Joi.string().required(),
      subject_title: Joi.string().required(),
      yearLevel: Joi.string().required(),
      section: Joi.string().required(),
      semester: Joi.string().required(),
      academic_year: Joi.string().required(),
      instructor: Joi.array().default([]),
      students: Joi.array().default([]),
    });

    // Validate data against schema
    const { error: validationError } = classProgramSchema.validate(dataClassProgram, { abortEarly: false });

    if (validationError) {
      const validationMessages = validationError.details.map((detail) => detail.message).join(", ");
      toast.error(validationMessages);
      return;
    }

    setIsClassProgramLoading(true);

    try {
      await delay(500);
      const response = await axios.post("https://egrade-backend.onrender.com/api/post_class_program", dataClassProgram, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        resetClassProgramForm();
        toast.success("New Class Program added successfully");
      } else {
        const unexpectedError = "Unexpected response status: " + response.status;
        toast.error(unexpectedError);
      }
    } catch (error) {
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || "Saving failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsClassProgramLoading(false);
    }
  };

  return {
    dataClassProgram,
    handleChangeClassProgram,
    handleSubmitClassProgram,
    resetClassProgramForm,
    isClassProgramLoading,
  };
};

export default useClassProgramSubmit;
