import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register simple service worker for basic caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-simple.js')
      .then((registration) => {
        console.log('Simple Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
