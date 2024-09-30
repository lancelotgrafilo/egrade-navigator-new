import React from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ element, requiredTitle }) {
  const userTitle = JSON.parse(localStorage.getItem('user'))?.title;
  const token = localStorage.getItem('token');

  // console.log('ProtectedRoute Debugging:');
  // console.log('User title:', userTitle);
  // console.log('Required title:', requiredTitle);

  if (!token) {
    console.log('User is not authenticated. Redirecting to /login.');
    return <Navigate to="/login" />;
  }

  if (requiredTitle && userTitle !== requiredTitle) {
    console.log('User title does not match required title. Redirecting to /unauthorized.');
    return <Navigate to="/unauthorized" />;
  }

  return element;
}


