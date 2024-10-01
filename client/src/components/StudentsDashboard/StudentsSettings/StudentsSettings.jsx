import styleSettings from './studentsSettings.module.css';
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import userProfile from "../../../assets/icons/user_icon.png";
import { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';

import verifiedIcon from '../../../assets/icons/verified.png';
import useGetStudentDetails from '../../../utils/hooks/studentHooks/useGetStudentDetails';
import useUpdateStudentDetails from '../../../utils/hooks/studentHooks/useUpdateStudentDetails';
import useEmailConfirmReg from '../../../utils/hooks/usePostEmailConfirmReg';
export function StudentsSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    schoolID: '',
    last_name: '',
    first_name: '',
    middle_initial: '',
    email: '',
    college: "",
    course: "",
    year: "",
    section: "",
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null); // Ref for the file input

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleEditable = async () => {
    setIsEditable(!isEditable);
  };
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleImageRemove = () => {
    setProfileImage(null); // Reset to default profile image
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input value
    }
  };
  
  const schoolIDPattern = /^\d{2}-\d{1}-\d{4}$/; // Format: XX-X-XXXX

  const [isSchoolIDTouched, setIsSchoolIDTouched] = useState(false);

  const handleChange = (e) => {
      const { name, value } = e.target;
  
      if (name === 'schoolID') {
          setIsSchoolIDTouched(true); // Mark it as touched when the user starts typing
      }
  
      if (name === 'schoolID' && value && isEditable && isSchoolIDTouched && !schoolIDPattern.test(value)) {
          toast.error('School ID must be in the format: 12-3-4567');
          return; // Exit if format is invalid
      }
  
      setFormData((prevData) => ({
          ...prevData,
          [name]: value
      }));
  };
  


  const token = localStorage.getItem('token');
  let userId = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { userDetails, loading: loadingDetails, refetch } = useGetStudentDetails(userId);
  const { updateStudentDetails, loading: loadingUpdate, error } = useUpdateStudentDetails();

  

  useEffect(() => {
    if (userDetails) {
      const backendUrl = 'https://egrade-backend.onrender.com';
      const fullProfileImageUrl = userDetails.user_profile
        ? `${backendUrl}${userDetails.user_profile.startsWith('/uploads') ? '' : '/uploads/user-profiles/'}${userDetails.user_profile}`
        : userProfile;
      setProfileImage(fullProfileImageUrl);
      setFormData({
        schoolID: userDetails.schoolID || '',
        last_name: userDetails.last_name || '',
        first_name: userDetails.first_name || '',
        middle_initial: userDetails.middle_initial || '',
        email: userDetails.email || '',
        college: userDetails.college || '',
        course: userDetails.course || "",
        year: userDetails.year || "",
        section: userDetails.section || "",
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [userDetails]);

  const validatePasswords = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return false;
    }
    return true;
  };

  const validateCurrentPassword = async () => {
    try {
      const response = await axios.post('https://egrade-backend.onrender.com/api/validate-current-password-student', { 
        userId,
        currentPassword: formData.currentPassword 
      });
      return response.data.valid; // Assuming response has a field 'valid'
    } catch (error) {
      console.error('Error validating current password:', error);
      toast.error('Error validating current password');
      return false;
    }
  };

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const validatePasswordsFormat = () => {
    if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New password and confirm password do not match');
        return false;
    }
    
    if (!passwordPattern.test(formData.newPassword)) {
        toast.error('New password must be at least 8 characters long, include upper and lower case letters, a number, and a special character.');
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate new password and confirm password
    if (!validatePasswords()) return;
    if (!validatePasswordsFormat()) return;
  
    // Validate current password
    const currentPasswordValid = await validateCurrentPassword();
    if (!currentPasswordValid) return;
  
    // Prepare form data
    const formDataObj = new FormData();
    formDataObj.append('schoolID', formData.schoolID);
    formDataObj.append('last_name', formData.last_name);
    formDataObj.append('first_name', formData.first_name);
    formDataObj.append('middle_initial', formData.middle_initial);
    formDataObj.append('email', formData.email);
    formDataObj.append('college', formData.college);
    formDataObj.append('course', formData.course);
    formDataObj.append('year', formData.year);
    formDataObj.append('section', formData.section);
  
    // Add passwords only if provided
    if (formData.currentPassword) {
      formDataObj.append('currentPassword', formData.currentPassword);
    }
    if (formData.newPassword) {
      formDataObj.append('newPassword', formData.newPassword);
    }
  
    if (fileInputRef.current.files[0]) {
      formDataObj.append('user_profile', fileInputRef.current.files[0]);
    }
  
    try {
      await updateStudentDetails(userId, formDataObj);
      toast.success('User details updated successfully');
  
      refetch();  // Refetch user details after successful update
      setIsEditable(false);  // Disable editing after save
      window.location.reload();
    } catch (err) {
      toast.error('Failed to update user details');
      console.error('Failed to update user details', err);
    }
  };

  const {
    dataEmail,
    handleChangeEmail,
    handleSubmitEmail,
    enteredCode,
    handleChangeCode,
    isCodeValid,
    isCooldownActive,
    cooldownTime,
    isLoading,
    resetCode
  } = useEmailConfirmReg();

  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    // Ensure userDetails is available and has an email
    if (!userDetails || !userDetails.email) {
      toast.error('User details not loaded. Please try again.');
      return;
    }

    // Check if the entered email matches the current user's email
    if (dataEmail.email !== userDetails.email) {
      toast.error('Entered email does not match your registered email.');
      return;
    }

    handleSubmitEmail({ preventDefault: () => {} });
    setCodeSent(true);
  };

  const [loadingVerify, setLoadingVerify] = useState(false);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const verifyCode = async () => {
    setLoadingVerify(true);
    await delay(200);
    try {
      // Directly update user verification status
      await axios.post('https://egrade-backend.onrender.com/api/update-verification-status', { userId });
      toast.success('Email verified and status updated successfully');
      resetCode();
      setCodeSent(false);
      
      setLoadingVerify(false);
      // Refresh the page after a successful update
      window.location.reload();
    } catch (error) {
      toast.error('Error updating verification status');
    }
  };




  return (
    <div className={styleSettings.mainContainer}>

      {userDetails ? (
        userDetails?.isVerified ? (
          <div className={styleSettings.verifiedMessage}>
            <p>
              <img src={verifiedIcon} alt="Verified" className={styleSettings.verifiedIcon} />
              Your account is verified.
            </p>
          </div>
        ) : (
          <div className={styleSettings.accountVerificationContainer}>
            <h2>Account Verification</h2>
            <form className={styleSettings.verificationForm} onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="email">Email:</label>
              <input 
                type="email"
                name="email"
                id="email"
                className={styleSettings.userConfigInputField}
                value={dataEmail.email}
                onChange={handleChangeEmail}
              />
              <button 
                type="button"
                onClick={handleSendCode}
                className={styleSettings.sendCodeButton}
                disabled={codeSent || isLoading}
              >
                {isLoading ? (
                    <div className={styleSettings.loader}></div> 
                  ) : isCooldownActive ? (
                    `Please wait ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, "0")}` 
                  ) : (
                    "Send Code"
                  )
                }
              </button>
              {codeSent && (
                <>
                  <div className={styleSettings.labelRow}>
                    <label htmlFor="code">Verification Code:</label>
                    {isCodeValid === true && <p className={styleSettings.success} style={{ color: 'green'}}>Code is correct</p>}
                    {isCodeValid === false && <p className={styleSettings.error} style={{ color: 'red' }}>Code is incorrect</p>}
                  </div>
                  <input 
                    type="number"
                    name="code"
                    id="code"
                    className={styleSettings.userConfigInputField}
                    value={enteredCode}
                    onChange={handleChangeCode}
                  />
                  <button 
                    type="button"
                    onClick={verifyCode}
                    className={styleSettings.verifyButton}
                    disabled={loadingVerify || !isCodeValid}
                  >
                    {loadingVerify ? (
                      <div className={styleSettings.loader}></div> 
                    ) : (
                      "Verify Code"
                    )
                  }
                  </button>
                </>
              )}
            </form>
          </div>
        )
      ) : (
        <p>Loading user details...</p>
      )}
      
      <hr />
        <div>
          <h2>User Configuration</h2>
        </div>

      <div className={styleSettings.dashboardContent}>
        <div className={styleSettings.userConfigContainer}>
          <form className={styleSettings.userConfig} onSubmit={handleSubmit}>
            <div className={styleSettings.columnContainer}>

            <div className={styleSettings.column}>
                <div className={styleSettings.imageContainer}>
                  <img 
                    src={profileImage || userProfile} 
                    alt="Profile" 
                    className={styleSettings.profileImg}
                    onError={(e) => e.target.src = userProfile} // Fallback to default image on error
                  />
                  {profileImage && (
                    <button 
                      type="button"
                      onClick={handleImageRemove}
                      className={styleSettings.removeImageButton}
                    >
                      ×
                    </button>
                  )}
                </div>
                <label htmlFor="profileImage">Profile Image:</label>
                <input 
                  type="file"
                  id='profileImage'
                  name='profileImage'
                  className={styleSettings.userConfigInputField}
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  disabled={!isEditable}
                  ref={fileInputRef} // Attach ref to the file input
                />
              </div>

              <div className={styleSettings.column}>
                <label htmlFor="SchoolID">School ID:</label>
                <input 
                    type="text"
                    name='schoolID' 
                    id='schoolID' 
                    className={styleSettings.userConfigInputField}
                    placeholder='School ID:'
                    value={formData.schoolID}
                    onChange={handleChange}
                    disabled
                />

                
                <label htmlFor="last_name">Last Name:</label>
                <input 
                  type="text"
                  name='last_name'
                  id='last_name' 
                  className={styleSettings.userConfigInputField}
                  placeholder='Last Name'
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <label htmlFor="first_name">First Name:</label>
                <input 
                  type="text"
                  name='first_name'
                  id='first_name'
                  className={styleSettings.userConfigInputField}
                  placeholder='First Name:'
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <label htmlFor="middle_initial">Middle Initial:</label>
                <input 
                  type="text"
                  name='middle_initial' 
                  id='middle_initial'
                  className={styleSettings.userConfigInputField}
                  placeholder='Middle initial:'
                  value={formData.middle_initial}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <label htmlFor="email">Email:</label>
                <input 
                  type="email"
                  name='email' 
                  id='email'
                  className={styleSettings.userConfigInputField}
                  placeholder='Email:'
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <div className={styleSettings.rowColumn}>
                  <div>
                    <label htmlFor="college">College:</label>
                    <select 
                      type="text"
                      name='college'
                      id='college' 
                      className={styleSettings.userConfigInputField}
                      value={formData.college}
                      onChange={handleChange}
                      disabled={!isEditable}
                    >
                      <option value=''>College</option>
                      <option value="CAS">CAS</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="Course">Course:</label>
                    <select 
                      type="text"
                      name='course'
                      id='course' 
                      className={styleSettings.userConfigInputField}
                      value={formData.course}
                      onChange={handleChange}
                      disabled={!isEditable}
                    >
                      <option value=''>Course</option>
                      <option value="BSCS">BSCS</option>
                      <option value="BSIS">BSIS</option>
                    </select>
                  </div>
                  
                </div>

                <div className={styleSettings.rowColumn}>
                <div>
                    <label htmlFor="Year">Year:</label>
                    <select 
                      type="text"
                      name='year'
                      id='year' 
                      className={styleSettings.userConfigInputField}
                      value={formData.year}
                      onChange={handleChange}
                      disabled={!isEditable}
                    >
                      <option value=''>Year</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="Section">Section:</label>
                    <select 
                      type="text"
                      name='section'
                      id='section' 
                      className={styleSettings.userConfigInputField}
                      value={formData.section}
                      onChange={handleChange}
                      disabled={!isEditable}
                    >
                      <option value=''>Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
                
              </div>

              <div className={styleSettings.column}>

                <label htmlFor="currentPassword">Current Password:</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id='currentPassword' 
                  name='currentPassword'
                  className={styleSettings.userConfigInputField}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <label htmlFor="newPassword">New Password:</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id='newPassword' 
                  name='newPassword'
                  className={styleSettings.userConfigInputField}
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id='confirmPassword' 
                  name='confirmPassword'
                  className={styleSettings.userConfigInputField}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                
                <button 
                  type='button'
                  onClick={togglePasswordVisibility} 
                  className={styleSettings.showPasswordButton}
                  disabled={!isEditable}
                  
                >
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>
            </div>
            
            <div className={styleSettings.buttonContainer}>
              <button 
                type="submit" 
                className={styleSettings.saveButton}
                disabled={!isEditable || loadingUpdate}
              >
                {loadingUpdate ? (
                    <div className={styleSettings.loader}></div>
                  ) : (
                    "Save Changes"
                  )
                }
                
              </button>
            </div>
          </form>
          
          <button 
            onClick={toggleEditable} 
            className={`${styleSettings.editButton} ${isEditable ? styleSettings.cancel : ''}`}
            disabled={loadingUpdate}  // Disable the button while loading
          >
            {isEditable ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}
