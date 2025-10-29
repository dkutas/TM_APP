import {Box, Button, Paper, Stack, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useAuth} from "./authContext.tsx";

export default function LoginPage() {
    const {login} = useAuth();
    const [email, setEmail] = useState('kutas.d@gmail.com');
    const [password, setPassword] = useState('Admin');

    return (
        <Box display="flex" justifyContent="center" mt={6}>
            <Paper sx={{p: 3, width: 420}}>
                <Typography variant="h5" gutterBottom>Login</Typography>
                <Stack spacing={2}>
                    <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)}/>
                    <TextField label="Password" type="password" value={password}
                               onChange={e => setPassword(e.target.value)}/>
                    <Button variant="contained" onClick={() => login(email, password)}>Sign in</Button>
                </Stack>
            </Paper>
        </Box>
    )
}
