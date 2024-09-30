import React, { createContext, useContext, useState } from 'react';

// Create a context for managing the student ID
const StudentIdContext = createContext();

// Custom hook to use the StudentIdContext
export const useStudentId = () => {
  const context = useContext(StudentIdContext);
  if (context === undefined) {
    throw new Error('useStudentId must be used within a StudentIdProvider');
  }
  return context;
};

// Provider component for the StudentIdContext
export const StudentIdProvider = ({ children }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [previousStudentId, setPreviousStudentId] = useState(null);

  // Function to update the student IDs
  const updateStudentIds = (newId) => {
    setPreviousStudentId(selectedStudentId);
    setSelectedStudentId(newId);
  };

  return (
    <StudentIdContext.Provider value={{ selectedStudentId, previousStudentId, updateStudentIds }}>
      {children}
    </StudentIdContext.Provider>
  );
};
