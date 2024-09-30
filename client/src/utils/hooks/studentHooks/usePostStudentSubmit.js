import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import { toast } from "react-toastify";

const useStudentSubmit = () => {
  const [dataStudent, setDataStudent] = useState({
    schoolID: "",
    last_name: "",
    first_name: "",
    middle_initial: "",
    email: "",
    college: "",
    course: "",
    year: "",
    section: "",
    curriculum_effective_year: '',
  });

  const resetStudentForm = () => {
    setDataStudent({
      schoolID: "",
      last_name: "",
      first_name: "",
      middle_initial: "",
      email: "",
      college: "",
      course: "",
      year: "",
      section: "",
      curriculum_effective_year: ''
    });
  };

  const [isStudentLoading, setIsStudentLoading] = useState(false);

  const formatSchoolID = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/^(\d{2})(\d{1})(\d{4})$/, '$1-$2-$3');
  };

  const handleChangeStudent = (e) => {
    const { name, value } = e.target;

    if (name === 'schoolID') {
      const formattedValue = formatSchoolID(value);
      if (formattedValue.replace(/-/g, '').length > 7) {
        toast.warn("School ID cannot exceed the format 12-3-4567.");
        return; // Prevent further changes if limit is exceeded
      }
      setDataStudent((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setDataStudent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitStudent = async () => {
    const studentSchema = Joi.object({
      schoolID: Joi.string().pattern(/^\d{2}-\d{1}-\d{4}$/).required(),
      last_name: Joi.string().required(),
      first_name: Joi.string().required(),
      middle_initial: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      college: Joi.string().required(),
      course: Joi.string().required(),
      year: Joi.string().required(),
      section: Joi.string().required(),
      curriculum_effective_year: Joi.string().required(),
    });

    const { error } = studentSchema.validate(dataStudent, { abortEarly: false });

    if (error) {
      toast.error("Validation Error: " + error.details.map(detail => detail.message).join(", "));
      return; // Exit if validation fails
    }

    setIsStudentLoading(true);

    try {
      const response = await axios.post('/api/post_register_student', dataStudent, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201) {
        toast.success("Successfully Added New Student");
        resetStudentForm();
        return response; // Return the response
      } else {
        toast.error("Unexpected response status: " + response.status);
      }

    } catch (error) {
      const message = error.response?.data?.message || error.message || 'An unknown error occurred.';
      toast.error(`Registration failed. Please try again. ${message}`);
    } finally {
      setIsStudentLoading(false);
    }
  };

  return {
    dataStudent,
    handleChangeStudent,
    handleSubmitStudent,
    resetStudentForm,
    isStudentLoading,
  };
};

export default useStudentSubmit;
