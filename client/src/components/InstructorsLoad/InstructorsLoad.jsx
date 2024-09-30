import { useEffect, useState } from "react";
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import styleInstructorsLoad from './instructorsLoad.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import backArrow from '../../assets/icons/back.png';
import addIcon from '../../assets/icons/add.png';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';
import {toast} from 'react-toastify';
import { usePath } from '../../utils/contexts/PathContext';

import { useInstructorId } from '../../utils/contexts/InstructorIdProvider';
import useGetInstructorById from '../../utils/hooks/facultyStaffHooks/useGetInstructorById'
import usePostInstructorsLoad from '../../utils/hooks/facultyStaffHooks/usePostInstructorsLoad';
import useDeleteInstructorsLoad from '../../utils/hooks/facultyStaffHooks/useDeleteInstructorsLoad';
import usePostInstructorsLoadUpload from '../../utils/hooks/facultyStaffHooks/usePostInstructorsLoadUpload';

export function InstructorsLoad() { 

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigate = useNavigate();
  const { updatePath } = usePath();

  const { id } = useParams(); // Retrieve faculty ID from URL
  const { selectedInstructorId, setSelectedInstructorId, updateInstructorIds } = useInstructorId();

  useEffect(() => {
    if (id) {
      updateInstructorIds(id);
    } else {
      updateInstructorIds(null);
    }
  }, [id, updateInstructorIds]);
  

  const { instructor, errorInstructor, refetchInstructor } = useGetInstructorById(selectedInstructorId);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  }

  const {
    dataInstructorsLoad,
    handleChangeInstructorsLoad,
    handleSubmitInstructorsLoad,
    resetInstructorsLoadForm,
    isInstructorsLoadLoading
  } = usePostInstructorsLoad(selectedInstructorId);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Include facultyID in the data sent to the backend
    await handleSubmitInstructorsLoad({
      ...dataInstructorsLoad,
      _id: selectedInstructorId, // Ensure this ID is not null or undefined
    });
  
    resetInstructorsLoadForm();
    refetchInstructor();
  };


  const { uploadFile, loading, error } = usePostInstructorsLoadUpload(selectedInstructorId);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      console.log('Selected file:', selectedFile); // Log the selected file
      try {
        const result = await uploadFile(selectedFile);
        refetchInstructor();
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
      toast.error('Only .csv files are allowed.');
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleDownload = () => {
    let csvContent = 'subject_code,subject_title,course,year,section,semester,academic_year\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Instructor's_Load_format.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleInstructorsSubjectStudents = () => {
    updatePath("Instructor's List", "Instructor's Load / Subject Students");
  }

  const handleBackView = () => {
    updatePath("Instructor's List");
  }

  const { deleteInstructorsLoad, loadingDelete } = useDeleteInstructorsLoad();
  const [instructorsLoadToDelete, setInstructorsLoadToDelete] = useState(null);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await deleteInstructorsLoad(instructorsLoadToDelete);
      setConfirmDeleteModalOpen(false);
      setInstructorsLoadToDelete(null);
      refetchInstructor();
    } catch (error) {
      console.error('Failed to delete class program:', error);
      toast.error('Failed to delete class program. Please try again.');
    }
  };

  const openConfirmDeleteModal = (id) => {
    setInstructorsLoadToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  const handleBackClick = () => {
    navigate('/admin/instructors');
    updateInstructorIds(null);
    
  };

  const navigateInstructorsStudent = (loadId) => {
    navigate(`/admin/instructors/instructors_load/${selectedInstructorId}/instructors_student/${loadId}`);
  };
  

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setUploadModalOpen(false);
  }

  return (
    <div className={isAddModalOpen ? `${styleInstructorsLoad.mainContainer} ${styleInstructorsLoad.blurred}` : styleInstructorsLoad.mainContainer}>
    
      <div className={styleInstructorsLoad.dashboardContent}>

        <div className={styleInstructorsLoad.searchBarContainer}>
          <div className={styleInstructorsLoad.searchBar}>
            <button onClick={() => {
              handleBackClick();
              handleBackView();
            }} className={styleInstructorsLoad.backBtn}>
              <img src={backArrow} className={styleInstructorsLoad.backArrow} alt="Back"/>
            </button>

            <button
              className={styleInstructorsLoad.addBtn}
              onClick={(e) => {
                e.preventDefault();
                handleAddClick();
              }}
            >
              <img src={addIcon} alt="Add" /> Add
            </button>
            
            <button className={styleInstructorsLoad.addFile} onClick={handleUploadClick}><img src={uploadIcon} alt="" />Upload File</button>
            <button className={styleInstructorsLoad.csvFormat} onClick={handleDownload}>
              <img src={download} alt="" /> CSV Format
            </button>
          </div>
          
          <div className={styleInstructorsLoad.instructorInfo}>
            <div className={styleInstructorsLoad.infoH2}>
              <h2>Instructor&apos;s ID:</h2>
              <h2>Complete Name:</h2>
            </div>

            <div className={styleInstructorsLoad.infoSpan}>
              <span>
                {instructor?.facultyID || "N/A"}
              </span>

              <span>
                {instructor ? `${instructor.first_name} ${instructor.middle_initial} ${instructor.last_name}` : "N/A"}
              </span>
            </div>
              
          </div>
        </div>

        <div className={styleInstructorsLoad.tableContainer}>
          <table className={styleInstructorsLoad.classInfoTable}>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Students</th>
                <th>Course</th>
                <th>Year</th>
                <th>Section</th>
                <th>Semester</th>
                <th>Academic <br/> Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(instructor?.load) && instructor.load.map((load) => (
                <tr key={load._id}>
                  <td>{load.subject_code}</td>
                  <td>{load.subject_title}</td>
                  <td>
                    <button className={styleInstructorsLoad.viewBtn} onClick={() => {
                      navigateInstructorsStudent(load._id);
                      handleInstructorsSubjectStudents();
                    }}>
                      View
                    </button>
                  </td>
                  <td>{load.course}</td>
                  <td>{load.year}</td>
                  <td>{load.section}</td>
                  <td>{load.semester}</td>
                  <td>{load.academic_year}</td>
                  <td>
                    <button
                      className={styleInstructorsLoad.deleteBtn}
                      onClick={() => openConfirmDeleteModal(load._id)}
                    >
                      <img src={deleteIcon} className={styleInstructorsLoad.deleteImg} alt="Delete"/>
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {isAddModalOpen && (
          <div className={styleInstructorsLoad.modalOverlay}>
            <div className={styleInstructorsLoad.modal}>
              <h2>Add Class Program</h2>
              <form onSubmit={handleSave}>
                <div className={styleInstructorsLoad.editInput}>
                  <label>Subject Code:</label>
                  <input 
                    className={styleInstructorsLoad.editField}
                    name="subject_code"
                    value={dataInstructorsLoad.subject_code}
                    onChange={handleChangeInstructorsLoad}
                    required
                  />  
                  
                </div>
                <div className={styleInstructorsLoad.editInput}>
                  <label>Subject Title:</label>
                  <input 
                    type='text' 
                    className={styleInstructorsLoad.editField}
                    name="subject_title"
                    value={dataInstructorsLoad.subject_title}
                    onChange={handleChangeInstructorsLoad}
                    required
                  />
                </div>
                
                <div className={styleInstructorsLoad.editInput}>
                  <label>Course:</label>
                  <select 
                    type='text' 
                    className={styleInstructorsLoad.editField}
                    name="course"
                    value={dataInstructorsLoad.course}
                    onChange={handleChangeInstructorsLoad}
                    required
                  >
                    <option></option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIS">BSIS</option>
                  </select>
                </div>

                <div className={styleInstructorsLoad.editInput}>
                  <label>Year:</label>
                  <select 
                    type='text' 
                    className={styleInstructorsLoad.editField}
                    name="year"
                    value={dataInstructorsLoad.year}
                    onChange={handleChangeInstructorsLoad}
                    required
                  >
                    <option></option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div className={styleInstructorsLoad.editInput}>
                  <label>Section:</label>
                  <select 
                    type='text' 
                    className={styleInstructorsLoad.editField}
                    name="section"
                    value={dataInstructorsLoad.section}
                    onChange={handleChangeInstructorsLoad}
                    required
                  >
                    <option></option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className={styleInstructorsLoad.editInput}>
                  <label>Semester:</label>
                  <select 
                    className={styleInstructorsLoad.editField}
                    name="semester"
                    value={dataInstructorsLoad.semester}
                    onChange={handleChangeInstructorsLoad}
                    required
                  >
                    <option></option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div className={styleInstructorsLoad.editInput}>
                  <label>Academic Year:</label>
                  <select 
                    className={styleInstructorsLoad.editField}
                    name="academic_year"
                    value={dataInstructorsLoad.academic_year}
                    onChange={handleChangeInstructorsLoad}
                    required
                  >
                    <option></option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
                <div className={styleInstructorsLoad.btnRow}>
                  <button type="button" className={styleInstructorsLoad.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button type="submit" className={styleInstructorsLoad.saveBtn} disabled={isInstructorsLoadLoading}>
                    {isInstructorsLoadLoading ? (
                        <div className={styleInstructorsLoad.loader}></div> 
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

        {isUploadModalOpen && (
          <div className={styleInstructorsLoad.modalOverlay}>
            <div className={styleInstructorsLoad.modal}>
              <h2>Upload CSV File</h2>
              <form onSubmit={handleUpload}>
                <div className={styleInstructorsLoad.uploadInput}>
                  <label>Select File:</label>
                  <input type="file" accept=".csv" className={styleInstructorsLoad.uploadField} onChange={handleFileChange} />
                  {error && <p className={styleInstructorsLoad.error}>{error}</p>}
                </div>
                <div className={styleInstructorsLoad.btnRow}>
                  <button type="button" className={styleInstructorsLoad.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button type="submit" className={styleInstructorsLoad.uploadBtn} disabled={loading}>
                    {loading ? (
                      <div className={styleInstructorsLoad.loader}></div>
                      ) : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isConfirmDeleteModalOpen && (
          <div className={styleInstructorsLoad.modalOverlay}>
            <div className={styleInstructorsLoad.modal}>
              <h2>Confirm Deletion</h2>
              <h4>Are you sure you want to delete this Instructor&apos;s Load?</h4>
              <div className={styleInstructorsLoad.buttonRow}>
                <button onClick={handleDelete} disabled={loadingDelete} className={styleInstructorsLoad.confirmDeleteBtn}>
                  {loadingDelete ? (
                      <div className={styleInstructorsLoad.loader}></div> 
                    ) : (
                      "Yes, Delete"
                    )
                  }
                </button>
                <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleInstructorsLoad.cancelBtn}>Cancel</button>
              </div>
              
            </div>
          </div>
        )}


        <Outlet />
      </div>
    </div>
  );
}
