// src/utils/contexts/AppProviders.jsx

import React from 'react';
import { ActiveButtonProvider } from './ActiveButtonContext';
import { ClassProgramProvider } from './ClassProgramProvider';
import { InstructorIdProvider } from './InstructorIdProvider';
import { StudentIdProvider } from './StudentIdProvider';

export const AppProviders = ({ children }) => {
  return (
    <StudentIdProvider>
      <InstructorIdProvider>
        <ClassProgramProvider>
          <ActiveButtonProvider>
            {children}
          </ActiveButtonProvider>
        </ClassProgramProvider>
      </InstructorIdProvider>
    </StudentIdProvider>
    
  );
};
