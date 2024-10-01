import { useState } from "react";
import axios from "axios";
import Joi from "joi";
import { toast } from 'react-toastify';

const usePostSubjects = () => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const [isSubjectLoading, setSubjectLoading] = useState(false);
  const [dataSubject, setDataSubject] = useState({
    department: '',
    subject_code: '',
    subject_title: '',
    prerequisite: '',
    unit: '',
    effective: '',
    offered: '',
  });

  const resetSubjectForm = () => {
    setDataSubject({
      department: '',
      subject_code: '',
      subject_title: '',
      prerequisite: '',
      unit: '',
      effective: '',
      offered: ''
    });
  };

  const handleChangeSubject = (e) => {
    const { name, value } = e.target;
    setDataSubject({
      ...dataSubject,
      [name]: name === 'unit' ? parseFloat(value) || '' : value,
    });
  };

  const handleSubmitSubject = async () => {
    const subjectSchema = Joi.object({
      department: Joi.string().required(),
      subject_code: Joi.string().required(),
      subject_title: Joi.string().required(),
      unit: Joi.number().required(),
      prerequisite: Joi.string().required(),
      effective: Joi.string().required(),
      offered: Joi.string().required(),
    });
  
    // Validate data against schema
    const { error: validationError } = subjectSchema.validate(dataSubject, { abortEarly: false });
    if (validationError) {
      const validationMessages = validationError.details.map(detail => detail.message).join(', ');
      toast.error(validationMessages);
      return;
    }
  
    setSubjectLoading(true);
    try {
      await delay(3000);
      const response = await axios.post('https://egrade-backend.onrender.com/api/post_subjects', dataSubject);
      if (response.status === 201) {
        toast.success('Subject added successfully.');
        resetSubjectForm();
      } else {
        toast.error('Failed to add subject. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting subject:', error);
      toast.error('Failed to add subject. Please try again.');
    } finally {
      setSubjectLoading(false);
    }
  };
  

  return {
    dataSubject,
    handleChangeSubject,
    handleSubmitSubject,
    resetSubjectForm,
    isSubjectLoading,
  };
};

export default usePostSubjects;
