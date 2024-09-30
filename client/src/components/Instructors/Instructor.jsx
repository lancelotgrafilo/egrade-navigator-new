import { useState, useCallback } from 'react';
import styleInstructor from './instructors.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import addIcon from '../../assets/icons/add.png';
import listIcon from '../../assets/icons/list.png';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import {toast} from 'react-toastify';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';
import { usePath } from '../../utils/contexts/PathContext';
import useFetchFacultyStaffs from '../../utils/hooks/facultyStaffHooks/useGetFacultyStaffs';
import useFacultySubmit from '../../utils/hooks/facultyStaffHooks/usePostFacultySubmit';
import useDeleteFacultyStaff from '../../utils/hooks/facultyStaffHooks/useDeleteFacultyStaff';
import usePostFacultyStaffUpload from '../../utils/hooks/facultyStaffHooks/usePostFacultyStaffUpload';

import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';

export function Instructor(){
  const [isAddFacultyStaff, setIsAddFacultyStaff] = useState(false);
  const navigate = useNavigate();
  const { updatePath } = usePath();
  
  const [searchQuery, setSearchQuery] = useState('');
  const {faculty, errorFaculty, facultyLoading, refetch} = useFetchFacultyStaffs(searchQuery);
  const { dataFaculty, handleChangeFaculty, handleSubmitFaculty, resetFacultyForm, isFacultyStaffLoading } = useFacultySubmit();
  const [submissionType, setSubmissionType] = useState(null);

  // DELETE
  const { deleteFacultyStaff, loadingDelete, errorDelete, } = useDeleteFacultyStaff();
  const [ facultyStaffToDelete, setFacultyStaffToDelete] = useState(null);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 100), 
    []
  );

  const handleSearchChange = (e) => {
    e.preventDefault();
    debouncedSearch(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Handle data submission based on type
      switch (submissionType) {
        
        case 'faculty':
          await handleSubmitFaculty();
          // setFaculty(response.data); // Update faculty state with latest data
          resetFacultyForm();
          break;
        default:
          toast.warn('Unknown submission type');
          return; // Exit early if the submission type is unknown
      }

    } catch (err) {
      console.error('Error during save process:', err);
      toast.error('Error during save process:', err);
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

  const handleInstructorsLoad = (id) => {
    if (id) {
      navigate(`/admin/instructors/instructors_load/${id}`);
      updatePath("Instructor's List", "Instructor's Load");
    } else {
      console.error("Instructor ID is undefined");
    }
  }

  const navigateStudentSubject = () => {
    navigate('/admin/instructors/instructors_load');
  };


  
  const openConfirmDeleteModal = (id) => {
    setFacultyStaffToDelete(id);
    setConfirmDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    try {
      await deleteFacultyStaff(facultyStaffToDelete);
      setConfirmDeleteModalOpen(false);
      setFacultyStaffToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete faculty staff:', error);
      toast.error('Failed to delete faculty staff. Please try again.');
    }
  };


  const handleAddFacultyStaffClick = () => {
    setSubmissionType("faculty");
    setIsAddFacultyStaff(true);
  };

  const handleCloseModal = () => {
    setIsAddFacultyStaff(false);
    setUploadModalOpen(false);
  };

  const handleDownload = () => {
    let csvContent = 'facultyID,last_name,first_name,middle_initial,department,contact_number,email\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty_staffs_format.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadFile, loading, error: uploadError } = usePostFacultyStaffUpload();
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      // console.log('Selected file:', selectedFile); // Log the selected file
      try {
        const result = await uploadFile(selectedFile);
        refetch();
        console.log('Upload successful:', result); // Log the successful upload
        setSelectedFile(null);
        handleCloseModal();
      } catch (error) {
        console.error('Upload failed:', error); // Log the upload failure
      }
    } else {
      toast.warn('Please select a file to upload.');
    }
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      toast.warn('Only .csv files are allowed.');
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const { departments } = useGetDepartments();

  if (errorFaculty) {
    return <p>Error fetching subjects: {errorFaculty.message}</p>; // Display error message if fetch fails
  }

  return (
    <div className={isAddFacultyStaff || isUploadModalOpen  ? `${styleInstructor.mainContainer} ${styleInstructor.blurred}` : styleInstructor.mainContainer}>
      <div className={styleInstructor.dashboardContent}>
        <div className={styleInstructor.searchBar}>
          <input 
            type="text" 
            placeholder='Search Instructor...'  
            className={styleInstructor.searchInput} 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className={styleInstructor.buttonContainer}>
            <button className={styleInstructor.addBtn} onClick={handleAddFacultyStaffClick}><img src={addIcon} alt="" />Add</button>
          </div>
          <button className={styleInstructor.addFile} 
            onClick={handleUploadClick}
          ><img src={uploadIcon} alt="" />Upload File</button>
          <button className={styleInstructor.csvFormat} 
            onClick={handleDownload}
          >
            <img src={download} alt="" /> CSV Format
          </button>
        </div>

        <div className={styleInstructor.tableContainer}>
          <table className={styleInstructor.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>ID</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Initial</th>
                <th>Contact Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {facultyLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : Array.isArray(faculty) && faculty.length > 0 ? (
                faculty.map((faculty) => {
                  return (
                    <tr key={faculty._id}>
                      <td>{faculty.originalFacultyStaff}</td>
                      <td>{faculty.department}</td>
                      <td>{faculty.facultyID}</td>
                      <td>{faculty.last_name}</td>
                      <td>{faculty.first_name}</td>
                      <td>{faculty.middle_initial}</td>
                      <td>{faculty.contact_number}</td>
                      <td>
                        <div className={styleInstructor.actionRow}>
                          <button onClick={() => {
                            navigateStudentSubject(1);
                            handleInstructorsLoad(faculty._id);
                          }} className={styleInstructor.listBtn}><img src={listIcon} alt="" className={styleInstructor.listImg} title="Instructor's Load" /></button>
                          <button onClick={() => openConfirmDeleteModal(faculty._id)} className={styleInstructor.deleteBtn}>
                            <img src={deleteIcon} className={styleInstructor.deleteImg} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {isAddFacultyStaff && (
          <div className={styleInstructor.modalOverlay}>
            <div className={styleInstructor.modal}>
              <h2>Add New Faculty Staff</h2>
              <form onSubmit={handleSave}>
                <div className={styleInstructor.editInput}>
                  <label>Email:</label>
                  <div className={styleInstructor.inputWithButton}>
                    <input 
                      id='email' 
                      name='email'
                      type='email' 
                      className={styleInstructor.editField} 
                      value={dataFaculty.email}
                      onChange={(e)=>{
                        handleChangeFaculty(e);
                      }}
                      required 
                    />
                  </div>
                </div>

                <div className={styleInstructor.editInput}>
                  <label>Faculty ID:</label>
                  <input 
                    type='text' 
                    className={styleInstructor.editField}
                    id='facultyID' 
                    name='facultyID'
                    value={dataFaculty.facultyID}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleInstructor.editInput}>
                  <label>Last Name:</label>
                  <input 
                    type='text' 
                    className={styleInstructor.editField}
                    id='last_name' 
                    name='last_name'
                    value={dataFaculty.last_name}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleInstructor.editInput}>
                  <label>First Name:</label>
                  <input 
                    type='text' 
                    className={styleInstructor.editField}
                    id='first_name' 
                    name='first_name'
                    value={dataFaculty.first_name}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleInstructor.editInput}>
                  <label>Middle Initial:</label>
                  <input 
                    type='text' 
                    className={styleInstructor.editField}
                    id="middle_initial"
                    name='middle_initial'
                    value={dataFaculty.middle_initial}
                    onChange={handleChangeFaculty}
                    required
                  />
                </div>

                <div className={styleInstructor.editInput}>
                  <label>Department:</label>
                  <select 
                    type='text' 
                    className={styleInstructor.editField}
                    id='department'
                    name='department'
                    value={dataFaculty.department}
                    onChange={handleChangeFaculty}
                    required
                  >
                    <option value=""></option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.department}>{dept.department}</option>
                    ))}
                  </select> 
                </div>

                <div className={styleInstructor.editInput}>
                  <label>Contact Number:</label>
                  <input 
                    type='number' 
                    className={styleInstructor.editField}
                    id='contact_number'
                    name='contact_number'
                    value={dataFaculty.contact_number}
                    onChange={handleChangeFacultyWithValidation }
                    pattern="\d{11}"
                    required
                  />
                </div>

                <div className={styleInstructor.btnRow}>
                  <button type="button" className={styleInstructor.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button 
                    type="submit" 
                    className={styleInstructor.saveBtn}
                    disabled={isFacultyStaffLoading}
                  >
                    {isFacultyStaffLoading ? (
                      <div className={styleInstructor.loader}></div> 
                    ) : (
                      "Save"
                    )
                  }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {isConfirmDeleteModalOpen && (
        <div className={styleInstructor.modalOverlay}>
          <div className={styleInstructor.modal}>
            <h2>Confirm Deletion</h2>
            <h4>Are you sure you want to delete this faculty staff?</h4>
            <div className={styleInstructor.buttonRow}>
              <button onClick={handleDelete} disabled={loadingDelete} className={styleInstructor.confirmDeleteBtn}>
                {loadingDelete ? (
                    <div className={styleInstructor.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )
                }
              </button>
              <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleInstructor.cancelBtn}>Cancel</button>
            </div>
            
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className={styleInstructor.modalOverlay}>
          <div className={styleInstructor.modal}>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleUpload}>
              <div className={styleInstructor.uploadInput}>
                <label>Select File:</label>
                <input type="file" accept=".csv" className={styleInstructor.uploadField} onChange={handleFileChange} />
              </div>
              <div className={styleInstructor.btnRow}>
                <button type="button" className={styleInstructor.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button type="submit" className={styleInstructor.uploadBtn} disabled={loading}>
                  {loading ? (
                    <div className={styleInstructor.loader}></div>
                    ) : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        
    </div>
  );
}