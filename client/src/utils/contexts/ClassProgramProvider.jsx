import React, { createContext, useContext, useState } from 'react';

const ClassProgramContext = createContext();

export const useClassProgram = () => {
  return useContext(ClassProgramContext);
};

export const ClassProgramProvider = ({ children }) => {
  const [selectedClassProgramId, setSelectedClassProgramId] = useState(null);

  return (
    <ClassProgramContext.Provider value={{ selectedClassProgramId, setSelectedClassProgramId }}>
      {children}
    </ClassProgramContext.Provider>
  );
};
