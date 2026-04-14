import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { seedDatabase } from './services/seedService.js'

const initApp = async () => {
  // Automatically seed the database on app load if it's empty
  // and handle auto-login for the demo environment
  await seedDatabase();

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

initApp();
