import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

import styleCPI from './classProgInstructor.module.css';
import backArrow from '../../assets/icons/back.png';
import addIcon from '../../assets/icons/add.png';
import addIconB from '../../assets/icons/addB.png';
import deleteIcon from '../../assets/icons/delete.png';

import { usePath } from '../../utils/contexts/PathContext';
import useGetFacultyToClassProg from '../../utils/hooks/facultyStaffHooks/useGetFacultyToClassProg';
import useGetClassProgramById from '../../utils/hooks/classProgramHooks/useGetClassProgramById';
import { useClassProgram } from '../../utils/contexts/ClassProgramProvider';
import useAddInstructorToClassProg from '../../utils/hooks/classProgramHooks/useAddInstructorToClassProg';
import useDeleteInstructor from '../../utils/hooks/classProgramHooks/useDeleteInstructor';

export function ClassProgInstructor() {
  const { id } = useParams();
  const { selectedClassProgramId, setSelectedClassProgramId } = useClassProgram();
  const navigate = useNavigate();
  const { updatePath } = usePath();

  // Reset state and refetch data when the route parameter changes
  useEffect(() => {
    if (id) {
      setSelectedClassProgramId(id);
    } else {
      setSelectedClassProgramId(null); // Reset ID if no ID in URL
    }
  }, [id, setSelectedClassProgramId]);

  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false); // State for confirmation modal
  const [selectedInstructorId, setSelectedInstructorId] = useState(null); // Store selected instructor ID for deletion

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { classProgramInstructor, errorInstructor, refetchClassProgram } = useGetClassProgramById(selectedClassProgramId);
  const [searchQuery, setSearchQuery] = useState('');
  const { faculty, errorFaculty, loadingFaculty } = useGetFacultyToClassProg(searchQuery);
  const { addInstructor, isLoadingAddInstructor, errorAddInstructor } = useAddInstructorToClassProg(selectedClassProgramId); 
  const { deleteInstructor, isLoading: isLoadingDeleteInstructor, error: errorDeleteInstructor } = useDeleteInstructor(selectedClassProgramId); 
  const [loadingInstructorIds, setLoadingInstructorIds] = useState(new Set());
  
  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    e.preventDefault();
    debouncedSearch(e.target.value);
  };

  const handleBackClick = () => {
    setSelectedClassProgramId(null); // Reset ID when navigating back
    navigate('/admin/classProgramInformation');
  };

  const handleBackView = () => {
    updatePath("Class Program Information");
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const confirmDelete = (instructorId) => {
    setSelectedInstructorId(instructorId); // Set the instructor ID to delete
    setConfirmDeleteModalOpen(true); // Open the confirmation modal
  };

  const handleDelete = async () => {
    if (!selectedInstructorId) return;

    const result = await deleteInstructor(selectedInstructorId);

    if (result) {
      toast.success('Instructor deleted successfully');
      refetchClassProgram(); // Refresh the class program data
      setConfirmDeleteModalOpen(false); // Close the confirmation modal
    } else {
      toast.error('Failed to delete instructor');
    }
  };

  const handleAddInstructorClick = async (facultyMember) => {
  // Update the loading state to show loader for this student
  setLoadingInstructorIds((prev) => new Set(prev).add(facultyMember._id));

    const instructorData = {
      facultyID: facultyMember.facultyID,
      last_name: facultyMember.last_name,
      first_name: facultyMember.first_name,
      middle_initial: facultyMember.middle_initial,
    };
  
    const updatedClassProgram = await addInstructor(instructorData);
  
    // Remove the student ID from loading state after adding
    setLoadingInstructorIds((prev) => {
      const updated = new Set(prev);
      updated.delete(facultyMember._id);
      return updated;
    });
    
    if (updatedClassProgram) {
      toast.success('Instructor added successfully' );
      refetchClassProgram(); // Refresh the class program data
      setIsAddModalOpen(false);
    } else {
      toast.error('Failed to add instructor');
    }
  };

  return (
    <>
      <div className={isAddModalOpen ? `${styleCPI.mainContainer} ${styleCPI.blurred}` : styleCPI.mainContainer}>
        <div className={styleCPI.searchBar}>
          <button
            onClick={() => {
              handleBackClick();
              handleBackView();
            }}
            className={styleCPI.backBtn}
          >
            <img src={backArrow} className={styleCPI.backArrow} alt="Back" />
          </button>

          <button
            className={styleCPI.addBtn}
            onClick={(e) => {
              e.preventDefault();
              handleAddClick();
            }}
          >
            <img src={addIcon} alt="Add" /> Add
          </button>
        </div>

        <div className={styleCPI.tableContainer}>
          <table className={styleCPI.classInfoTable}>
            <thead>
              <tr>
                <th>SUBJECT</th>
                <th>INSTRUCTOR</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classProgramInstructor?.instructor?.length ? (
                classProgramInstructor.instructor.map((instructor) => (
                  <tr key={instructor._id}>
                    <td>{classProgramInstructor.subject_code} - {classProgramInstructor.subject_title}</td>
                    <td>
                      <span>{instructor.facultyID} </span>
                      <span>{instructor.last_name}</span>, 
                      <span> {instructor.first_name}</span>, 
                      <span> {instructor.middle_initial}</span>
                    </td>
                    <td>
                      <button 
                        onClick={() => confirmDelete(instructor._id)} 
                        className={styleCPI.deleteBtn} 
                        disabled={isLoadingDeleteInstructor} // Disable button while loading
                      >
                        <img src={deleteIcon} className={styleCPI.deleteImg} alt="Delete" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No instructors available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isAddModalOpen && (
          <div className={styleCPI.modalOverlay}>
            <div className={styleCPI.modal}>
              <h2>Select Instructor</h2>
              <input
                type="text"
                placeholder="Search Instructor..."
                className={styleCPI.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {loadingFaculty ? (
                <p>Loading...</p>
              ) : (
                <div className={styleCPI.tableContainerAdd}>
                  <table className={styleCPI.classInfoTableAdd}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>INSTRUCTOR</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(faculty) && faculty.length > 0 ? (
                        faculty.map((facultyMember) => (
                          <tr key={facultyMember._id}>
                            <td>{facultyMember.facultyID}</td>
                            <td>
                              <span>{facultyMember.last_name}</span>, 
                              <span> {facultyMember.first_name}</span>, 
                              <span> {facultyMember.middle_initial}</span>
                            </td>
                            <td>
                              <button 
                                className={styleCPI.addInstructorBtn} 
                                onClick={() => handleAddInstructorClick(facultyMember)}
                                disabled={loadingInstructorIds.has(facultyMember._id)}
                              >
                                {loadingInstructorIds.has(facultyMember._id) ? (
                                  <div className={styleCPI.loader}></div> 
                                ) : (
                                  <img src={addIconB} className={styleCPI.addInstructorImg} alt="Add" />
                                )}
                                
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No instructors found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className={styleCPI.btnRow}>
                <button type="button" className={styleCPI.cancelBtn} onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isConfirmDeleteModalOpen && (
          <div className={styleCPI.modalOverlay}>
            <div className={styleCPI.modal}>
              <h2>Confirm Deletion</h2>
              <h4>Are you sure you want to delete this instructor?</h4>
              <div className={styleCPI.buttonRow}>
                <button onClick={handleDelete} disabled={isLoadingDeleteInstructor} className={styleCPI.confirmDeleteBtn}>
                  {isLoadingDeleteInstructor ? (
                    <div className={styleCPI.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
                <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleCPI.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
