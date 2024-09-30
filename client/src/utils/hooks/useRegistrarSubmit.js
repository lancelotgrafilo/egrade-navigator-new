import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import {toast} from 'react-toastify';

const useRegistrarSubmit = () => {
  const [dataRegistrar, setDataRegistrar] = useState({
    email: "",
    last_name: "",
    first_name: "",
    middle_name: "",
  });

  const resetRegistrarForm = () => {
    setDataRegistrar({
      email: '',
      last_name: '',
      first_name: '',
      middle_name: "",
    });
  };

  const [isRegistrarStaffLoading, setIsRegistrarStaffLoading] = useState(false);
  
  const handleChangeRegistrar = (e) => {
    setDataRegistrar({ ...dataRegistrar, [e.target.name]: e.target.value });
  };


  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmitRegistrarStaff = async() => {

    if (!validateEmail(dataRegistrar.email)) {
      toast.warn("Invalid email format")
      return;
    }
   
    const registrarStaffSchema = Joi.object({
      ID: Joi.string(),
      last_name: Joi.string().required(),
      first_name: Joi.string().required(),
      middle_name: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      isActive: Joi.boolean().default(true),
      createdAt: Joi.date().default(Date.now),
    });
    
    const { errorRegistrar: validationError } = registrarStaffSchema.validate(dataRegistrar, { abortEarly: false });

    if (validationError) {
      toast.error(validationError.details.map(detail => detail.message).join(', '));
      return;
    }

    setIsRegistrarStaffLoading(true);

    try {
      const response = await axios.post("/api/registrar_staff", {
        email: dataRegistrar.email,
        last_name: dataRegistrar.last_name,
        first_name: dataRegistrar.first_name,
      });

      // if (response.status === 201) {
      //   navigate("/login");
      // }

      if (response.status === 201){
        toast.success("Successfully Added New Registrar Staff")
        setDataRegistrar({ email: "", last_name: "", first_name: "" });
      }else {
        toast.error("Unexpected response status: " + response.status);
      }

    } catch (error) {
      toast.error(`Registration failed. Please try again. ${error.response.data.message}`)
    } finally{
      setIsRegistrarStaffLoading(false);
    }
  }

  return {
    dataRegistrar,
    handleChangeRegistrar,
    handleSubmitRegistrarStaff,
    resetRegistrarForm,
    isRegistrarStaffLoading
  };
};

export default useRegistrarSubmit;
