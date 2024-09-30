import React, { useState, useEffect } from 'react';
import styleDocs from './documents.module.css';
import { useGetFiles } from '../../utils/hooks/DocumentsHooks/useGetFiles';

const backendUrl = 'http://localhost:5000'; // Define the backend URL

import useGetDepartments from '../../utils/hooks/departmentHooks/useGetDepartments';
import useAcademicYears from '../../utils/hooks/academicYearHooks/useAcademicYears';
import useSemester from '../../utils/hooks/semesterHooks/useSemester';

export function Documents() {
  const { files, loading, error } = useGetFiles();
  const [selectedFile, setSelectedFile] = useState(null);

  // Access filter options from hooks
  const { departments } = useGetDepartments();
  const { academicYears } = useAcademicYears();
  const { semesters } = useSemester();

  // State for Grade Sheets filter values
  const [selectedDepartmentForGradeSheets, setSelectedDepartmentForGradeSheets] = useState('');
  const [selectedAcademicYearForGradeSheets, setSelectedAcademicYearForGradeSheets] = useState('');
  const [selectedSemesterForGradeSheets, setSelectedSemesterForGradeSheets] = useState('');

  // State for Removal/Completion Forms filter values
  const [selectedAcademicYearForRemoval, setSelectedAcademicYearForRemoval] = useState('');
  const [selectedSemesterForRemoval, setSelectedSemesterForRemoval] = useState('');
  const [searchTermRemoval, setSearchTermRemoval] = useState(''); // New search term state

  const handleClick = (file) => {
    setSelectedFile(file);
  };

  const closeModal = () => {
    setSelectedFile(null);
  };

  const handleDownload = () => {
    fetch(selectedFile.url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', selectedFile.name); // set the filename
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((err) => console.error('Download error:', err));
  };

  // Filter function for Grade Sheets
  const filterGradeSheets = (files) => {
    if (!Array.isArray(files)) {
      console.error('Expected files to be an array but got:', files); // Debugging line
      return [];
    }

    return files.filter((file) => {
      const fileName = file.name.toLowerCase();

      // Checking if the filters are matched in the filename
      const matchesDepartment = selectedDepartmentForGradeSheets ? fileName.includes(selectedDepartmentForGradeSheets.toLowerCase()) : true;
      const matchesAcademicYear = selectedAcademicYearForGradeSheets ? fileName.includes(selectedAcademicYearForGradeSheets.toLowerCase()) : true;
      const matchesSemester = selectedSemesterForGradeSheets ? fileName.includes(selectedSemesterForGradeSheets.toLowerCase()) : true;

      return matchesDepartment && matchesAcademicYear && matchesSemester;
    });
  };

  // Filter function for Removal/Completion Forms
  const filterRemovalForms = (files) => {
    if (!Array.isArray(files)) {
      console.error('Expected files to be an array but got:', files); // Debugging line
      return [];
    }

    return files.filter((file) => {
      const fileName = file.name.toLowerCase();

      // Checking if the filters are matched in the filename
      const matchesAcademicYear = selectedAcademicYearForRemoval ? fileName.includes(selectedAcademicYearForRemoval.toLowerCase()) : true;
      const matchesSemester = selectedSemesterForRemoval ? fileName.includes(selectedSemesterForRemoval.toLowerCase()) : true;
      const matchesSearchTerm = searchTermRemoval ? fileName.includes(searchTermRemoval.toLowerCase()) : true; // Check against search term

      return matchesAcademicYear && matchesSemester && matchesSearchTerm; // Include search term in the return
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Filtered files for Grade Sheets and Removal/Completion Forms
  const filteredGradeSheets = filterGradeSheets(files.gradeSheets || []); // Ensure `gradeSheets` is an array or default to an empty array
  const filteredRemovalForms = filterRemovalForms(files.removalForms || []); // Same for removal/completion forms

  return (
    <div className={styleDocs.container}>
      {/* Grade Sheets Container */}
      <div className={styleDocs.filterContainer}>
        <h2>Grade Sheets</h2>
        <div className={styleDocs.filters}>
          <select
            name="academicYear"
            value={selectedAcademicYearForGradeSheets}
            onChange={(e) => setSelectedAcademicYearForGradeSheets(e.target.value)}
            className={styleDocs.filterDropdown}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(ay => (
              <option key={ay._id} value={ay.ay}>{ay.ay}</option>
            ))}
          </select>

          <select
            name="department"
            value={selectedDepartmentForGradeSheets}
            onChange={(e) => setSelectedDepartmentForGradeSheets(e.target.value)}
            className={styleDocs.filterDropdown}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept.department}>{dept.department}</option>
            ))}
          </select>

          <select
            name="semester"
            value={selectedSemesterForGradeSheets}
            onChange={(e) => setSelectedSemesterForGradeSheets(e.target.value)}
            className={styleDocs.filterDropdown}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={sem.semester}>{sem.semester}</option>
            ))}
          </select>
        </div>
        <div className={styleDocs.cardContainer}>
          {filteredGradeSheets.length > 0 ? (
            filteredGradeSheets.map((file) => {
              const imageUrl = `${backendUrl}${file.url}`;
              return (
                <div className={styleDocs.card} key={file.name}>
                  <img
                    src={imageUrl}
                    alt={file.name}
                    className={styleDocs.image}
                    onClick={() => handleClick({ ...file, url: imageUrl })}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    onClick={() => handleClick({ ...file, url: imageUrl })}
                    className={styleDocs.link}
                  >
                    {file.name}
                  </button>
                </div>
              );
            })
          ) : (
            <p>No grade sheets available.</p>
          )}
        </div>
      </div>

      {/* Removal / Completion Forms Container */}
      <div className={styleDocs.filterContainer}>
        <h2>Removal / Completion Forms</h2>
        <div className={styleDocs.filters}>
          <select
            name="academicYear"
            value={selectedAcademicYearForRemoval}
            onChange={(e) => setSelectedAcademicYearForRemoval(e.target.value)}
            className={styleDocs.filterDropdown}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(ay => (
              <option key={ay._id} value={ay.ay}>{ay.ay}</option>
            ))}
          </select>

          <select
            name="semester"
            value={selectedSemesterForRemoval}
            onChange={(e) => setSelectedSemesterForRemoval(e.target.value)}
            className={styleDocs.filterDropdown}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={sem.semester}>{sem.semester}</option>
            ))}
          </select>

          {/* Search Input for Removal/Completion Forms */}
          <input
            type="text"
            placeholder="Search by file name"
            value={searchTermRemoval}
            onChange={(e) => setSearchTermRemoval(e.target.value)}
            className={styleDocs.searchInput} // Optional: add a CSS class for styling
          />
        </div>
        <div className={styleDocs.cardContainer}>
          {filteredRemovalForms.length > 0 ? (
            filteredRemovalForms.map((file) => {
              const imageUrl = `${backendUrl}${file.url}`;
              return (
                <div className={styleDocs.card} key={file.name}>
                  <img
                    src={imageUrl}
                    alt={file.name}
                    className={styleDocs.image}
                    onClick={() => handleClick({ ...file, url: imageUrl })}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    onClick={() => handleClick({ ...file, url: imageUrl })}
                    className={styleDocs.link}
                  >
                    {file.name}
                  </button>
                </div>
              );
            })
          ) : (
            <p>No removal/completion forms available.</p>
          )}
        </div>
      </div>

      {/* Modal for Selected File */}
      {selectedFile && (
        <div className={styleDocs.modal}>
          <div className={styleDocs.modalContent}>
            <span className={styleDocs.close} onClick={closeModal}>
              &times;
            </span>
            <img src={selectedFile.url} alt="Selected" className={styleDocs.modalImage} />
            <button onClick={handleDownload} className={styleDocs.downloadButton}>
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
