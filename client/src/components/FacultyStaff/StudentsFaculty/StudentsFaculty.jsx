import { useState, useCallback, useEffect } from 'react';
import styleStudent from './studentsFaculty.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import calculate from '../../../assets/icons/calculate.png';
import { jwtDecode } from 'jwt-decode';
import debounce from 'lodash/debounce';
import { usePath } from '../../../utils/contexts/PathContext';
import download from '../../../assets/icons/csvFormatdownload.png';
import upload from '../../../assets/icons/upload.png';
import useGetFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';
import useUploadGradeSheet from '../../../utils/hooks/facultyStaffHooks/useUploadGradeSheet';
import useUploadRemovalCompletionForm from '../../../utils/hooks/removalCompletionFormHooks/useUploadRemovalCompletionForm';
import useGetRemovalComplete from '../../../utils/hooks/removalCompletionFormHooks/useGetRemovalComplete';
import usePostStudentsUpload from '../../../utils/hooks/studentHooks/usePostStudentsUpload';

export function StudentsFaculty() {
  const { id } = useParams();
  const { updatePath } = usePath();
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    updatePath('Students', id ? `Student ${id}` : '');
  }, [id, updatePath]);

  const navigateStudentGrades = (userId, studentId, subjectId, subjectTitle, subjectCode) => {
    updatePath('Student Subjects', `Student`);
    navigate(`/facultyStaff/students/student_grades/${userId}/${studentId}/${subjectId}`, {
      state: { subjectTitle, subjectCode }
    });
  };
  

  const [searchQuery, setSearchQuery] = useState('');
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

  const token = localStorage.getItem('token');
  let userId = '';
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { uploadGradeSheet, loading: uploading, error: uploadError } = useUploadGradeSheet(userId);
  const { uploadRemovalCompletionForm, loading: removalUploading, error: removalUploadError } = useUploadRemovalCompletionForm(userId);

  const { userDetails, loading, refetch } = useGetFacultyDetails(userId);
  const [subject, setSubject] = useState('');
  const subjects = userDetails ? userDetails.load.map(subject => subject.subject_code) : [];
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isRemovalCompletionFormModalOpen, setIsRemovalCompletionFormModalOpen] = useState(false);

  const handleCloseModal = () => {
    setUploadModalOpen(false);1
    setUploadStudentModalOpen(false);
    setIsRemovalCompletionFormModalOpen(false);
    setImage(null);
  };

  const handleUploadModal = () => {
    setUploadModalOpen(true);
  };

  const handleRemoveCompletionModal = () => {
    setIsRemovalCompletionFormModalOpen(true);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedFile) {
      toast.error('Please select a file.');
      return;
    }
  
    const last_name = userDetails.last_name || 'Unknown';
  
    try {
      await uploadGradeSheet(selectedFile, last_name, (data) => {
        toast.success('Grade sheet uploaded successfully!');
        setUploadModalOpen(false);
      });
    } catch (error) {
      // Display the error message from the server
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to upload the grade sheet: ${error.response.data.error}`);
      } else {
        toast.error('Failed to upload the grade sheet. Please try again.');
      }
    } finally {
      refetch();
    }
  };
  
  
  const [isUploadStudentModalOpen, setUploadStudentModalOpen] = useState(false);
  

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/files/Grade-Sheet-Format.xlsx';
    link.download = 'Grade-Sheet-Format.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [formData, setFormData] = useState({
    date: '',
    last_name: '',
    first_name: '',
    middle_initial: '',
    status: '',
    subject: '',
    semester: '',
    academic_year: '',
    rating_obtained: '',
    instructor_professor: ''
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Image upload and handling state
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Set the Base64 string
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Save function that handles form data including image upload
  const handleSave = async (e) => {
    e.preventDefault();
  
    if (!image) {
      setError('Please upload an image.');
      return;
    }
  
    try {
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      formDataToSubmit.append('formImage', image); // Ensure image is a File object
  
      await uploadRemovalCompletionForm(formDataToSubmit, (data) => {
        toast.success('Removal / Completion form uploaded successfully!');
        setIsRemovalCompletionFormModalOpen(false);
        setFormData({
          date: '',
          last_name: '',
          first_name: '',
          middle_initial: '',
          status: '',
          subject: '',
          semester: '',
          academic_year: '',
          rating_obtained: '',
          instructor_professor: ''
        });
        setImage(null);
      });
    } catch (error) {
      setError('Failed to upload the removal / completion form. Please try again.');
      toast.error('Failed to upload the removal / completion form. Please try again.');
    }
  };

  // Fetch removal completion data
  const { removalCompleteData, error: removalCompleteError } = useGetRemovalComplete(); 
 

  const { uploadFile, uploadingStudent, errorLoad } = usePostStudentsUpload();

  const handleUploadStudent = async (e) => {
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
  

  const handleStudentUploadClick = () => {
    setUploadStudentModalOpen(true);
  };

  const handleFileChangeStudent = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      toast.error('Only .csv files are allowed.');
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleDownloadStudent = () => {
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

  return (
    <div className={styleStudent.mainContainer}>
      <div className={styleStudent.dashboardContent}>
        <div className={styleStudent.searchBar}>
          <input
            type="text"
            placeholder="Search Student..."
            className={styleStudent.searchInput}
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <select
            className={styleStudent.filterDropdown}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((subj, index) => (
              <option key={index} value={subj}>{subj}</option>
            ))}
          </select>

          <button
            className={styleStudent.uploadGradeBtn}
            onClick={handleUploadModal}
          >
            <img src={upload} className={styleStudent.uploadGradeImg} />
            Upload Grades
          </button>

          <button
            className={styleStudent.downloadBtn}
            onClick={handleDownload}
          >
            <img src={download} className={styleStudent.downloadImg} />
            Grade Sheet Format
          </button>

          <button
            className={styleStudent.downloadBtn}
            onClick={handleRemoveCompletionModal}
          >
            Removal / Completion Form
          </button>

          <button className={styleStudent.uploadGradeBtn} onClick={handleStudentUploadClick}>
            <img src={upload} className={styleStudent.uploadGradeImg}/>
            Upload Student Account
          </button>
          <button className={styleStudent.downloadBtn} onClick={handleDownloadStudent}>
            <img src={download} className={styleStudent.downloadImg} />
            CSV Format Student Account
          </button>

        </div>

        <div className={styleStudent.tableContainer}>
          <table className={styleStudent.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Final Rating</th>
                <th>Compute</th>
              </tr>
            </thead>

            <tbody>
              {userDetails && userDetails.load.map((subjectLoad) => (
                (!subject || subjectLoad.subject_code === subject) && subjectLoad.students.map((student, index) => {
                  
                  // Filter removalCompleteData to find a matching entry based on last_name, subject_code, semester, and academic_year
                  const removalComplete = removalCompleteData.find(
                    item =>
                      item.last_name === student.last_name &&
                      item.subject === subjectLoad.subject_code &&
                      item.semester === subjectLoad.semester &&
                      item.academic_year === subjectLoad.academic_year
                  );

                  const ratingObtained = removalComplete ? removalComplete.rating_obtained : '';

                  // Check if the grade is below 3.0
                  const isLowGrade = parseFloat(student.FINAL_GRADE) > 3.0 || parseFloat(ratingObtained) > 3.0;

                  return (
                    <tr key={student._id}>
                      <td>{index + 1}</td>
                      <td>{student.last_name}</td>
                      <td>{student.first_name}</td>
                      <td>{student.middle_initial}</td>
                      <td className={parseFloat(student.midterm_grade) > 3.0 ? styleStudent.lowGrade : ''}>
                        {student.midterm_grade}
                      </td>
                      <td className={parseFloat(student.finalterm_grade) > 3.0 ? styleStudent.lowGrade : ''}>
                        {student.finalterm_grade}
                      </td>
                      <td className={isLowGrade ? styleStudent.lowGrade : ''}>
                        {removalComplete ? (
                          <>
                            {student.FINAL_GRADE} / {ratingObtained}
                          </>
                        ) : (
                          student.FINAL_GRADE
                        )}
                      </td>
                      <td>
                        <div className={styleStudent.actionRow}>
                          <button
                            onClick={() => navigateStudentGrades(userId, student._id, subjectLoad._id, subjectLoad.subject_title, subjectLoad.subject_code)}
                            className={styleStudent.calculateBtn}
                            title="Compute Grades"
                          >
                            <img src={calculate} className={styleStudent.calculateImg} alt="Calculate" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ))}

            </tbody>

          </table>
        </div>
      </div>

      {isUploadModalOpen && (
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modal}>
            <h2>Upload Grade Sheet</h2>
            <form onSubmit={handleSubmit}>
              <div className={styleStudent.uploadInput}>
                <label>Select File:</label>
                <input type="file" accept=".csv, .xlsx, .xls" className={styleStudent.uploadField} onChange={handleFileChange} />
              </div>
              <div className={styleStudent.btnRow}>
                <button type="button" className={styleStudent.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button type="submit" className={styleStudent.uploadBtn} disabled={uploading}>
                  {uploading ? (
                    <div className={styleStudent.loader}></div>
                  ) : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRemovalCompletionFormModalOpen && (
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modal}>
            <h2>Removal / Completion Form</h2>
            <form onSubmit={handleSave}>
              <div className={styleStudent.addInput}>
                <label>Date:</label>
                <input 
                  type="date"
                  className={styleStudent.editField}
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styleStudent.addInputRow}>
                <div className={styleStudent.addInput}>
                  <label>Last Name:</label>
                  <input 
                    type="text"
                    className={styleStudent.editField}
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styleStudent.addInput}>
                  <label>First Name:</label>
                  <input 
                    type="text"
                    className={styleStudent.editField}
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styleStudent.addInput}>
                  <label>Middle Initial:</label>
                  <input 
                    type="text"
                    className={styleStudent.editField}
                    name="middle_initial"
                    value={formData.middle_initial}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styleStudent.addInput}>
                <div className={styleStudent.removeComplete}>
                  <p>Has:</p>
                  <label htmlFor="removed">
                    <input 
                      type="radio" 
                      name="status" 
                      id="removed" 
                      value="Removed"
                      checked={formData.status === "Removed"}
                      onChange={handleChange}
                    />
                    Removed
                  </label>
                  <label htmlFor="completed">
                    <input 
                      type="radio" 
                      name="status" 
                      id="completed" 
                      value="Completed"
                      checked={formData.status === "Completed"}
                      onChange={handleChange}
                    />
                    Completed
                  </label>
                </div>
              </div>
              <div className={styleStudent.addInput}>
                <label>Subject:</label>
                <input 
                  type='text'
                  className={styleStudent.editField}
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styleStudent.addInputRow}>
                <div className={styleStudent.addInput}>
                  <label>Semester:</label>
                  <select 
                    className={styleStudent.selectInput}
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    <option></option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className={styleStudent.addInput}>
                  <label>School Year:</label>
                  <select 
                    className={styleStudent.selectInput}
                    name="academic_year"
                    value={formData.school_year}
                    onChange={handleChange}
                    required
                  >
                    <option></option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
              </div>
              <div className={styleStudent.addInput}>
                <label>RATING OBTAINED:</label>
                <input 
                  type="text"
                  className={styleStudent.editField} 
                  name="rating_obtained"
                  value={formData.rating_obtained}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>Instructor/Professor:</label>
                <input 
                  type="text"
                  className={styleStudent.editField} 
                  name="instructor_professor"
                  value={formData.instructor_professor}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styleStudent.addInput}>
                <label>Removal / Completion Form Image:</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className={styleStudent.editField} 
                  name="formImage"
                  onChange={handleImageUpload}
                  required
                />
                {image && (
                  <div className={styleStudent.imageContainer}>
                    <button 
                      type="button" 
                      className={styleStudent.removeImageBtn} 
                      onClick={() => setImage(null)}
                    >
                      X
                    </button>
                    <img src={image} alt="Uploaded Preview" className={styleStudent.imagePreview} />
                  </div>
                )}
              </div>
              <div className={styleStudent.btnRow}>
                <button  
                  type="button" 
                  className={styleStudent.cancelBtn} 
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  className={styleStudent.saveBtn}
                  disabled={removalUploading}
                >
                  {removalUploading ? (
                    <div className={styleStudent.loader}></div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>  
        </div>
      )}

      {isUploadStudentModalOpen && (
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modal}>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleUploadStudent}>
              <div className={styleStudent.uploadInput}>
                <label>Select File:</label>
                <input type="file" accept=".csv" className={styleStudent.uploadField} onChange={handleFileChangeStudent} />
              </div>
              <div className={styleStudent.btnRow}>
                <button type="button" className={styleStudent.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button type="submit" className={styleStudent.uploadBtn} disabled={uploadingStudent}>
                  {uploadingStudent ? (
                    <div className={styleStudent.loader}></div>
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
