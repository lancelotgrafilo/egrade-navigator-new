import styleSettings from './settings.module.css';
import axios from 'axios';
import { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import userProfile from "../../assets/icons/user_icon.png"
import { jwtDecode } from 'jwt-decode'; 
import verifiedIcon from '../../assets/icons/verified.png';

import useGetAdminDetails from '../../utils/hooks/adminHooks/useGetAdminDetails'
import useUpdateAdminDetails from '../../utils/hooks/adminHooks/useUpdateAdminDetails'

import useGetCollegeStaffDetails from '../../utils/hooks/collegeStaffHooks/useGetCollegeStaffDetails';
import useUpdateCollegeStaffDetails from '../../utils/hooks/collegeStaffHooks/useUpdateCollegeStaffDetails';
import useEmailConfirmReg from '../../utils/hooks/usePostEmailConfirmReg';

import useDepartments from '../../utils/hooks/departmentHooks/useDepartment';
import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';

import useAcademicYears from '../../utils/hooks/academicYearHooks/useAcademicYears';
import usePostAcademicYears from '../../utils/hooks/academicYearHooks/usePostAcademicYears';

import useYearLevels from '../../utils/hooks/yearLevelHooks/useYearLevels';
import usePostYearLevels from '../../utils/hooks/yearLevelHooks/usePostYearLevels';

import useSections from '../../utils/hooks/sectionHooks/useSections';
import usePostSections from '../../utils/hooks/sectionHooks/usePostSections';

import useSemester from '../../utils/hooks/semesterHooks/useSemester';
import usePostSemesters from '../../utils/hooks/semesterHooks/usePostSemester';

import useCurriculumEffectiveYear from '../../utils/hooks/curriculumHooks/useCurriculumEffectiveYear';
import usePostCurriculumEffectiveYear from "../../utils/hooks/curriculumHooks/usePostCurriculumEffectiveYear";

export function Settings() {
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    ID: '',
    last_name: '',
    first_name: '',
    middle_initial: '',
    email: '',
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
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const token = localStorage.getItem('token');
  let userId = '';
  let userTitle = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
      userTitle = decodedToken.title;
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { userDetails, loading: loadingDetails, refetch } = useGetAdminDetails(userId);
  const { collegeStaffUserDetails } = useGetCollegeStaffDetails(userId);

  const { updateAdminDetails, loading: loadingUpdate, error } = useUpdateAdminDetails();
  const { updateCollegeStaffDetails } = useUpdateCollegeStaffDetails();

  let currentUserDetails = null;

  if (userTitle === 'admin' && userDetails) {
    currentUserDetails = userDetails;
  } else if (userTitle === 'college_staff' && collegeStaffUserDetails) {
    currentUserDetails = collegeStaffUserDetails;
  }

  // Update formData and profileImage based on the current user's details
  useEffect(() => {
    if (currentUserDetails && Object.keys(currentUserDetails).length > 0) {
      // console.log('Current User Details:', currentUserDetails);
      const backendUrl = 'http://localhost:5000';
      const fullProfileImageUrl = currentUserDetails.user_profile
        ? `${backendUrl}${currentUserDetails.user_profile.startsWith('/uploads') ? '' : '/uploads/user-profiles/'}${currentUserDetails.user_profile}`
        : userProfile;
      setProfileImage(fullProfileImageUrl);
      setFormData({
        ID: currentUserDetails.ID || '',
        last_name: currentUserDetails.last_name || '',
        first_name: currentUserDetails.first_name || '',
        middle_initial: currentUserDetails.middle_initial || '',
        email: currentUserDetails.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [currentUserDetails]);
  

  const validatePasswords = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return false;
    }
    return true;
  };

  const validateCurrentPassword = async () => {
    let endpoint = '';
  
    // Determine the correct API endpoint based on userTitle
    if (userTitle === 'admin') {
      endpoint = '/api/validate-current-password-admin';
    } else if (userTitle === 'college_staff') {
      endpoint = '/api/validate-current-password-college-staff';
    }
  
    try {
      const response = await axios.post(endpoint, { 
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
  
  const validatePasswordFormat = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate new password format
    if (!validatePasswordFormat(formData.newPassword)) {
      toast.error('New password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
      return;
    }
  
    // Validate new password and confirm password
    if (!validatePasswords()) return;
  
    // Validate current password
    const currentPasswordValid = await validateCurrentPassword();
    if (!currentPasswordValid) return;
  
    // Prepare form data
    const formDataObj = new FormData();
    formDataObj.append('ID', formData.ID);
    formDataObj.append('last_name', formData.last_name);
    formDataObj.append('first_name', formData.first_name);
    formDataObj.append('middle_initial', formData.middle_initial);
    formDataObj.append('email', formData.email);
  
    // Add passwords only if provided
    if (formData.currentPassword) {
      formDataObj.append('currentPassword', formData.currentPassword);
    }
    if (formData.newPassword) {
      formDataObj.append('newPassword', formData.newPassword);
    }
  
    // Add profile image if provided
    if (fileInputRef.current.files[0]) {
      formDataObj.append('user_profile', fileInputRef.current.files[0]);
    }
  
    try {
      // Check userTitle to decide which update function to call
      if (userTitle === 'admin') {
        await updateAdminDetails(userId, formDataObj);
      } else if (userTitle === 'college_staff') {
        await updateCollegeStaffDetails(userId, formDataObj);
      } else {
        toast.error('Invalid user title. Unable to update details.');
        return;
      }
  
      toast.success('User details updated successfully');
      refetch(); // Refetch user details after successful update
      setIsEditable(false); // Disable editing after save
      window.location.reload();
    } catch (err) {
      toast.error('Failed to update user details');
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
      // Ensure currentUserDetails is available and has an email
    if (!currentUserDetails || !currentUserDetails.email) {
      toast.error('User details not loaded. Please try again.');
      return;
    }

    // Check if the entered email matches the current user's email
    if (dataEmail.email !== currentUserDetails.email) {
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
  

  if(loadingDetails){
    <div className={styleSettings.loader}></div>
  }

  const [modalType, setModalType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { addDepartments, isLoading: isDepartmentLoading, addDepartment } = useDepartments();
  const [departmentName, setDepartmentName] = useState('');

  const { academicYear, isLoadingAY, addAcademicYear } = usePostAcademicYears();
  const [newAcademicYear, setNewAcademicYear] = useState('');

  const { yearLevel, isLoadingYL, addYearLevel } = usePostYearLevels();
  const [newYearLevel, setNewYearLevel] = useState('');

  const { section, isLoadingSections, addSection } = usePostSections();
  const [newSection, setNewSection] = useState('');

  const { semester, isLoadingSem, addSemester } = usePostSemesters();
  const [newSemester, setNewSemester] = useState('');

  const { isLoadingCurriculum, addCurriculum } = usePostCurriculumEffectiveYear();
  const [newCurriculum, setNewCurriculum] = useState("");

  const { departments } = useGetDepartments();
  const { academicYears } = useAcademicYears();
  const { yearLevels } = useYearLevels();
  const { sections } = useSections();
  const { semesters } = useSemester();
  const { curriculumEffectiveYear } = useCurriculumEffectiveYear();

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setDepartmentName('');
    setNewAcademicYear('');
    setNewYearLevel('');
    setNewSection('');
    setNewSemester('');
    setNewCurriculum('');
  };

  // Handle Save function
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'department') {
        await addDepartment({ departmentName });
        toast.success('Department added successfully');
      } else if (modalType === 'academicYear') {
        await addAcademicYear({ academicYear: newAcademicYear });
        toast.success('Academic Year added successfully');
      } else if (modalType === 'yearLevel') {
        await addYearLevel({ yearLevel: newYearLevel });
        toast.success('Year Level added successfully');
      } else if (modalType === 'section') {
        await addSection({ section: newSection });
        toast.success('Section added successfully');
      } else if (modalType === 'semester') {
        await addSemester({ semester: newSemester });
        toast.success('Semester added successfully');
      } else if (modalType === 'curriculum') {
        console.log(newCurriculum);
        await addCurriculum( newCurriculum );
        toast.success('Curriculum added successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save data');
    }
  };


  return (
    <div className={modalOpen ? `${styleSettings.mainContainer} ${styleSettings.blurred}` : styleSettings.mainContainer}>

      {loadingUpdate && <p>Updating user details...</p>}
      {error && <p className={styleSettings.errorMessage}>Error: {error.message}</p>}
      {currentUserDetails ? (
        currentUserDetails?.isVerified ? (
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

      <div className={styleSettings.btnRows}>
        <button className={styleSettings.addBtn} onClick={() => handleOpenModal('department')}>
          Add Department
        </button>
        <button className={styleSettings.addBtn} onClick={() => handleOpenModal('academicYear')}>
          Add Academic Year
        </button>
        <button className={styleSettings.addBtn} onClick={() => handleOpenModal('yearLevel')}>
          Add Year Level
        </button>
        <button className={styleSettings.addBtn} onClick={() => handleOpenModal('section')}>
          Add Section
        </button>
        <button className={styleSettings.addBtn} onClick={() => handleOpenModal('semester')}>
          Add Semester
        </button>
        <button className={styleSettings.addBtn} onClick={() => handleOpenModal('curriculum')}>
          Add Curriculum Effective Year
        </button>
      </div>

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
                <label htmlFor="ID">ID:</label>
                <input 
                  type="text"
                  name='ID' 
                  id='ID' 
                  className={styleSettings.userConfigInputField}
                  placeholder='ID:'
                  value={formData.ID}
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
                
                <label htmlFor="middle_initial">Middle Initial:</label>
                <input 
                  type="text"
                  name='middle_initial' 
                  id='middle_initial'
                  className={styleSettings.userConfigInputField}
                  placeholder='Middle Initial:'
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

        {modalOpen && (
          <div className={styleSettings.modalOverlay}>
            <div className={styleSettings.modal}>

              {/* Display existing data in table format */}
              {modalType === 'department' && (
                <div>
                  <h3>Current Departments</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments?.map((dept) => (
                        <tr key={dept._id}>
                          <td>{dept.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <label>Add Department:</label>
                  <input
                    className={styleSettings.editField}
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === 'academicYear' && (
                <div>
                  <h3>Current Academic Years</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academicYears?.map((year) => (
                        <tr key={year._id}>
                          <td>{year.ay}</td>
                        </tr>
                      ))} 
                    </tbody>
                  </table>
                  <label>New Academic Year:</label>
                  <input
                    className={styleSettings.editField}
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === 'yearLevel' && (
                <div>
                  <h3>Current Year Levels</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Year Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearLevels?.map((level) => (
                        <tr key={level._id}>
                          <td>{level.yearLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <label>New Year Level:</label>
                  <input
                    className={styleSettings.editField}
                    value={newYearLevel}
                    onChange={(e) => setNewYearLevel(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === 'section' && (
                <div>
                  <h3>Current Sections</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections?.map((section) => (
                        <tr key={section._id}>
                          <td>{section.section}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <label>New Section:</label>
                  <input
                    className={styleSettings.editField}
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === 'semester' && (
                <div>
                  <h3>Current Semesters</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesters?.map((semester) => (
                        <tr key={semester._id}>
                          <td>{semester.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <label>New Semester:</label>
                  <input
                    className={styleSettings.editField}
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === 'curriculum' && (
                <div>
                  <h3>Curriculums</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Curriculums</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curriculumEffectiveYear?.map((curriculum) => (
                        <tr key={curriculum._id}>
                          <td>{curriculum.curriculum_effective_year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <label>New Curriculum Effective Year:</label>
                  <input
                    className={styleSettings.editField}
                    value={newCurriculum}
                    onChange={(e) => setNewCurriculum(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className={styleSettings.btnRow}>
                <button type="button" className={styleSettings.cancelBtn} onClick={handleCloseModal}>
                  Close
                </button>
                <button type="submit" className={styleSettings.saveBtn} onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
  );

  
}