import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const useEmailConfirmReg = () => {
  const [dataEmail, setDataEmail] = useState({
    email: "",
    subject: "Email Confirmation Code",
    code: ""
  });

  const [confirmationCode, setConfirmationCode] = useState(""); // Store the code here
  const [enteredCode, setEnteredCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeEmail = (e) => {
    setDataEmail({ ...dataEmail, [e.target.name]: e.target.value });
  };

  const handleChangeCode = (e) => {
    const code = e.target.value;
    setEnteredCode(code);
  
    if (code === "") {
      setIsCodeValid(null);
    } else if (code.length === confirmationCode.length && code === confirmationCode) {
      setIsCodeValid(true);
    } else {
      setIsCodeValid(false);
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmitEmail = async () => {
    if (!validateEmail(dataEmail.email)) {
      if(dataEmail.email === ""){
        toast.warn("Email is Required");
      } else {
        toast.warn("Invalid email format");
      }
      return;
    }

    if (isCooldownActive) {
      toast.warn("You must wait before sending another code.")
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/post_send_emailConfirmation", {
        email: dataEmail.email
      });

      if (response.status === 200) {
        toast.success("Confirmation email sent successfully");
        setConfirmationCode(response.data.confirmationCode); // Store the code
        startCooldown();
      } else {
        toast.error("Unexpected response status: " + response.status);
      }

    } catch (error) {
      toast.error(`Email Sending failed. Please try again. ${error.response.data.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startCooldown = () => {
    const cooldownDuration = 180; // 3 minutes in seconds
    const endTime = Date.now() + cooldownDuration * 1000;

    setIsCooldownActive(true);
    setCooldownTime(cooldownDuration);

    const interval = setInterval(() => {
      const remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setCooldownTime(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(interval);
        setIsCooldownActive(false);
      }
    }, 1000);
  };

  const resetCode = () => {
    setConfirmationCode("");
    setEnteredCode("");
    setIsCodeValid(null);
    setDataEmail({
      email: '',
    });
  };  

  return {
    dataEmail,
    handleChangeEmail,
    handleSubmitEmail,
    enteredCode,
    handleChangeCode,
    isCodeValid,
    resetCode,
    isCooldownActive,
    cooldownTime,
    isLoading,
    confirmationCode 
  };
};

export default useEmailConfirmReg;
