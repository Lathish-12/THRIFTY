import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

// IMPORTANT: Replace this Client ID with your own from the Google Cloud Console
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "898910923504-sgibb3oqq5gdvimtiovvfknaujfdlg0s.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
