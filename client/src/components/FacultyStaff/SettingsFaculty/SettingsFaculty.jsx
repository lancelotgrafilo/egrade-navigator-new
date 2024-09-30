import styleSettings from './settingsFaculty.module.css';
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode'; 
import userProfile from "../../../assets/icons/user_icon.png";
import useGetFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';
import useUpdateFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useUpdateFacultyDetails';
import axios from 'axios';

import verifiedIcon from '../../../assets/icons/verified.png';
import useEmailConfirmReg from '../../../utils/hooks/usePostEmailConfirmReg';

import useGetDepartments from '../../../utils/hooks/departmentHooks/useGetDepartments';

export function SettingsFaculty() {
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    facultyID: '',
    last_name: '',
    first_name: '',
    middle_initial: '',
    email: '',
    department: '',
    contact_number: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  
  const { departments } = useGetDepartments();


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
      await axios.post('/api/update-verification-status', { userId });
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
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit facultyID to 5 characters
    if (name === 'facultyID' && value.length > 6) {
        toast.warn('Faculty ID must not exceed 5 characters.');
        return; // Prevent further changes if the limit is exceeded
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

  const { userDetails, loading: loadingDetails, refetch } = useGetFacultyDetails(userId);
  const { updateFacultyDetails, loading: loadingUpdate, error } = useUpdateFacultyDetails();

  

  useEffect(() => {
    if (userDetails) {
      const backendUrl = 'http://localhost:5000';
      const fullProfileImageUrl = userDetails.user_profile
        ? `${backendUrl}${userDetails.user_profile.startsWith('/uploads') ? '' : '/uploads/user-profiles/'}${userDetails.user_profile}`
        : userProfile;
      setProfileImage(fullProfileImageUrl);
      setFormData({
        facultyID: userDetails.facultyID || '',
        last_name: userDetails.last_name || '',
        first_name: userDetails.first_name || '',
        middle_initial: userDetails.middle_initial || '',
        email: userDetails.email || '',
        department: userDetails.department || '',
        contact_number: userDetails.contact_number || '',
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
      const response = await axios.post('/api/validate-current-password-facultyStaff', { 
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

  const validateNewPassword = (password) => {
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRequirements.test(password);
};

  const formatFacultyID = (id) => {
    const regex = /^[A-Z]{2}-\d{3}$/; // Regex for format "AB-001"
    if (regex.test(id)) {
        return id; // Already in the correct format
    }
    
    // If the ID doesn't match, format it. For example, you can create a new one.
    const parts = id.split('-');
    const prefix = (parts[0] || "").toUpperCase().substring(0, 2); // Get the first two uppercase letters
    const numberPart = parts[1] ? parts[1].padStart(3, '0') : '001'; // Get the last part, padded to 3 digits
    
    return `${prefix}-${numberPart}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate new password and confirm password
    if (!validatePasswords()) return;

    // Validate new password strength
    if (!validateNewPassword(formData.newPassword)) {
        toast.error('New password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.');
        return;
    }

    // Format facultyID
    formData.facultyID = formatFacultyID(formData.facultyID);

    // Validate current password
    const currentPasswordValid = await validateCurrentPassword();
    if (!currentPasswordValid) return;

    // Prepare form data
    const formDataObj = new FormData();
    formDataObj.append('facultyID', formData.facultyID);
    formDataObj.append('last_name', formData.last_name);
    formDataObj.append('first_name', formData.first_name);
    formDataObj.append('middle_initial', formData.middle_initial);
    formDataObj.append('email', formData.email);
    formDataObj.append('department', formData.department);
    formDataObj.append('contact_number', formData.contact_number);

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
      await updateFacultyDetails(userId, formDataObj);
      toast.success('User details updated successfully');
      
      refetch();  // Refetch user details after successful update
      setIsEditable(false);  // Disable editing after save
    } catch (err) {
      toast.error('Failed to update user details');
    }
  };


  
  return (
    <div className={styleSettings.mainContainer}>
      {loadingUpdate && <p>Updating user details...</p>}
      {error && <p className={styleSettings.errorMessage}>Error: {error.message}</p>}
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
                    disabled={loadingVerify || !enteredCode}
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
                <label htmlFor="facultyID">Faculty ID:</label>
                <input 
                  type="text"
                  name='facultyID' 
                  id='facultyID' 
                  className={styleSettings.userConfigInputField}
                  placeholder='Faculty ID:'
                  value={formData.facultyID}
                  onChange={handleChange}
                  disabled={!isEditable}
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
                
                <label htmlFor="middle_initial">Middle Name:</label>
                <input 
                  type="text"
                  name='middle_initial' 
                  id='middle_initial'
                  className={styleSettings.userConfigInputField}
                  placeholder='Middle Name:'
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
                
                <label htmlFor="department">Department:</label>
                <select 
                  name='department'
                  id='department' 
                  className={styleSettings.userConfigInputField}
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditable}
                >
                  <option value=''>Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept.department}>{dept.department}</option>
                  ))}
                </select>
                
                <label htmlFor="contact_number">Contact Number:</label>
                <input 
                  type="number"
                  name='contact_number' 
                  id='contact_number'
                  className={styleSettings.userConfigInputField}
                  placeholder='Contact Number:'
                  value={formData.contact_number}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
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
