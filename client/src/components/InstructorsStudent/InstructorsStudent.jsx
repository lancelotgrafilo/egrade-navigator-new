import { useNavigate, useParams } from 'react-router-dom';
import styleInstructorsStudent from './instructorsStudent.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import backArrow from '../../assets/icons/back.png';
import { useState, useCallback } from 'react';
import addIcon from '../../assets/icons/add.png';
import addIconB from '../../assets/icons/addB.png';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';
import debounce from 'lodash/debounce';
import {toast} from 'react-toastify';
import { usePath } from '../../utils/contexts/PathContext';
import { useInstructorId } from '../../utils/contexts/InstructorIdProvider';
import useGetInstructorById from '../../utils/hooks/facultyStaffHooks/useGetInstructorById';
import useGetStudentsToClass from '../../utils/hooks/classProgramHooks/useGetStudentsToClassProg';
import useAddStudentToCInstructorsStudents from '../../utils/hooks/facultyStaffHooks/useAddStudentToInstructorsStudents';
import useDeleteStudent from '../../utils/hooks/facultyStaffHooks/useDeleteStudent';
import useUploadCSV from '../../utils/hooks/facultyStaffHooks/useUploadCSV';

export function InstructorsStudent() {
  const {loadId} = useParams();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const { updatePath } = usePath();
  const { previousInstructorId } = useInstructorId();
  
  const { instructor, loading, errorInstructor, refetchInstructor } = useGetInstructorById(previousInstructorId);
  // Update this line based on the format of _id
  const loadItem = instructor?.load?.find((load) => {
    // Check if _id is a string or an object with $oid
    if (typeof load._id === 'object' && load._id.$oid) {
      return load._id.$oid === loadId;
    }
    return load._id === loadId;
  });

  // Ensure handleBackClick and handleDelete are not causing re-renders
  const handleBackClick = () => {
    navigate(`/admin/instructors/instructors_load/${previousInstructorId}`);
    updatePath("Instructor's List", "Instructor's Load");
  };

  const { addStudent, isLoadingAddStudent, errorAddStudent } = useAddStudentToCInstructorsStudents(previousInstructorId, loadId);
  const [searchQuery, setSearchQuery] = useState('');
  const { students, errorStudent, loadingStudent } = useGetStudentsToClass(searchQuery);
  const [loadingStudentIds, setLoadingStudentIds] = useState(new Set());
  const handleAddClick = (e) => {
    e.preventDefault();
    setIsAddModalOpen(true);
  }

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

  const handleAddStudentClick = async (student) => {
    // Update the loading state to show loader for this student
    setLoadingStudentIds((prev) => {
      const updated = new Set(prev);
      updated.add(student._id);
      return updated;
    });
  
    const studentData = {
      schoolID: student.schoolID,
      last_name: student.last_name,
      first_name: student.first_name,
      middle_initial: student.middle_initial,
    };
  
    try {
      const updateInstructorsLoadStudents = await addStudent(studentData);
  
      // Remove the student ID from loading state after adding
      setLoadingStudentIds((prev) => {
        const updated = new Set(prev);
        updated.delete(student._id);
        return updated;
      });
  
      if (updateInstructorsLoadStudents) {
        toast.success('Student added successfully');
        refetchInstructor(); // Refresh the data to show the updated load
        setIsAddModalOpen(false); // Close the modal if you use one
      } else {
        toast.error('Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
  
      setLoadingStudentIds((prev) => {
        const updated = new Set(prev);
        updated.delete(student._id);
        return updated;
      });
    }
  };
  
  
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const { deleteStudent, isLoadingDeleteStudent, errorDeleteStudent } = useDeleteStudent();
  
  const handleDelete = async () => {
    if (!selectedStudentId || !loadId || !previousInstructorId) return;

    const result = await deleteStudent(previousInstructorId, loadId, selectedStudentId);

    if (result) {
      toast.success('Student deleted successfully');
      refetchInstructor(); // Refresh the data to show the updated load
      setConfirmDeleteModalOpen(false); 
    } else {
      toast.error('Failed to delete student');
    }
  };

  const confirmDelete = (studentId) => {
    // console.log('Student ID to be deleted:', studentId); // Check the value here
    setSelectedStudentId(studentId); 
    setConfirmDeleteModalOpen(true); 
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setIsAddModalOpen(false);
    setConfirmDeleteModalOpen(false);
    setUploadModalOpen(false);
  };

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const { uploadCSV, uploading } = useUploadCSV();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      console.log('Selected file:', selectedFile); // Log the selected file
      try {
        const result = await uploadCSV(selectedFile, previousInstructorId, loadId);
        refetchInstructor();
        toast.success('Upload successful'); // Log the successful upload
        setSelectedFile(null);
        handleCloseModal();
      } catch (error) {
        console.error('Upload failed:', error); // Log the upload failure
        toast.error("Upload failed");
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
      setError('Only .csv files are allowed.');
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setError('');
    }
  };
  
  const handleDownload = () => {
    let csvContent = 'schoolID,last_name,first_name,middle_initial\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "student_format_instructor's_load.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter students based on search query and selected load
  const filteredStudents = loadItem && loadItem.students
  ? loadItem.students.filter((student) =>
      `${student.schoolID} ${student.last_name} ${student.first_name} ${student.middle_initial}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    )
  : [];


  //TODO search bar function
  //todo add x
  //todo upload x
  //todo download x

  return (
    <div className={isEditModalOpen || isAddModalOpen || isConfirmDeleteModalOpen || isUploadModalOpen ? `${styleInstructorsStudent.mainContainer} ${styleInstructorsStudent.blurred}` : styleInstructorsStudent.mainContainer}>
      <div className={styleInstructorsStudent.dashboardContent}>
          <div className={styleInstructorsStudent.searchBar}>
            <button onClick={handleBackClick} className={styleInstructorsStudent.backBtn}>
              <img src={backArrow} className={styleInstructorsStudent.backArrow} alt="Back" />
            </button>

            <input 
              type="text" 
              placeholder='Search Student...' 
              className={styleInstructorsStudent.searchInput} 
              value={searchQuery}
              onChange = {handleSearchChange}
            />
            <button 
              className={styleInstructorsStudent.addBtn}  
              onClick={(e) => {
                handleAddClick(e);
              }}
            >
              <img src={addIcon} alt="" />Add
            </button>
            <button 
              className={styleInstructorsStudent.addFile} 
              onClick={handleUploadClick}
            >
              <img src={uploadIcon} alt="" />Upload File
            </button>
            <button 
              className={styleInstructorsStudent.csvFormat} 
              onClick={handleDownload}
            >
              <img src={download} alt="" /> CSV Format
            </button>
          </div>

          <div className={styleInstructorsStudent.infoBar}>
            <div className={styleInstructorsStudent.instructorInfo}>
              <div className={styleInstructorsStudent.infoH2}>
                <h2>Subject: </h2>
                <h2>Section: </h2>
                <h2>Semester: </h2>
                <h2>AY: </h2>
              </div>

              {loadItem ? (
                <div className={styleInstructorsStudent.infoSpan}>
                  <span>{loadItem.subject_code} {loadItem.subject_title}</span>
                  <span>{loadItem.section}</span>
                  <span>{loadItem.semester}</span>
                  <span>{loadItem.academic_year}</span>
                </div>
              ) : (
                <div className={styleInstructorsStudent.infoSpan}>
                  <span>N/A</span>
                  <span>N/A</span>
                  <span>N/A</span>
                  <span>N/A</span>
                </div>
              )}

            </div>
          </div>
          
        

          <div className={styleInstructorsStudent.tableContainer}>
            <table className={styleInstructorsStudent.classInfoTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Last Name</th>
                  <th>First Name</th>
                  <th>Middle Initial</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : errorInstructor ? (
                <tr>
                  <td colSpan="6">Error: {errorInstructor}</td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{student.schoolID}</td>
                    <td>{student.last_name}</td>
                    <td>{student.first_name}</td>
                    <td>{student.middle_initial}</td>
                    <td>
                      <button
                        className={styleInstructorsStudent.deleteBtn}
                        onClick={() => confirmDelete(student._id)}
                        disabled={isLoadingDeleteStudent && selectedStudentId === student._id} // Disable if currently deleting this student
                      >
                        {isLoadingDeleteStudent && selectedStudentId === student._id ? 'Deleting...' : <img className={styleInstructorsStudent.deleteImg} src={deleteIcon} alt="Delete" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No students found.</td>
                </tr>
              )}
              </tbody>
            </table>
          </div>


        {isUploadModalOpen && (
          <div className={styleInstructorsStudent.modalOverlay}>
            <div className={styleInstructorsStudent.modal}>
              <h2>Upload CSV File</h2>
              <form onSubmit={handleUpload}>
                <div className={styleInstructorsStudent.uploadInput}>
                  <label>Select File:</label>
                  <input type="file" accept=".csv" className={styleInstructorsStudent.uploadField} onChange={handleFileChange} />
                  {error && <p className={styleInstructorsStudent.error}>{error}</p>}
                </div>
                <div className={styleInstructorsStudent.btnRow}>
                  <button type="button" className={styleInstructorsStudent.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button type="submit" className={styleInstructorsStudent.uploadBtn} disabled={uploading}>
                    {uploading ? (
                      <div className={styleInstructorsStudent.loader}></div>
                      ) : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddModalOpen && (
          <div className={styleInstructorsStudent.modalOverlay}>
            <div className={styleInstructorsStudent.modal}>
              <h2>Select Student</h2>
              <input
                type="text"
                placeholder="Search Student..."
                className={styleInstructorsStudent.searchInputAdd}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {loadingStudent ? (
                <p>Loading...</p>
              ) : (
                <div className={styleInstructorsStudent.tableContainerModal}>
                  <table className={styleInstructorsStudent.classInfoTable}>
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(students) && students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student._id}>
                          <td>{student.schoolID}</td>
                          <td>
                            <span>{student.last_name}</span>, 
                            <span> {student.first_name}</span>, 
                            <span> {student.middle_initial}</span>
                          </td>
                          <td>
                            <button 
                              className={styleInstructorsStudent.addStudentBtn} 
                              onClick={() => handleAddStudentClick(student)}
                              disabled={loadingStudentIds.has(student._id)} // Disable button if loading
                            >
                              {loadingStudentIds.has(student._id) ? (
                                <div className={styleInstructorsStudent.loader}></div> 
                              ) : (
                                <img src={addIconB} className={styleInstructorsStudent.addStudentImg} alt="Add" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No students found</td>
                      </tr>
                    )}

                    </tbody>
                  </table>
                </div>
              )}
              <div className={styleInstructorsStudent.btnRow}>
                <button type="button" className={styleInstructorsStudent.cancelBtn} onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className={styleInstructorsStudent.modalOverlay}>
            <div className={styleInstructorsStudent.modal}>
              <h2>Edit Student</h2>
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <div className={styleInstructorsStudent.editInput}>
                  <label>Last Name:</label>
                  <input type="text" className={styleInstructorsStudent.editField} />
                </div>
                <div className={styleInstructorsStudent.editInput}>
                  <label>First Name:</label>
                  <input type="text" className={styleInstructorsStudent.editField} />
                </div>
                <div className={styleInstructorsStudent.editInput}>
                  <label>Middle Name:</label>
                  <input type="text" className={styleInstructorsStudent.editField} />
                </div>
                <div className={styleInstructorsStudent.btnRow}>
                  <button type="button" className={styleInstructorsStudent.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button type="submit" className={styleInstructorsStudent.saveBtn}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {isConfirmDeleteModalOpen && (
          <div className={styleInstructorsStudent.modalOverlay}>
            <div className={styleInstructorsStudent.modal}>
              <h2>Confirm Deletion</h2>
              <h4>Are you sure you want to delete this student?</h4>
              <div className={styleInstructorsStudent.buttonRow}>
                <button onClick={handleDelete} disabled={isLoadingDeleteStudent} className={styleInstructorsStudent.confirmDeleteBtn}>
                  {isLoadingDeleteStudent ? (
                    <div className={styleInstructorsStudent.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
                <button onClick={handleCloseModal} className={styleInstructorsStudent.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
