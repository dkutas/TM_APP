import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './app/App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./auth/authContext.tsx";
import {createTheme, ThemeProvider} from "@mui/material";


const theme = createTheme({
    palette: {
        warning: {
            main: '#9e9e9e'
        }
    },
    components: {
        MuiPaper: {
            defaultProps: {
                variant: "outlined"
            }
        }
    }

})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            {/* @ts-expect-error vite env*/}
            <AuthProvider baseURL={import.meta.env.VITE_API_BASE ?? "http://localhost:3000"}>
                <ThemeProvider theme={theme}>
                    <App/>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
