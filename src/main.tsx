import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DatenProvider } from './store.tsx'

/* <DatenProvider> legt sich wie eine Klammer um die ganze App.
   Dadurch kommt jede Seite an die gespeicherten Daten heran. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DatenProvider>
      <App />
    </DatenProvider>
  </StrictMode>,
)
