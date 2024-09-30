import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import { toast } from 'react-toastify'; // Import toast

const useAdminSubmit = () => {
  const [dataAdmin, setDataAdmin] = useState({
    email: "",
    last_name: "",
    first_name: "",
    middle_initial: ""
  });

  // Function to reset form fields
  const resetAdminForm = () => {
    setDataAdmin({
      email: '',
      last_name: '',
      first_name: '',
      middle_initial: ""
    });
  };

  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const handleChangeAdmin = (e) => {
    setDataAdmin({ ...dataAdmin, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmitAdmin = async () => {

    if (!validateEmail(dataAdmin.email)) {
      toast.warn("Invalid email format"); 
      return;
    }

    const adminSchema = Joi.object({
      ID: Joi.string(),
      last_name: Joi.string().required(),
      first_name: Joi.string().required(),
      middle_initial: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      isActive: Joi.boolean().default(true),
      createdAt: Joi.date().default(Date.now),
    });

    const { error: validationError } = adminSchema.validate(dataAdmin, { abortEarly: false });

    if (validationError) {
      const validationMessages = validationError.details.map(detail => detail.message).join(', ');
      toast.error(validationMessages); 
      return;
    }

    setIsAdminLoading(true);

    try {
      const response = await axios.post("/api/post_admin", dataAdmin, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201) {
        resetAdminForm();
        toast.success("New admin added successfully"); // Trigger success toast notification
      } else {
        const unexpectedError = "Unexpected response status: " + response.status;
        toast.error(unexpectedError); 
      }
    } catch (error) {
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage); // Trigger error toast notification
    } finally {
      setIsAdminLoading(false);
    }
  };

  return {
    dataAdmin,
    handleChangeAdmin,
    handleSubmitAdmin,
    resetAdminForm,
    isAdminLoading
  };
};

export default useAdminSubmit;
