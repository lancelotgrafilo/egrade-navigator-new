import {useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styleStudentSubject from './studentSubject.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import backArrow from '../../assets/icons/back.png';
import addIcon from '../../assets/icons/add.png';
import {toast} from 'react-toastify';

import useGetStudentById from '../../utils/hooks/studentHooks/useGetStudentById';
import usePostAddStudentSubject from '../../utils/hooks/studentHooks/usePostAddStudentSubject';
import useDeleteStudentSubject from '../../utils/hooks/studentHooks/useDeleteStudentSubject';

export function StudentSubject() { 
  const navigate = useNavigate();
  const { id: studentId } = useParams();

  
  const handleBackClick = () => {
    navigate('/admin/students');
  };

  const { studentById, loading, errorStudentById, refetch } = useGetStudentById(studentId);

  const {
    dataStudentSubject,
    handleChangeStudentSubject,
    handleSubmitStudentSubject,
    resetStudentSubjectForm,
    isStudentSubjectLoading
  } = usePostAddStudentSubject(studentId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  }
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Include facultyID in the data sent to the backend
    await handleSubmitStudentSubject({
      ...dataStudentSubject,
      _id: studentId // Ensure this ID is not null or undefined
    });
  
    resetStudentSubjectForm();
    refetch();
  };

  const { deleteStudentSubject, loadingDelete } = useDeleteStudentSubject();
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteStudentSubject(subjectToDelete);
      setConfirmDeleteModalOpen(false);
      setSubjectToDelete(null);
      refetch(); // Refresh student data after deletion
    } catch (error) {
      console.error('Failed to delete student subject:', error);
      toast.error('Failed to delete student subject. Please try again.');
    }
  };

  const openConfirmDeleteModal = (id) => {
    setSubjectToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  return (
    <div className={styleStudentSubject.mainContainer}>

      <div className={styleStudentSubject.dashboardContent}>
        <div className={styleStudentSubject.searchBarContainer}>
          <div className={styleStudentSubject.searchBar}>
            <button onClick={handleBackClick} className={styleStudentSubject.backBtn}>
              <img src={backArrow} className={styleStudentSubject.backArrow} alt="Back"/>
            </button>
            
            <button
              className={styleStudentSubject.addBtn}
              onClick={(e) => {
                e.preventDefault();
                handleAddClick();
              }}
            >
              <img src={addIcon} alt="Add" /> Add
            </button>
          </div>
          
          <div className={styleStudentSubject.subjectInfo}>
            <div className={styleStudentSubject.infoH2}>
              <h2>Student ID:</h2>
              <h2>Complete Name:</h2>
            </div>

            <div className={styleStudentSubject.infoSpan}>
              <span>{studentById?.schoolID || 'Loading...'}</span>
              <span>{`${studentById?.first_name || ''} ${studentById?.middle_name || ''} ${studentById?.last_name || ''}`}</span>
            </div>
          </div>
        </div>

        <div className={styleStudentSubject.tableContainer}>
          <table className={styleStudentSubject.classInfoTable}>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Semester</th>
                <th>AY</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentById?.grades?.flatMap(grade => grade.subjects)?.map((subject) => (
                <tr key={subject._id?.$oid}>
                  <td>{subject.subject_code}</td>
                  <td>{subject.subject_title || 'N/A'}</td>
                  <td>{grade.semester}</td> {/* Assuming semester is consistent across subjects */}
                  <td>{grade.academic_year}</td> {/* Assuming academic year is consistent */}
                  <td>
                    <button onClick={() => openConfirmDeleteModal(subject._id?.$oid)} className={styleStudentSubject.deleteBtn}>
                      <img src={deleteIcon} className={styleStudentSubject.deleteImg} alt="Delete"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {isAddModalOpen && (
          <div className={styleStudentSubject.modalOverlay}>
            <div className={styleStudentSubject.modal}>
              <h2>Add Student&apos;s Subject</h2>
              <form onSubmit={handleSave}>
                <div className={styleStudentSubject.editInput}>
                  <label>Subject Code:</label>
                  <input 
                    className={styleStudentSubject.editField}
                    name="subject_code"
                    value={dataStudentSubject.subject_code}
                    onChange={handleChangeStudentSubject}
                    required
                  />  
                  
                </div>
                <div className={styleStudentSubject.editInput}>
                  <label>Subject Title:</label>
                  <input 
                    type='text' 
                    className={styleStudentSubject.editField}
                    name="subject_title"
                    value={dataStudentSubject.subject_title}
                    onChange={handleChangeStudentSubject}
                    required
                  />
                </div>
                
                <div className={styleStudentSubject.editInput}>
                  <label>Instructor:</label>
                  <input 
                    type='text' 
                    className={styleStudentSubject.editField}
                    name="instructor"
                    value={dataStudentSubject.instructor}
                    onChange={handleChangeStudentSubject}
                    required
                  />
                </div>

                <div className={styleStudentSubject.editInput}>
                  <label>Semester:</label>
                  <select 
                    className={styleStudentSubject.editField}
                    name="semester"
                    value={dataStudentSubject.semester}
                    onChange={handleChangeStudentSubject}
                    required
                  >
                    <option></option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div className={styleStudentSubject.editInput}>
                  <label>Academic Year:</label>
                  <select 
                    className={styleStudentSubject.editField}
                    name="academic_year"
                    value={dataStudentSubject.academic_year}
                    onChange={handleChangeStudentSubject}
                    required
                  >
                    <option></option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
                <div className={styleStudentSubject.btnRow}>
                  <button type="button" className={styleStudentSubject.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button type="submit" className={styleStudentSubject.saveBtn} disabled={isStudentSubjectLoading}>
                    {isStudentSubjectLoading ? (
                        <div className={styleStudentSubject.loader}></div> 
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
          <div className={styleStudentSubject.modalOverlay}>
            <div className={styleStudentSubject.modal}>
              <h2>Confirm Deletion</h2>
              <h4>Are you sure you want to delete this Student&apos;s Subject?</h4>
              <div className={styleStudentSubject.buttonRow}>
                <button onClick={handleDelete} disabled={loadingDelete} className={styleStudentSubject.confirmDeleteBtn}>
                  {loadingDelete ? (
                      <div className={styleStudentSubject.loader}></div> 
                    ) : (
                      "Yes, Delete"
                    )
                  }
                </button>
                <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleStudentSubject.cancelBtn}>Cancel</button>
              </div>
              
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
