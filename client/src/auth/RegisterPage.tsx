import {Box, Button, CircularProgress, Paper, Stack, TextField, Typography} from "@mui/material";
import {useState} from "react";
import type {AxiosErrorResponse, CreateUserDto, FieldError} from "../lib/types.ts";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./authContext.tsx";

export default function RegisterPage() {

    const [formData, setFormData] = useState<CreateUserDto>(
        {name: '', email: '', password: ''}
    );
    const [passwordAgain, setPasswordAgain] = useState<string>('');
    const [error, setError] = useState<Record<string, string> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const {register} = useAuth()

    const handleSave = () => {
        if (formData.password !== passwordAgain) {
            setError({password: 'Passwords do not match'});
            return;
        }
        register(formData).catch((error: AxiosErrorResponse<FieldError>) => {
            setError({
                [error.response.data?.field || ""]: error.response.data?.message || "An error occured"
            })

        })
    }

    return (
        <Box display="flex" justifyContent="center" mt={6}>
            {isLoading ? <CircularProgress color="secondary"/>
                :
                <Paper sx={{p: 3, width: 420}}>
                    <Typography variant="h5" gutterBottom>Register</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <TextField
                            label="Email"
                            value={formData.email}
                            error={!!error?.["email"]}
                            helperText={error?.["email"]}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={formData.password}
                            error={!!error?.["password"]}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <TextField
                            label="Password again"
                            type="password"
                            value={passwordAgain}
                            error={!!error?.["password"]}
                            helperText={error?.["password"]}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                        />
                        <Box sx={{display: "flex", justifyContent: "space-between"}}>
                            <Button variant="text" onClick={() => navigate("/")}>Cancel</Button>
                            <Button variant="contained" onClick={handleSave}>Create account</Button>
                        </Box>
                    </Stack>
                </Paper>
            }
        </Box>
    )
}
