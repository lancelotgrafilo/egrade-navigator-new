import React, { useState } from 'react';
import { useGetAllUsers } from '../../utils/hooks/usersListHooks/useGetAllUsers';
import styleUsers from './usersList.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createRipple } from '../../utils/effects/ripple'

import useAdminSubmit from "../../utils/hooks/adminHooks/usePostAdminSubmit";
import useCollegeSubmit from '../../utils/hooks/usePostCollegeSubmit';
import useFacultySubmit from '../../utils/hooks/facultyStaffHooks/usePostFacultySubmit';

export function UsersList() {
  const { users, loading, error, refetch } = useGetAllUsers();
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [userTypeToDelete, setUserTypeToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const openConfirmDeleteModal = (id, userType) => {
    setUserIdToDelete(id);
    setUserTypeToDelete(userType);
    setConfirmDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await delay(100);
      await axios.delete(`https://egrade-backend.onrender.com/api/delete_user/${userTypeToDelete}/${userIdToDelete}`);
      refetch();
      toast.success("Successfully Deleted User");
      setConfirmDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filterUsers = (userList) => {
    return userList.filter((user) =>
      user.ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.middle_initial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };


  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [isCollegeModalOpen, setCollegeModalOpen] = useState(false);
  const [isFacultyModalOpen, setFacultyModalOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState(null);


  const { dataAdmin, handleChangeAdmin, handleSubmitAdmin, resetAdminForm, isAdminLoading } = useAdminSubmit();
  const { dataCollege, handleChangeCollege, handleSubmitCollegeStaff, resetCollegeForm, isCollegeStaffLoading } = useCollegeSubmit();
  const { dataFaculty, handleChangeFaculty, handleSubmitFaculty, resetFacultyForm, isFacultyStaffLoading } = useFacultySubmit();

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Handle data submission based on type
      switch (submissionType) {
        case 'admin':
          await handleSubmitAdmin();
          resetAdminForm();
          break;
        case 'college':
          await handleSubmitCollegeStaff();
          resetCollegeForm();
          break;
        case 'faculty':
          await handleSubmitFaculty();
          resetFacultyForm();
          break;
        default:
          toast.warn('Unknown submission type');
          return; // Exit early if the submission type is unknown
      }
      refetch();
    } catch (err) {

      console.error('Error during save process:', err);
      toast.error('Error during save process:', err);
      
    } 
    
  };

  const handleAddAdminClick = () => {
    setSubmissionType('admin');
    setAdminModalOpen(true);
  };

  const handleAddCollegeClick = () => {
    setSubmissionType('college');
    setCollegeModalOpen(true);
  };

  const handleAddFacultyClick = () => {
    setSubmissionType('faculty');
    setFacultyModalOpen(true);
  };

  const handleCloseModal = () => {
    setAdminModalOpen(false);
    setCollegeModalOpen(false);
    setFacultyModalOpen(false);

    // Reset specific form states
    if (submissionType === 'admin') {
      // Reset admin form fields
      resetAdminForm();
    } else if (submissionType === 'college') {
      // Reset college form fields
      resetCollegeForm();
    } else if (submissionType === 'faculty') {
      // Reset faculty form fields
      resetFacultyForm();
    }
  };

  const handleChangeFacultyWithValidation = (e) => {
    if (e.target.name === 'contact_number') {
      const value = e.target.value;
      if (value.length > 11) {
        toast.warn('Contact number must be exactly 11 digits.');
        return;
      }
    }
    handleChangeFaculty(e);
  };


  // Calculate total users count
  const totalUsers = (users.admins.length || 0) +
                      (users.collegeStaff.length || 0) +
                      (users.registrarStaff.length || 0) +
                      (users.facultyStaff.length || 0);
                      
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styleUsers.mainContainer}>
      <div className={styleUsers.searchBar}>
        <input 
          type="text" 
          placeholder='Search User...'  
          className={styleUsers.searchInput} 
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className={styleUsers.buttonContainer}>
          <button type='button' className={styleUsers.addNewUserBtn} onClick={handleAddAdminClick}>
            Admin
          </button>
          <button type='button' className={styleUsers.addNewUserBtn} onClick={handleAddCollegeClick}>
            College Staff
          </button>
          <button type='button' className={styleUsers.addNewUserBtn} onClick={handleAddFacultyClick}>
            Faculty Staff
          </button>
        </div>
        
      </div>

      <div className={styleUsers.totalUsers}>
        <p>Total Users: {totalUsers}</p>
      </div>

      <div className={styleUsers.tableContainer}>
        <table className={styleUsers.classInfoTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Middle Initial</th>
              <th>Title</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filterUsers(users.admins).map((user) => (
              <tr key={user._id}>
                <td>{user.ID}</td>
                <td>{user.last_name}</td>
                <td>{user.first_name}</td>
                <td>{user.middle_initial}</td>
                <td>{user.title}</td>
                <td>
                  <button 
                    onClick={() => openConfirmDeleteModal(user._id, 'admin')} 
                    className={styleUsers.deleteBtn}
                  >
                    <img src={deleteIcon} className={styleUsers.deleteImg} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}

            {filterUsers(users.collegeStaff).map((user) => (
              <tr key={user._id}>
                <td>{user.ID}</td>
                <td>{user.last_name}</td>
                <td>{user.first_name}</td>
                <td>{user.middle_initial}</td>
                <td>{user.title}</td>
                <td>
                  <button 
                    onClick={() => openConfirmDeleteModal(user._id, 'collegeStaff')} 
                    className={styleUsers.deleteBtn}
                  >
                    <img src={deleteIcon} className={styleUsers.deleteImg} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}

            {filterUsers(users.registrarStaff).map((user) => (
              <tr key={user._id}>
                <td>{user.ID}</td>
                <td>{user.last_name}</td>
                <td>{user.first_name}</td>
                <td>{user.middle_initial}</td>
                <td>{user.title}</td>
                <td>
                  <button 
                    onClick={() => openConfirmDeleteModal(user._id, 'registrarStaff')} 
                    className={styleUsers.deleteBtn}
                  >
                    <img src={deleteIcon} className={styleUsers.deleteImg} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}

            {filterUsers(users.facultyStaff).map((user) => (
              <tr key={user._id}>
                <td>{user.ID}</td>
                <td>{user.last_name}</td>
                <td>{user.first_name}</td>
                <td>{user.middle_initial}</td>
                <td>{user.title}</td>
                <td>
                  <button 
                    onClick={() => openConfirmDeleteModal(user._id, 'facultyStaff')} 
                    className={styleUsers.deleteBtn}
                  >
                    <img src={deleteIcon} className={styleUsers.deleteImg} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>


        </table>
      </div>

      {isAdminModalOpen && 
        <div className={styleUsers.modalOverlay}>
          <div className={styleUsers.modal}>
            <h2>Add New Admin</h2>
            <form onSubmit={handleSave}>
              <div className={styleUsers.editInput}>
                <label>Email:</label>
                <div className={styleUsers.inputWithButton}>
                  <input 
                    id='email' 
                    name='email'
                    type='email'  
                    className={styleUsers.editField} 
                    value={dataAdmin.email}
                    onChange={(e) => {
                      handleChangeAdmin(e);
                    }}
                    required
                  />
                </div>
              </div>
              
              <div className={styleUsers.editInput}>
                <label>Last Name:</label>
                <input 
                  type='text' 
                  className={styleUsers.editField}
                  id='last_name' 
                  name='last_name'
                  value={dataAdmin.last_name}
                  onChange={handleChangeAdmin}
                  required
                />
              </div>

              <div className={styleUsers.editInput}>
                <label>First Name:</label>
                <input 
                  type='text' 
                  className={styleUsers.editField}
                  id='first_name' 
                  name='first_name'
                  value={dataAdmin.first_name}
                  onChange={handleChangeAdmin}
                  required
                />
              </div>

              <div className={styleUsers.editInput}>
                <label>Middle initial:</label>
                <input 
                  type='text' 
                  className={styleUsers.editField}
                  id='middle_initial' 
                  name='middle_initial'
                  value={dataAdmin.middle_initial}
                  onChange={handleChangeAdmin}
                  required
                />
              </div>

              <div className={styleUsers.btnRow}>
                <button type="button" className={styleUsers.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button 
                  type="submit" 
                  className={styleUsers.saveBtn}
                  onClick={(e) => createRipple(e, styleUsers)}
                  disabled={isAdminLoading}
                >
                  {isAdminLoading ? (
                      <div className={styleUsers.loader}></div> 
                    ) : (
                      "Save"
                    )
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      {isCollegeModalOpen && 
        <div className={styleUsers.modalOverlay}>
          <div className={styleUsers.modal}>
            <h2>Add New College Staff</h2>
            <form onSubmit={handleSave}>
              <div className={styleUsers.editInput}>
                <label>Email:</label>
                <div className={styleUsers.inputWithButton}>
                  <input 
                    id='email' 
                    name='email'
                    type='email' 
                    className={styleUsers.editField} 
                    value={dataCollege.email}
                    onChange={(e)=> {
                      handleChangeCollege(e);
                    }}
                    required 
                  />
                </div>
              </div>

              <div className={styleUsers.editInput}>
                <label>Last Name:</label>
                <input 
                  type='text' 
                  className={styleUsers.editField}
                  id='last_name' 
                  name='last_name'
                  value={dataCollege.last_name}
                  onChange={handleChangeCollege}
                  required 
                />
              </div>

              <div className={styleUsers.editInput}>
                <label>First Name:</label>
                <input 
                  type='text' 
                  className={styleUsers.editField}
                  id='first_name' 
                  name='first_name'
                  value={dataCollege.first_name}
                  onChange={handleChangeCollege}
                  required 
                />
              </div>

              <div className={styleUsers.editInput}>
                <label>Middle Initial:</label>
                <input 
                  type='text' 
                  className={styleUsers.editField}
                  id='middle_initial' 
                  name='middle_initial'
                  value={dataCollege.middle_initial}
                  onChange={handleChangeCollege}
                  required
                />
              </div>

              <div className={styleUsers.btnRow}>
                <button type="button" className={styleUsers.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button 
                  type="submit" 
                  className={styleUsers.saveBtn}
                  onClick={(e) => createRipple(e, styleUsers)}
                  disabled={isCollegeStaffLoading}
                >
                  {isCollegeStaffLoading ? (
                      <div className={styleUsers.loader}></div> 
                    ) : (
                      "Save"
                    )
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

        {isFacultyModalOpen && 
          <div className={styleUsers.modalOverlay}>
            <div className={styleUsers.modal}>
              <h2>Add New Faculty Staff</h2>
              <form onSubmit={handleSave}>
                <div className={styleUsers.editInput}>
                  <label>Email:</label>
                  <div className={styleUsers.inputWithButton}>
                    <input 
                      id='email' 
                      name='email'
                      type='email' 
                      className={styleUsers.editField} 
                      value={dataFaculty.email}
                      onChange={(e)=>{
                        handleChangeFaculty(e);
                      }}
                      required 
                    />
                   
                  </div>
                </div>

                <div className={styleUsers.editInput}>
                  <label>Faculty ID:</label>
                  <input 
                    type='text' 
                    className={styleUsers.editField}
                    id='facultyID' 
                    name='facultyID'
                    value={dataFaculty.facultyID}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleUsers.editInput}>
                  <label>Last Name:</label>
                  <input 
                    type='text' 
                    className={styleUsers.editField}
                    id='last_name' 
                    name='last_name'
                    value={dataFaculty.last_name}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleUsers.editInput}>
                  <label>First Name:</label>
                  <input 
                    type='text' 
                    className={styleUsers.editField}
                    id='first_name' 
                    name='first_name'
                    value={dataFaculty.first_name}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleUsers.editInput}>
                  <label>Middle Initial:</label>
                  <input 
                    type='text' 
                    className={styleUsers.editField}
                    id="middle_initial"
                    name='middle_initial'
                    value={dataFaculty.middle_initial}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleUsers.editInput}>
                  <label>Specialization:</label>
                  <select 
                    type='text' 
                    className={styleUsers.editField}
                    id='specialization'
                    name='specialization'
                    value={dataFaculty.specialization}
                    onChange={handleChangeFaculty}
                    required
                  >
                    <option value=""></option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIS">BSIS</option>
                  </select> 
                </div>

                <div className={styleUsers.editInput}>
                  <label>Contact Number:</label>
                  <input 
                    type='number' 
                    className={styleUsers.editField}
                    id='contact_number'
                    name='contact_number'
                    value={dataFaculty.contact_number}
                    onChange={handleChangeFacultyWithValidation }
                    pattern="\d{11}"
                    required
                  />
                </div>

                <div className={styleUsers.btnRow}>
                  <button type="button" className={styleUsers.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button 
                    type="submit" 
                    className={styleUsers.saveBtn}
                    onClick={(e) => createRipple(e, styleUsers)}
                    disabled={isFacultyStaffLoading}
                  >
                    {isFacultyStaffLoading ? (
                      <div className={styleUsers.loader}></div> 
                    ) : (
                      "Save"
                    )
                  }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

      {isConfirmDeleteModalOpen && (
        <div className={styleUsers.modalOverlay}>
          <div className={styleUsers.modal}>
            <h2>Confirm Deletion</h2>
            <h4>Are you sure you want to delete this user?</h4>
            <div className={styleUsers.buttonRow}>
              <button onClick={handleDelete} disabled={loadingDelete} className={styleUsers.confirmDeleteBtn}>
                {loadingDelete ? (
                  <div className={styleUsers.loader}></div> 
                ) : (
                  "Yes, Delete"
                )}
              </button>
              <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleUsers.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
