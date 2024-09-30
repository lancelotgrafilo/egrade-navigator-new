import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const usePostAddStudentSubject = (studentId) => {
  const [dataStudentSubject, setDataStudentSubject] = useState({
    subject_code: "",
    subject_title: "",
    instructor: "",
    semester: "",
    academic_year: "",
  });

  const resetStudentSubjectForm = () => {
    setDataStudentSubject({
      subject_code: "",
      subject_title: "",
      instructor: "",
      semester: "",
      academic_year: "",
    });
  };

  const [isStudentSubjectLoading, setIsStudentSubjectLoading] = useState(false);

  const handleChangeStudentSubject = (e) => {
    setDataStudentSubject({ ...dataStudentSubject, [e.target.name]: e.target.value });
  };

  const handleSubmitStudentSubject = async () => {
    setIsStudentSubjectLoading(true);
    try {
      const response = await axios.post("/api/post_student_subject", {
        ...dataStudentSubject,
        _id: studentId,  // Include _id in the request data
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        toast.success("New Student's Subject added successfully");
        setDataStudentSubject({
          subject_code: "",
          subject_title: "",
          instructor: "",
          semester: "",
          academic_year: "",
        });
      } else {
        toast.error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || "Saving failed. Please try again.");
    } finally {
      setIsStudentSubjectLoading(false);
    }
  };

  return {
    dataStudentSubject,
    handleChangeStudentSubject,
    handleSubmitStudentSubject,
    resetStudentSubjectForm,
    isStudentSubjectLoading
  };
};

export default usePostAddStudentSubject;
