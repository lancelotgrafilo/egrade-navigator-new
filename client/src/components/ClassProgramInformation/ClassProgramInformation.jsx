import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'
import debounce from 'lodash/debounce';

import styleClassInfo from './classProgramInformation.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import editIcon from '../../assets/icons/edit.png';
import addIcon from '../../assets/icons/add.png';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';

// CONTEXT
import { usePath } from '../../utils/contexts/PathContext';
// EFFECTS
import { createRipple } from '../../utils/effects/ripple'

// HOOKS
import usePostClassProgram from '../../utils/hooks/classProgramHooks/usePostClassProgram';
import useFetchClassProgram from '../../utils/hooks/classProgramHooks/useGetClassProgram';
import usePostClassProgramUpload from '../../utils/hooks/classProgramHooks/usePostClassProgramUpload';
import {handleDownloadClassInfo} from '../../utils/hooks/classProgramHooks/handleDownloadClassInfo';
import useDeleteClassProgram from '../../utils/hooks/classProgramHooks/useDeleteClassProgram';
import useEditClassProgram from '../../utils/hooks/classProgramHooks/useEditClassProgram';

import useFetchSubjects from '../../utils/hooks/subjectsHooks/useGetSubjects';
import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';
import useAcademicYears from '../../utils/hooks/academicYearHooks/useAcademicYears';
import useYearLevels from '../../utils/hooks/yearLevelHooks/useYearLevels';
import useSections from '../../utils/hooks/sectionHooks/useSections';
import useSemester from '../../utils/hooks/semesterHooks/useSemester';

export function ClassProgramInformation() {
  // MODALS
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  
  // HOOKS
  const [error, setError] = useState('');
  const { updatePath } = usePath();
  
  const navigate = useNavigate(); 
  
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedClassProgramId, setSelectedClassProgramId] = useState(null);
  const [selectedClassProgram, setSelectedClassProgram] = useState({
    department: '',
    subject_code: '',
    subject_title: '',
    yearLevel: '',
    section: '',
    semester: '',
    academic_year: '',
  });

  // CUSTOM HOOKS
  const { updateClassProgram, loadingEdit} = useEditClassProgram();

  const {
    dataClassProgram,
    handleChangeClassProgram,
    handleSubmitClassProgram,
    resetClassProgramForm,
    isClassProgramLoading
  } = usePostClassProgram();

  const {classPrograms, errorClassProgram, classProgramLoading, refetch} = useFetchClassProgram(searchQuery);
  const { uploadFile, loading, error: uploadError } = usePostClassProgramUpload();

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 100), 
    []
  );

  // Fetch selected class program data for editing
  useEffect(() => {
    if (isEditModalOpen && selectedClassProgramId) {
      fetch(`/api/get_class_program/${selectedClassProgramId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => setSelectedClassProgram(data))
        .catch(error => console.error('Error fetching class program:', error));
    }
  }, [isEditModalOpen, selectedClassProgramId]);

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (selectedClassProgram && selectedClassProgramId) {
      try {
        const { department, subject_code, subject_title, yearLevel, section, semester, academic_year } = selectedClassProgram;
        await updateClassProgram(selectedClassProgramId, {
          department,
          subject_code,
          subject_title,
          yearLevel,
          section,
          semester,
          academic_year,
        });
        handleCloseModal();
        refetch();
      } catch (error) {
        console.error('Failed to update class program:', error);
        toast.error('Failed to update class program. Please try again.');
      }
    }
  };
  
  const [filteredSubjects, setFilteredSubjects] = useState([]);


  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === 'department' || name === 'yearLevel' || name === 'semester') {
      setSelectedClassProgram({
        ...selectedClassProgram,
        [name]: value,
      });
    } else if (name === 'subject') {
      const selectedSubject = JSON.parse(value);
      setSelectedClassProgram({
        ...selectedClassProgram,
        subject_code: selectedSubject.subject_code,
        subject_title: selectedSubject.subject_title,
      });
    } else {
      setSelectedClassProgram({
        ...selectedClassProgram,
        [name]: value,
      });
    }
  };
  

  const handleSearchChange = (e) => {
    e.preventDefault();
    debouncedSearch(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await handleSubmitClassProgram();
    resetClassProgramForm();
    refetch();
  }

  const { deleteClassProgram, loadingDelete } = useDeleteClassProgram();
  const [classProgramToDelete, setClassProgramToDelete] = useState(null);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteClassProgram(classProgramToDelete);
      setConfirmDeleteModalOpen(false);
      setClassProgramToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete class program:', error);
      toast.error('Failed to delete class program. Please try again.');
    }
  };

  const openConfirmDeleteModal = (id) => {
    setClassProgramToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  const handleAddClick = (e) => {
    createRipple(e, styleClassInfo);
    setModalOpen(true);
  };

  
  const handleEditClick = (id) => {
    setSelectedClassProgramId(id);
    setEditModalOpen(true);
  }
  
  const handleCloseModal = () => {

    setModalOpen(false);
    setEditModalOpen(false);
    setUploadModalOpen(false);
    setConfirmDeleteModalOpen(false);
  };

  const handleDownload = (e) => {
    createRipple(e, styleClassInfo);
    e.preventDefault();
    handleDownloadClassInfo();
  };

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
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

  const handleUploadClick = (e) => {
    createRipple(e, styleClassInfo);
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

  const handleViewInstructor = (id) => {
    // Update the path when viewing instructors
    setSelectedClassProgramId(id);
    updatePath('Class Program Information', 'Instructor');
    navigate(`/admin/classProgramInformation/instructor/${id}`); // Navigate programmatically
  };
  const handleViewStudent = (id) => {
    // Update the path when viewing Students
    setSelectedClassProgramId(id);
    updatePath('Class Program Information', 'Student');
    navigate(`/admin/classProgramInformation/students/${id}`); // Navigate programmatically
  };

  const { subjects, errorSubject } = useFetchSubjects();
  const { departments } = useGetDepartments();
  const { academicYears } = useAcademicYears();
  const { yearLevels } = useYearLevels();
  const { sections } = useSections();
  const { semesters } = useSemester();

  // State for filter values
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Filter class programs based on selected filters
  const filteredClassPrograms = classPrograms.filter(program => {
    return (
      (selectedDepartment === '' || program.department === selectedDepartment) &&
      (selectedYearLevel === '' || program.yearLevel === selectedYearLevel) &&
      (selectedSection === '' || program.section === selectedSection) &&
      (selectedAcademicYear === '' || program.academic_year === selectedAcademicYear) &&
      (selectedSemester === '' || program.semester === selectedSemester)
    );
  });

  useEffect(() => {
    // Apply filters based on selected department, year level, and semester
    const applyFilters = () => {
      let filtered = subjects;
  
      // Filter based on department
      if (dataClassProgram.department) {
        filtered = filtered.filter((subject) =>
          subject.department === dataClassProgram.department
        );
      }
  
      // Filter based on year level
      if (dataClassProgram.yearLevel === '1') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('FIRST YEAR')
        );
      }
      if (dataClassProgram.yearLevel === '2') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('SECOND YEAR')
        );
      }
      if (dataClassProgram.yearLevel === '3') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('THIRD YEAR')
        );
      }
      if (dataClassProgram.yearLevel === '4') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('FOURTH YEAR')
        );
      }
  
      // Filter based on semester
      if (dataClassProgram.semester === '1st') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('First Semester')
        );
      }
      if (dataClassProgram.semester === '2nd') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('Second Semester')
        );
      }
      if (dataClassProgram.semester === 'summer') {
        filtered = filtered.filter((subject) =>
          subject.offered.includes('SUMMER')
        );
      }
  
      setFilteredSubjects(filtered);
    };
  
    applyFilters();
  }, [
    dataClassProgram.department,
    dataClassProgram.yearLevel,
    dataClassProgram.semester,
    subjects,
  ]);
  

  // Reset filter function
  const handleResetFilters = () => {
    setSelectedDepartment('');
    setSelectedYearLevel('');
    setSelectedSection('');
    setSelectedAcademicYear('');
    setSelectedSemester('');
  };

  if (errorClassProgram) {
    return <p>Error fetching subjects: {errorClassProgram.message}</p>; // Display error message if fetch fails
  }

  return (
    <div className={isModalOpen ? `${styleClassInfo.mainContainer} ${styleClassInfo.blurred}` : styleClassInfo.mainContainer}>
      <div className={styleClassInfo.dashboardContent}>
        <div className={styleClassInfo.searchBar}>
          <input 
            type="text" 
            placeholder='Search Class Info...' 
            className={styleClassInfo.searchInput} 
            value={searchQuery}
            onChange = {handleSearchChange}
          />
          <button 
            className={styleClassInfo.addBtn}  
            onClick={(e) => {
              handleAddClick(e);
            }}>
            <img src={addIcon} alt="" />Add
          </button>
          <button className={styleClassInfo.addFile} onClick={handleUploadClick}><img src={uploadIcon} alt="" />Upload File</button>
          <button className={styleClassInfo.csvFormat} onClick={handleDownload}>
            <img src={download} alt="" /> CSV Format
          </button>
        </div>

        <div className={styleClassInfo.filters}>
          <select 
            className={styleClassInfo.filterDropdown}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept.department}>{dept.department}</option>
            ))}
          </select>

          <select 
            className={styleClassInfo.filterDropdown}
            value={selectedYearLevel}
            onChange={(e) => setSelectedYearLevel(e.target.value)}
          >
            <option value="">All Year Levels</option>
            {yearLevels.map(yearLevel => (
              <option key={yearLevel._id} value={yearLevel.yearLevel}>{yearLevel.yearLevel}</option>
            ))}
          </select>

          <select 
            className={styleClassInfo.filterDropdown}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map(sect => (
              <option key={sect._id} value={sect.section}>{sect.section}</option>
            ))}
          </select>

          <select 
            className={styleClassInfo.filterDropdown}
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(ay => (
              <option key={ay._id} value={ay.ay}>{ay.ay}</option>
            ))}
          </select>

          <select 
            className={styleClassInfo.filterDropdown}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={sem.semester}>{sem.semester}</option>
            ))}
          </select>

          <button className={styleClassInfo.filterDropdown} onClick={handleResetFilters}>
            Reset Filters 
          </button>
        </div>

        <div className={styleClassInfo.tableContainer}>
          <table className={styleClassInfo.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Year Level</th>
                <th>Section</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Instructor</th>
                <th>Student</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classProgramLoading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : Array.isArray(filteredClassPrograms) && filteredClassPrograms.length > 0 ? (
                filteredClassPrograms.map((classProgram) => (
                  <tr key={classProgram.id}>
                    <td>{classProgram.originalClassProgram}</td>
                    <td>{classProgram.department}</td>
                    <td>{classProgram.subject_code} - {classProgram.subject_title}</td>
                    <td>{classProgram.yearLevel}</td>
                    <td>{classProgram.section}</td>
                    <td>{classProgram.semester}</td>
                    <td>{classProgram.academic_year}</td>
                    <td>
                      <button
                        className={styleClassInfo.view}
                        onClick={() => handleViewInstructor(classProgram.id)}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button 
                        className={styleClassInfo.view} 
                        onClick={() => handleViewStudent(classProgram.id)}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEditClick(classProgram.id)} 
                        className={styleClassInfo.editBtn}>
                        <img src={editIcon} className={styleClassInfo.editImg} />
                      </button>
                      <button 
                        onClick={() => openConfirmDeleteModal(classProgram.id)}
                        className={styleClassInfo.deleteBtn}
                        disabled={loadingDelete}
                      >
                        <img src={deleteIcon} className={styleClassInfo.deleteImg} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={styleClassInfo.modalOverlay}>
          <div className={styleClassInfo.modal}>
            <h2>Add Class Program</h2>
            <form onSubmit={handleSave}>
              <div className={styleClassInfo.editInput}>
                <label>Department:</label>
                <select
                  className={styleClassInfo.editField}
                  name="department"
                  value={dataClassProgram.department}
                  onChange={(e) => {
                    handleChangeClassProgram(e);
                    setFilteredSubjects(
                      subjects.filter(
                        (subject) =>
                          subject.department === e.target.value
                      )
                    );
                  }}
                  required
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  {departments &&
                    departments.map((dept) => (
                      <option key={dept._id} value={dept.department}>
                        {dept.department}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Year Level:</label>
                <select 
                  type='text' 
                  className={styleClassInfo.editField}
                  name="yearLevel"
                  value={dataClassProgram.yearLevel}
                  onChange={handleChangeClassProgram}
                  required
                >
                  <option value="" disabled>
                    Select year level
                  </option>
                  {yearLevels && yearLevels.map((level) => (
                    <option key={level._id} value={level.yearLevel}>
                      {level.yearLevel}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styleClassInfo.editInput}>
                <label>Semester:</label>
                <select 
                  className={styleClassInfo.editField}
                  name="semester"
                  value={dataClassProgram.semester}
                  onChange={handleChangeClassProgram}
                  required
                >
                  <option value="" disabled>
                    Select semester
                  </option>

                  {semesters && semesters.length > 0 ? (
                    semesters.map((sem) => (
                      <option key={sem._id} value={sem.semester}>
                        {sem.semester}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No semesters available
                    </option>
                  )}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Subject:</label>
                <select
                  className={styleClassInfo.editField}
                  name="subject"
                  value={
                    dataClassProgram.subject_code
                      ? JSON.stringify({
                          subject_code: dataClassProgram.subject_code,
                          subject_title: dataClassProgram.subject_title,
                        })
                      : ''
                  }
                  onChange={handleChangeClassProgram}
                  required
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={JSON.stringify({
                        subject_code: subject.subject_code,
                        subject_title: subject.subject_title,
                      })}
                    >
                      {`${subject.subject_code} - ${subject.subject_title}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Section:</label>
                <select 
                  type='text' 
                  className={styleClassInfo.editField}
                  name="section"
                  value={dataClassProgram.section}
                  onChange={handleChangeClassProgram}
                  required
                >
                  <option value="" disabled>
                    Select section
                  </option>

                  {sections && sections.map((sect) => (
                    <option key={sect._id} value={sect.section}> 
                      {sect.section}
                    </option>
                  ))}

                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Academic Year:</label>
                <select 
                  className={styleClassInfo.editField}
                  name="academic_year"
                  value={dataClassProgram.academic_year}
                  onChange={handleChangeClassProgram}
                  required
                >
                  <option value="" disabled>
                    Select academic year
                  </option>
                  {academicYears && academicYears.map((year) => (
                    <option key={year._id} value={year.ay}>
                      {year.ay}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styleClassInfo.btnRow}>
                <button type="button" className={styleClassInfo.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button type="submit" className={styleClassInfo.saveBtn} disabled={isClassProgramLoading}>
                  {isClassProgramLoading ? (
                      <div className={styleClassInfo.loader}></div> 
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
        
      {isEditModalOpen && selectedClassProgram && (
        <div className={styleClassInfo.modalOverlay}>
          <div className={styleClassInfo.modal}>
            <h2>Edit Class Program</h2>
            <form onSubmit={handleEditSave}>
              <div className={styleClassInfo.editInput}>
                <label>Department:</label>
                <select
                  className={styleClassInfo.editField}
                  name="department"
                  value={selectedClassProgram.department || ''}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  {departments &&
                    departments.map((dept) => (
                      <option key={dept._id} value={dept.department}>
                        {dept.department}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Subject:</label>
                <select
                  className={styleClassInfo.editField}
                  name="subject"
                  value={JSON.stringify({
                    subject_code: selectedClassProgram.subject_code || '',
                    subject_title: selectedClassProgram.subject_title || '',
                  })}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={JSON.stringify({
                        subject_code: subject.subject_code,
                        subject_title: subject.subject_title,
                      })}
                    >
                      {`${subject.subject_code} - ${subject.subject_title}`}
                    </option>
                  ))}
                </select>
              </div>



              <div className={styleClassInfo.editInput}>
                <label>Year Level:</label>
                <select
                  className={styleClassInfo.editField}
                  name="yearLevel"
                  value={selectedClassProgram.yearLevel || ''}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Select year level
                  </option>
                  {yearLevels &&
                    yearLevels.map((level) => (
                      <option key={level._id} value={level.yearLevel}>
                        {level.yearLevel}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Section:</label>
                <select
                  className={styleClassInfo.editField}
                  name="section"
                  value={selectedClassProgram.section || ''}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Select section
                  </option>
                  {sections &&
                    sections.map((sect) => (
                      <option key={sect._id} value={sect.section}>
                        {sect.section}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Semester:</label>
                <select
                  className={styleClassInfo.editField}
                  name="semester"
                  value={selectedClassProgram.semester || ''}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Select semester
                  </option>
                  {semesters &&
                    semesters.map((sem) => (
                      <option key={sem._id} value={sem.semester}>
                        {sem.semester}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styleClassInfo.editInput}>
                <label>Academic Year:</label>
                <select
                  className={styleClassInfo.editField}
                  name="academic_year"
                  value={selectedClassProgram.academic_year || ''}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Select academic year
                  </option>
                  {academicYears &&
                    academicYears.map((year) => (
                      <option key={year._id} value={year.ay}>
                        {year.ay}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styleClassInfo.btnRow}>
                <button
                  type="button"
                  className={styleClassInfo.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={styleClassInfo.saveBtn}
                  disabled={loadingEdit}
                >
                  {loadingEdit ? (
                    <div className={styleClassInfo.loader}></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {isUploadModalOpen && (
        <div className={styleClassInfo.modalOverlay}>
          <div className={styleClassInfo.modal}>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleUpload}>
              <div className={styleClassInfo.uploadInput}>
                <label>Select File:</label>
                <input type="file" accept=".csv" className={styleClassInfo.uploadField} onChange={handleFileChange} />
                {error && <p className={styleClassInfo.error}>{error}</p>}
              </div>
              <div className={styleClassInfo.btnRow}>
                <button type="button" className={styleClassInfo.cancelBtn} onClick={handleCloseModal}>Close</button>
                <button type="submit" className={styleClassInfo.uploadBtn} disabled={loading}>
                  {loading ? (
                    <div className={styleClassInfo.loader}></div>
                    ) : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmDeleteModalOpen && (
        <div className={styleClassInfo.modalOverlay}>
          <div className={styleClassInfo.modal}>
            <h2>Confirm Deletion</h2>
            <h4>Are you sure you want to delete this class program?</h4>
            <div className={styleClassInfo.buttonRow}>
              <button onClick={handleDelete} disabled={loadingDelete} className={styleClassInfo.confirmDeleteBtn}>
                {loadingDelete ? (
                    <div className={styleClassInfo.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )
                }
              </button>
              <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleClassInfo.cancelBtn}>Cancel</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

