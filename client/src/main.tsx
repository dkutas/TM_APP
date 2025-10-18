import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './app/App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./auth/authContext.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            {/* @ts-expect-error vite env*/}
            <AuthProvider baseURL={import.meta.env.VITE_API_BASE ?? "http://localhost:3000"}>
                <App/>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
