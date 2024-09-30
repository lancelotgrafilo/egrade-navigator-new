import React, { createContext, useContext, useState } from 'react';

// Create a context for managing the instructor ID
const InstructorIdContext = createContext();

// Custom hook to use the InstructorIdContext
export const useInstructorId = () => {
  const context = useContext(InstructorIdContext);
  if (context === undefined) {
    throw new Error('useInstructorId must be used within an InstructorIdProvider');
  }
  return context;
};

// Provider component for the InstructorIdContext
export const InstructorIdProvider = ({ children }) => {
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [previousInstructorId, setPreviousInstructorId] = useState(null);

  // Function to update the instructor IDs
  const updateInstructorIds = (newId) => {
    setPreviousInstructorId(selectedInstructorId);
    setSelectedInstructorId(newId);
  };

  return (
    <InstructorIdContext.Provider value={{ selectedInstructorId, previousInstructorId, updateInstructorIds }}>
      {children}
    </InstructorIdContext.Provider>
  );
};
