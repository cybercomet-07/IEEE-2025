import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-test.jsx'
import './index.css'

console.log('Main.jsx loaded successfully')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
