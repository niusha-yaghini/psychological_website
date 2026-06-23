import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ← اضافه کنید
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* ← App رو داخل BrowserRouter قرار بدید */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)