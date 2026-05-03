import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // ✅ यह जरूरी है


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
