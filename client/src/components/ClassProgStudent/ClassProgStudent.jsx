import styleCPS from './classProgStudent.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import backArrow from '../../assets/icons/back.png';
import deleteIcon from '../../assets/icons/delete.png';
import addIcon from '../../assets/icons/add.png';
import addIconB from '../../assets/icons/addB.png';
import debounce from 'lodash/debounce';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';
import { useState, useEffect, useCallback } from 'react';
import { usePath } from '../../utils/contexts/PathContext';
import { toast } from 'react-toastify';

import useGetClassProgramByIdStudent from '../../utils/hooks/classProgramHooks/useGetClassProgramByIdStudent';
import { useClassProgram } from '../../utils/contexts/ClassProgramProvider';

import useGetStudentsToClass from '../../utils/hooks/classProgramHooks/useGetStudentsToClassProg';
import useAddStudentToClassProg from '../../utils/hooks/classProgramHooks/useAddStudentToClassProg';
import useDeleteStudent from '../../utils/hooks/classProgramHooks/useDeleteStudent';
import useUploadFileStudentsToClassProgram from '../../utils/hooks/classProgramHooks/useUploadFileStudentsToClassProgram';

export function ClassProgStudent() {
  const { id } = useParams();
  const { selectedClassProgramId, setSelectedClassProgramId } = useClassProgram();

  const navigate = useNavigate();
  const { updatePath } = usePath();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Fetch class program data by ID
  const { classProgramStudents, error, refetch } = useGetClassProgramByIdStudent(selectedClassProgramId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const { students, errorStudent, loadingStudent } = useGetStudentsToClass(searchQuery);
  const { addStudent, isLoadingAddStudent, errorAddStudent } = useAddStudentToClassProg(selectedClassProgramId); 
  const { deleteStudent, isLoadingDeleteStudent, errorDeleteStudent } = useDeleteStudent(selectedClassProgramId);
  const [loadingStudentIds, setLoadingStudentIds] = useState(new Set());

  // Filter the students based on the search query
  const filteredStudents = classProgramStudents?.students?.filter((student) => {
    const fullName = `${student.first_name} ${student.middle_initial} ${student.last_name}`.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    return (
      student.schoolID.toLowerCase().includes(queryLower) ||  // Ensure schoolID is also converted to lower case
      fullName.includes(queryLower)
    );
  });

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

  // Reset state and refetch data when the route parameter changes
  useEffect(() => {
    if (id) {
      setSelectedClassProgramId(id);
    } else {
      setSelectedClassProgramId(null); // Reset ID if no ID in URL
    }
  }, [id, setSelectedClassProgramId]);

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

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setUploadModalOpen(false);
    setConfirmDeleteModalOpen(false);
  };

  const handleDownload = () => {
    let csvContent = 'schoolID,last_name,first_name,middle_initial\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_format_class_program_information.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = (studentId) => {
    console.log('Student ID to be deleted:', studentId); // Check the value here
    setSelectedStudentId(studentId); 
    setConfirmDeleteModalOpen(true); 
  };
  

  const handleDelete = async () => {
    if (!selectedStudentId) return;
  
    const result = await deleteStudent(selectedStudentId);
  
    if (result) {
      toast.success('Student deleted successfully');
      refetch(); 
      setConfirmDeleteModalOpen(false); 
    } else {
      toast.error('Failed to delete student');
    }
  };

  const handleAddStudentClick = async (student) => {
    // Update the loading state to show loader for this student
    setLoadingStudentIds((prev) => new Set(prev).add(student._id));
    
    const studentData = {
      schoolID: student.schoolID,
      last_name: student.last_name,
      first_name: student.first_name,
      middle_initial: student.middle_initial,
    };
    
    const updatedClassProgram = await addStudent(studentData);
    
    // Remove the student ID from loading state after adding
    setLoadingStudentIds((prev) => {
      const updated = new Set(prev);
      updated.delete(student._id);
      return updated;
    });
    
    if (updatedClassProgram) {
      toast.success('Student added successfully');
      refetch(); // Refresh the class program data
      setIsAddModalOpen(false);
    } else {
      toast.error('Failed to add student');
    }
  };

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const { uploadStudents, uploading, errorUpload } = useUploadFileStudentsToClassProgram(selectedClassProgramId);
  const [selectedFile, setSelectedFile] = useState(null);
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      toast.error('Only .csv files are allowed.');
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (selectedFile) {
      // console.log('Selected file:', selectedFile); // Log the selected file
      try {
        const result = await uploadStudents(selectedFile);
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


  return (
    <>
      <div className={isAddModalOpen || isUploadModalOpen || isConfirmDeleteModalOpen ? `${styleCPS.mainContainer} ${styleCPS.blurred}` : styleCPS.mainContainer}>
        <div className={styleCPS.searchBar}>
          <button
            onClick={() => {
              handleBackClick();
              handleBackView();
            }}
            className={styleCPS.backBtn}
            title='Go Back'
          >
            <img src={backArrow} className={styleCPS.backArrow} alt="Back" />
          </button>
          <input
            type="text"
            placeholder='Search Student...'
            className={styleCPS.searchInput}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button
            className={styleCPS.addBtn}
            onClick={handleAddClick}
          >
            <img src={addIcon} alt="" /> Add
          </button>
          <button
            className={styleCPS.addFile}
            onClick={handleUploadClick}
          >
            <img src={uploadIcon} alt="" /> Upload File
          </button>
          <button
            className={styleCPS.csvFormat}
            onClick={handleDownload}
          >
            <img src={download} alt="" /> CSV Format
          </button>
        </div>

        <div className={styleCPS.studentInfo}>
          {classProgramStudents && (
            <>
              <span className={styleCPS.spanContainer}>
                Department:
                <span className={styleCPS.spanContent}>
                  {classProgramStudents.department}
                </span>
              </span>
              <span className={styleCPS.spanContainer}>
                Subject:
                <span className={styleCPS.spanContent}>
                  {classProgramStudents.subject_code} - {classProgramStudents.subject_title}
                </span>
              </span>
              <span className={styleCPS.spanContainer}>
                Year Level:
                <span className={styleCPS.spanContent}>
                  {classProgramStudents.yearLevel}
                </span>
              </span>
              <span className={styleCPS.spanContainer}>
                Section:
                <span className={styleCPS.spanContent}>
                  {classProgramStudents.section}
                </span>
              </span>
              <span className={styleCPS.spanContainer}>
                Semester:
                <span className={styleCPS.spanContent}>
                  {classProgramStudents.semester}
                </span>
              </span>
              <span className={styleCPS.spanContainer}>
                Academic Year:
                <span className={styleCPS.spanContent}>
                  {classProgramStudents.academic_year}
                </span>
              </span>
            </>
          )}
        </div>

        <div className={styleCPS.tableContainer}>
          <table className={styleCPS.classInfoTable}>
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
              {filteredStudents?.length ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.schoolID}>
                    <td>{index + 1}</td>
                    <td>{student.schoolID}</td>
                    <td>{student.last_name}</td>
                    <td>{student.first_name}</td>
                    <td>{student.middle_initial}</td>
                    <td>
                      <button 
                        onClick={() => confirmDelete(student._id)} 
                        className={styleCPS.deleteBtn} 
                        disabled={isLoadingDeleteStudent} // Disable button while loading
                      >
                        <img src={deleteIcon} className={styleCPS.deleteImg} alt="Delete" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No students available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isAddModalOpen && (
          <div className={styleCPS.modalOverlay}>
            <div className={styleCPS.modal}>
              <h2>Select Student</h2>
              <input
                type="text"
                placeholder="Search Student..."
                className={styleCPS.searchInputAdd}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {loadingStudent ? (
                <p>Loading...</p>
              ) : (
                <div className={styleCPS.tableContainerModal}>
                  <table className={styleCPS.classInfoTable}>
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
                              className={styleCPS.addStudentBtn} 
                              onClick={() => handleAddStudentClick(student)}
                              disabled={loadingStudentIds.has(student._id)} // Disable button if loading
                            >
                              {loadingStudentIds.has(student._id) ? (
                                <div className={styleCPS.loader}></div> 
                              ) : (
                                <img src={addIconB} className={styleCPS.addStudentImg} alt="Add" />
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
              <div className={styleCPS.btnRow}>
                <button type="button" className={styleCPS.cancelBtn} onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        )}


        {isUploadModalOpen && (
          <div className={styleCPS.modalOverlay}>
            <div className={styleCPS.modal}>
              <h2>Upload CSV File</h2>
              <form onSubmit={handleUpload}>
                <div className={styleCPS.uploadInput}>
                  <label>Select File:</label>
                  <input type="file" accept=".csv" className={styleCPS.uploadField} onChange={handleFileChange} required/>
                  {error && <p className={styleCPS.error}>{error}</p>}
                </div>
                <div className={styleCPS.btnRow}>
                  <button type="button" className={styleCPS.cancelBtn} onClick={handleCloseModal}>Close</button>
                  <button type="submit" className={styleCPS.uploadBtn} disabled={uploading}>
                    {uploading ? (
                      <div className={styleCPS.loader}></div>
                      ) : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isConfirmDeleteModalOpen && (
          <div className={styleCPS.modalOverlay}>
            <div className={styleCPS.modal}>
              <h2>Confirm Deletion</h2>
              <h4>Are you sure you want to delete this student?</h4>
              <div className={styleCPS.buttonRow}>
                <button onClick={handleDelete} disabled={isLoadingDeleteStudent} className={styleCPS.confirmDeleteBtn}>
                  {isLoadingDeleteStudent ? (
                    <div className={styleCPS.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
                <button onClick={handleCloseModal} className={styleCPS.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
