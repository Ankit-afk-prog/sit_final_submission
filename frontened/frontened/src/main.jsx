
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Imports your main application code

// Finds the div with id="root" in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Renders your main application component */}
    <App />
  </React.StrictMode>,
);