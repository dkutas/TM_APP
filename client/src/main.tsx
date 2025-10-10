import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './app/App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./modules/auth/auth.store.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
)
