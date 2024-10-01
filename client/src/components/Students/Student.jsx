import { useState, useCallback, useEffect } from 'react';
import styleStudent from './students.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import addIcon from '../../assets/icons/add.png';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';
import { useParams } from 'react-router-dom';
import {toast} from 'react-toastify';
// import { usePath } from '../../utils/contexts/PathContext';

import useFetchStudents from '../../utils/hooks/studentHooks/useGetStudents';
import useDeleteStudent from '../../utils/hooks/studentHooks/useDeleteStudent';
import usePostStudentSubmit from '../../utils/hooks/studentHooks/usePostStudentSubmit';
import usePostStudentsUpload from '../../utils/hooks/studentHooks/usePostStudentsUpload';
import debounce from 'lodash/debounce';
import { usePath } from '../../utils/contexts/PathContext';
import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';
import useGetColleges from '../../utils/hooks/collegeHooks/useGetColleges';
import useYearLevels from '../../utils/hooks/yearLevelHooks/useYearLevels';
import useSections from '../../utils/hooks/sectionHooks/useSections';
import useCurriculumEffectiveYear from '../../utils/hooks/curriculumHooks/useCurriculumEffectiveYear';

export function Student() {
  const { id } = useParams();
  const { updatePath } = usePath();
  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [error, setError] = useState('');

  // DELETE
  const { deleteStudent, loadingDelete, errorDelete, } = useDeleteStudent();
  const [ studentToDelete, setStudentToDelete] = useState(null);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  
  const { 
    dataStudent,
    handleChangeStudent,
    handleSubmitStudent,
    resetStudentForm,
    isStudentLoading
  } = usePostStudentSubmit();

  const handleSave = async (e) => {
    e.preventDefault();
  
    const response = await handleSubmitStudent();
    
    if (response) {
      // Assuming the response is returned correctly from handleSubmitStudent
      if (response.status === 201) {
        resetStudentForm();
        refetch();
      } else {
        toast.error("Unexpected response status: " + response.status);
      }
    }
  };

  useEffect(() => {
    // Update the path when the component mounts or when the id changes
    updatePath('Students', id ? `Student ${id}` : ''); 
  }, [id, updatePath]);
  
  const handleAddClick = () => {
    setAddStudentModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setAddStudentModalOpen(false);
    setConfirmDeleteModalOpen(false);
    setUploadModalOpen(false);
  };
  

  const [searchQuery, setSearchQuery] = useState('');
  const { students, errorStudent, studentLoading, refetch } = useFetchStudents(searchQuery);
  

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

  const { uploadFile, loading, errorLoad } = usePostStudentsUpload();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.warn('Please select a file to upload.');
      return;
    }
  
    // Log the selected file for debugging
    //console.log('Selected file:', selectedFile);
  
    try {
      // Call the upload function with the selected file
      const result = await uploadFile(selectedFile);
  
      // Assuming refetch is to update the UI after the file upload
      refetch(); 
      
      // Log success message with the result of the upload
      console.log('Upload successful:', result); 
      
      // Reset the selected file after a successful upload
      setSelectedFile(null);
      
      // Close the modal (if applicable)
      handleCloseModal();
      
    } catch (error) {
      // Log the error object
      console.error('Upload failed:', error); 
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
  
      // Optionally, show a toast or UI message for upload failure
      toast.error('File upload failed. Please try again.');
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
    // Define the CSV content with a newline at the end
    const csvContent = 'schoolID,last_name,first_name,middle_initial,course,email,college,year,section,curriculum_effective_year\n';

    // Create a Blob with the CSV content and correct MIME type
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'student_format.csv');

    // Append the anchor to the body, click it to trigger the download, and remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the Object URL to free up memory
    URL.revokeObjectURL(url);
  };

  const openConfirmDeleteModal = (_id) => {
    setStudentToDelete(_id);
    setConfirmDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    try {
      await deleteStudent(studentToDelete);
      setConfirmDeleteModalOpen(false);
      setStudentToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete faculty staff:', error);
      toast.error('Failed to delete faculty staff. Please try again.');
    }
  };

  const { departments } = useGetDepartments();
  const { colleges } = useGetColleges();
  const { yearLevels } = useYearLevels();
  const { sections } = useSections();
  const { curriculumEffectiveYear } = useCurriculumEffectiveYear();

  if (errorStudent) {
    return <p>Error fetching data: {error.message}</p>; // Display error message if fetch fails
  }
  return (
    <div className={isAddStudentModalOpen || isConfirmDeleteModalOpen ? `${styleStudent.mainContainer} ${styleStudent.blurred}` : styleStudent.mainContainer}>

      <div className={styleStudent.dashboardContent}>
        <div className={styleStudent.searchBar}>  
          <input 
            type="text" 
            placeholder="Search Student..." 
            className={styleStudent.searchInput} 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className={styleStudent.buttonContainer}>
            <button className={styleStudent.addBtn} onClick={handleAddClick}>
              <img src={addIcon} alt="" />
              Add
            </button>
            <button className={styleStudent.addFile} onClick={handleUploadClick}>
              <img src={uploadIcon} alt="" />
              Upload File
            </button>
            <button className={styleStudent.csvFormat} onClick={handleDownload}>
              <img src={download} alt="" />
              CSV Format
            </button>
          </div>
        </div>

        <div className={styleStudent.tableContainer}>
          <table className={styleStudent.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Course</th>
                <th>Student ID</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Initial</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {studentLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    Loading...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    No Data Available
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.originalStudent}</td>
                    <td>{student.course}</td>
                    <td>{student.schoolID}</td>
                    <td>{student.last_name}</td>
                    <td>{student.first_name}</td>
                    <td>{student.middle_initial}</td>
                    <td>
                      <div className={styleStudent.actionRow}>
                        <button onClick={() => openConfirmDeleteModal(student._id)} className={styleStudent.deleteBtn}>
                          <img src={deleteIcon} className={styleStudent.deleteImg} alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {isAddStudentModalOpen && (
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modal}>
            <h2>Add Student</h2>
            <form onSubmit={handleSave}>
              <div className={styleStudent.addInput}>
                <label>Student ID:</label>
                <input 
                  type="text"
                  className={styleStudent.editField}
                  name="schoolID"
                  value={dataStudent.schoolID}
                  onChange={handleChangeStudent}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>Last Name:</label>
                <input 
                  type="text"
                  className={styleStudent.editField}
                  name="last_name"
                  value={dataStudent.last_name}
                  onChange={handleChangeStudent}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>First Name:</label>
                <input 
                  type="text"
                  className={styleStudent.editField}
                  name="first_name"
                  value={dataStudent.first_name}
                  onChange={handleChangeStudent}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>Middle Initial:</label>
                <input 
                  type="text"
                  className={styleStudent.editField}
                  name="middle_initial"
                  value={dataStudent.middle_initial}
                  onChange={handleChangeStudent}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>Email:</label>
                <input 
                  type='email'
                  className={styleStudent.editField}
                  name="email"
                  value={dataStudent.email}
                  onChange={handleChangeStudent}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>College:</label>
                <select 
                  type='text'
                  className={styleStudent.selectInput}
                  name="college"
                  value={dataStudent.college}
                  onChange={handleChangeStudent}
                  required
                >
                  <option></option>
                  {colleges.map(coll => (
                    <option key={coll._id} value={coll.college}>{coll.college}</option>
                  ))}
                </select>
              </div>
              <div className={styleStudent.addInput}>
                <label>Course:</label>
                <select 
                  className={styleStudent.selectInput} 
                  name="course"
                  value={dataStudent.course}
                  onChange={handleChangeStudent}
                  required
                >
                  <option></option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept.department}>{dept.department}</option>
                  ))}
                </select>
              </div>
              <div className={styleStudent.addInput}>
                <label>Year Level:</label>
                <select 
                  className={styleStudent.selectInput} 
                  name="year"
                  value={dataStudent.year}
                  onChange={handleChangeStudent}
                  required
                >
                  <option></option>
                  {yearLevels.map(yearLevel => (
                    <option key={yearLevel._id} value={yearLevel.yearLevel}>{yearLevel.yearLevel}</option>
                  ))}
                </select>
              </div>
              <div className={styleStudent.addInput}>
                <label>Section:</label>
                <select 
                  className={styleStudent.selectInput} 
                  name="section"
                  value={dataStudent.section}
                  onChange={handleChangeStudent}
                  required
                >
                  <option></option>
                  {sections.map(sect => (
                    <option key={sect._id} value={sect.section}>{sect.section}</option>
                  ))}
                </select>
              </div>
              <div className={styleStudent.addInput}>
                <label>Curriculum Effective Year:</label>
                <select 
                  className={styleStudent.selectInput} 
                  name="curriculum_effective_year"
                  value={dataStudent.curriculum_effective_year}
                  onChange={handleChangeStudent}
                  required
                >
                  <option></option>
                  {curriculumEffectiveYear.map(curriculum => (
                    <option key={curriculum._id} value={curriculum.curriculum_effective_year}>{curriculum.curriculum_effective_year}</option>
                  ))}
                </select>
              </div>
              <div className={styleStudent.btnRow}>
                <button type="button" className={styleStudent.cancelBtn} onClick={handleCloseModal}>
                  Close
                </button>
                <button 
                  type="submit" 
                  className={styleStudent.saveBtn}
                  disabled={isStudentLoading}
                >
                  {isStudentLoading ? 
                  (
                    <div className={styleStudent.loader}></div>
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
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modal}>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleUpload}>
              <div className={styleStudent.uploadInput}>
                <label>Select File:</label>
                <input type="file" accept=".csv" className={styleStudent.uploadField} onChange={handleFileChange} />
                {errorLoad && <p className={styleStudent.error}>{errorLoad}</p>}
              </div>
              <div className={styleStudent.btnRow}>
                <button type="button" className={styleStudent.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button type="submit" className={styleStudent.uploadBtn} disabled={loading}>
                  {loading ? (
                    <div className={styleStudent.loader}></div>
                    ) : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {isConfirmDeleteModalOpen && (
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modal}>
            <h2>Confirm Deletion</h2>
            <h4>Are you sure you want to delete this student?</h4>
            <div className={styleStudent.buttonRow}>
              <button onClick={handleDelete} disabled={loadingDelete} className={styleStudent.confirmDeleteBtn}>
                {loadingDelete ? (
                    <div className={styleStudent.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )
                }
              </button>
              <button onClick={() => handleCloseModal()} className={styleStudent.cancelBtn}>Cancel</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
