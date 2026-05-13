// App entry point: mounts React and wires Redux.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {Provider} from 'react-redux';
import './index.css'
import App from './App.jsx'

import {store} from './store/store.js';

// Mount the React app to the #root element in index.html.
createRoot(document.getElementById('root')).render(
  // StrictMode helps catch side effects and unsafe patterns in development.
  <StrictMode>
    {/* Provide Redux store to the full app tree. */}
    <Provider store={store}>
        <App />
    </Provider>
    
    
  </StrictMode>,
)
