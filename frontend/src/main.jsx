// src/main.jsx — Vite/React entry point
//@author sshende
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.9rem',
            borderRadius: '10px',
            background: '#1a1a2e',
            color: '#e8e8f0',
            border: '1px solid rgba(108,99,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          success: { iconTheme: { primary: '#22d3a0', secondary: '#1a1a2e' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#1a1a2e' } },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
