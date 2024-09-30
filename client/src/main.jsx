import React from 'react';
import App from './App';
import './globals.css';
import { ActiveButtonProvider } from './utils/contexts/ActiveButtonContext';
import { PathProvider } from './utils/contexts/PathContext';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ActiveButtonProvider>
      <PathProvider>
        <App />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Zoom}
          bodyClassName="toastBody"
        />

      </PathProvider>
    </ActiveButtonProvider>
  </React.StrictMode>
);
