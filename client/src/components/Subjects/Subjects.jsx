import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import styleSubjects from './subjects.module.css';
import deleteIcon from '../../assets/icons/delete.png';
import editIcon from '../../assets/icons/edit.png';
import addIcon from '../../assets/icons/add.png';
import download from '../../assets/icons/csvFormatdownload.png';
import uploadIcon from '../../assets/icons/upload.png';
import { toast } from 'react-toastify';

import useFetchSubjects from '../../utils/hooks/subjectsHooks/useGetSubjects';
import usePostSubjects from '../../utils/hooks/subjectsHooks/usePostSubjects';
import useEditSubject from '../../utils/hooks/subjectsHooks/useEditSubject';
import useDeleteSubject from '../../utils/hooks/subjectsHooks/useDeleteSubject';
import useUploadSubjectCSV from '../../utils/hooks/subjectsHooks/useUploadSubjectCSV';

export function Subjects() {
  const [isAddModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const {
    dataSubject,
    handleChangeSubject,
    handleSubmitSubject,
    isSubjectLoading,
  } = usePostSubjects();

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState({
    department: '',
    subject_code: '',
    subject_title: '',
    prerequisite: '',
    unit: '',
    effective: '',
    offered: '',
  });

  const { updateSubject, loadingEdit, errorEdit } = useEditSubject();

  // Fetch selected subject data for editing
  useEffect(() => {
    if (isEditModalOpen && selectedSubjectId) {
      fetch(`https://egrade-backend.onrender.com/api/get_subject/${selectedSubjectId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => setSelectedSubject(data))
        .catch((error) => console.error('Error fetching Subject:', error));
    }
  }, [isEditModalOpen, selectedSubjectId]);

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (selectedSubjectId && selectedSubject) {
      try {
        // Destructure the fields that need to be updated
        const { department, subject_code, subject_title, prerequisite, unit, effective, offered } = selectedSubject;

        // Await the update call
        await updateSubject(selectedSubjectId, { department, subject_code, subject_title, prerequisite, unit, effective, offered });

        // Close the modal and refetch data
        handleCloseModal();
        refetch();

        // Show success message
        toast.success('Subject updated successfully.');
      } catch (error) {
        console.error('Failed to update subject:', error);
        toast.error('Failed to update subject. Please try again.');
      }
    }
  };

  const handleEditChange = (e) => {
    setSelectedSubject({
      ...selectedSubject,
      [e.target.name]: e.target.value,
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const { subjects, errorSubject, loadingSubject, refetch } = useFetchSubjects(searchQuery);

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
    e.preventDefault(); // Prevent default form submission
  
    try {
      await handleSubmitSubject(); // Await submission
      refetch(); // Refetch subjects after submitting a new one
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };
  

  const { deleteSubject, loadingDelete } = useDeleteSubject();
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const handleDelete = async () => {
    try {
      await deleteSubject(subjectToDelete);
      setConfirmDeleteModalOpen(false);
      setSubjectToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete class program:', error);
      toast.error('Failed to delete class program. Please try again.');
    }
  };

  const openConfirmDeleteModal = (id) => {
    setSubjectToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  const handleAddClick = () => {
    setModalOpen(true);
  };

  const handleEditClick = (id) => {
    // console.log('Editing subject with id:', id); // Debugging line
    setSelectedSubjectId(id);
    setEditModalOpen(true);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setUploadModalOpen(false);
    setConfirmDeleteModalOpen(false);
    setError('');
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

  const { uploadCSV, uploading, errorUpload, success } = useUploadSubjectCSV();

  const handleUpload = async (e) => {
    e.preventDefault();
  
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
  
    try {
      await uploadCSV(selectedFile);
      
      if (success) {
        handleCloseModal();
        refetch(); 
      }
      handleCloseModal();
      refetch(); 
    } catch (error) {
      toast.error(errorUpload || 'Failed to upload the file.');
    }
  };
  

  const handleDownload = () => {
    const csvContent = 'department,subject_code,subject_title,prerequisite,unit,effective,offered';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subject_format.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (errorSubject) {
    return <p>Error fetching subjects: {error.message}</p>; // Display error message if fetch fails
  }

  return (
    <div
      className={
        isAddModalOpen || isEditModalOpen || isUploadModalOpen
          ? `${styleSubjects.mainContainer} ${styleSubjects.blurred}`
          : styleSubjects.mainContainer
      }
    >
      <div className={styleSubjects.dashboardContent}>
        <div className={styleSubjects.searchBar}>
          <input
            type="text"
            placeholder="Search Subject..."
            className={styleSubjects.searchInput}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className={styleSubjects.buttonContainer}>
            <button className={styleSubjects.addBtn} onClick={handleAddClick}>
              <img src={addIcon} alt="" />
              Add
            </button>
            <button className={styleSubjects.addFile} onClick={handleUploadClick}>
              <img src={uploadIcon} alt="" />
              Upload File
            </button>
            <button className={styleSubjects.csvFormat} onClick={handleDownload}>
              <img src={download} alt="" />
              CSV Format
            </button>
          </div>
        </div>

        <div className={styleSubjects.tableContainer}>
          <table className={styleSubjects.classInfoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Prerequisite</th>
                <th>Unit/s</th>
                <th>Effective</th>
                <th>Offered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingSubject ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>Loading subjects...</td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>No subjects available.</td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.originalSubjects}</td>
                    <td>{subject.department}</td>
                    <td>{subject.subject_code}</td>
                    <td>{subject.subject_title}</td>
                    <td>{subject.prerequisite}</td>
                    <td>{subject.unit}</td>
                    <td>{subject.effective}</td>
                    <td>{subject.offered}</td>
                    <td>
                      <div className={styleSubjects.actionRow}>
                        <button
                          onClick={() => handleEditClick(subject._id)}
                          className={styleSubjects.editBtn}
                        >
                          <img src={editIcon} className={styleSubjects.editImg} />
                        </button>

                        <button
                          onClick={() => openConfirmDeleteModal(subject._id)}
                          className={styleSubjects.deleteBtn}
                        >
                          <img src={deleteIcon} className={styleSubjects.deleteImg} />
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

      {isAddModalOpen && (
        <div className={styleSubjects.modalOverlay}>
          <div className={styleSubjects.modal}>
            <h2>Add Subject</h2>
            <form onSubmit={handleSave}>
              <div className={styleSubjects.editInput}>
                <label>Department:</label>
                <input
                  type='text'
                  className={styleSubjects.editField}
                  name="department"
                  value={dataSubject.department}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.editInput}>
                <label>Subject Code:</label>
                <input
                  type='text'
                  className={styleSubjects.editField}
                  name="subject_code"
                  value={dataSubject.subject_code}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.editInput}>
                <label>Subject Title:</label>
                <input
                  type='text'
                  className={styleSubjects.editField}
                  name="subject_title"
                  value={dataSubject.subject_title}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.editInput}>
                <label>Prerequisite:</label>
                <input
                  type='text'
                  className={styleSubjects.editField}
                  name="prerequisite"
                  value={dataSubject.prerequisite}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.editInput}>
                <label>Unit:</label>
                <input
                  className={styleSubjects.editField}
                  name="unit"
                  type="number" // Ensure the input type is number
                  value={dataSubject.unit}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.editInput}>
                <label>Effective:</label>
                <input
                  type='text'
                  className={styleSubjects.editField}
                  name="effective"
                  value={dataSubject.effective}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.editInput}>
                <label>Offered:</label>
                <input
                  type='text'
                  className={styleSubjects.editField}
                  name="offered"
                  value={dataSubject.offered}
                  onChange={handleChangeSubject}
                  required
                />
              </div>

              <div className={styleSubjects.btnRow}>
                <button
                  type="button"
                  className={styleSubjects.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={styleSubjects.saveBtn}
                  disabled={isSubjectLoading}
                >
                  {isSubjectLoading ? (
                    <div className={styleSubjects.loader}></div>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedSubject && (
        <div className={styleSubjects.modalOverlay}>
          <div className={styleSubjects.modal}>
            <h2>Edit Subject</h2>
            <form onSubmit={handleEditSave}>
              <div className={styleSubjects.editInput}>
                <label>Department:</label>
                <input
                  type="text"
                  className={styleSubjects.editField}
                  name="department"
                  value={selectedSubject?.department || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.editInput}>
                <label>Subject Code:</label>
                <input
                  type="text"
                  className={styleSubjects.editField}
                  name="subject_code"
                  value={selectedSubject?.subject_code || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.editInput}>
                <label>Subject Title:</label>
                <input
                  type="text"
                  className={styleSubjects.editField}
                  name="subject_title"
                  value={selectedSubject?.subject_title || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.editInput}>
                <label>Prerequisite:</label>
                <input
                  type="text"
                  className={styleSubjects.editField}
                  name="prerequisite"
                  value={selectedSubject?.prerequisite || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.editInput}>
                <label>Unit:</label>
                <input
                  type="number"
                  className={styleSubjects.editField}
                  name="unit"
                  value={selectedSubject?.unit || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.editInput}>
                <label>Effective:</label>
                <input
                  type="text"
                  className={styleSubjects.editField}
                  name="effective"
                  value={selectedSubject?.effective || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.editInput}>
                <label>Offered:</label>
                <input
                  type="text"
                  className={styleSubjects.editField}
                  name="offered"
                  value={selectedSubject?.offered || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styleSubjects.btnRow}>
                <button
                  type="button"
                  className={styleSubjects.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button type="submit" className={styleSubjects.saveBtn} disabled={loadingEdit}>
                  {loadingEdit ? <div className={styleSubjects.loader}></div> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className={styleSubjects.modalOverlay}>
          <div className={styleSubjects.modal}>
            <h2>Upload CSV File</h2>
            <form
              onSubmit={handleUpload}
            >
              <div className={styleSubjects.uploadInput}>
                <label>Select File:</label>
                <input
                  type="file"
                  accept=".csv"
                  className={styleSubjects.uploadField}
                  onChange={handleFileChange}
                />
                {error && <p className={styleSubjects.error}>{error}</p>}
              </div>
              <div className={styleSubjects.btnRow}>
                <button
                  type="button"
                  className={styleSubjects.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button type="submit" className={styleSubjects.uploadBtn} disabled={uploading}>
                  {uploading ? (
                    <div className={styleSubjects.loader}></div>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmDeleteModalOpen && (
        <div className={styleSubjects.modalOverlay}>
          <div className={styleSubjects.modal}>
            <h2>Confirm Deletion</h2>
            <h4>Are you sure you want to delete this subject?</h4>
            <div className={styleSubjects.buttonRow}>
              <button onClick={handleDelete} disabled={loadingDelete} className={styleSubjects.confirmDeleteBtn}>
                {loadingDelete ? (
                    <div className={styleSubjects.loader}></div> 
                  ) : (
                    "Yes, Delete"
                  )
                }
              </button>
              <button onClick={() => setConfirmDeleteModalOpen(false)} className={styleSubjects.cancelBtn}>Cancel</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
