import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'

// Global event listener to prevent typing non-numeric characters in any input[type=number]
document.addEventListener('keypress', (e) => {
  if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
    // Hanya izinkan angka (0-9)
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }
}, true);

// Global event listener to prevent pasting non-numeric text in any input[type=number]
document.addEventListener('paste', (e) => {
  if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d*$/.test(pasteData)) {
      e.preventDefault();
    }
  }
}, true);

createRoot(document.getElementById('root')).render(
  <App />
)