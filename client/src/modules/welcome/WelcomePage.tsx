import {Box, Button, Paper, Stack, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../auth/authContext.tsx";
import {useEffect} from "react";

export default function WelcomePage() {
    const navigate = useNavigate();
    const {user} = useAuth()
    useEffect(() => {
        if (user?.id) {
            navigate('/profile')
        }
    }, [])

    return <Box display="flex" justifyContent="center" mt={6}>
        <Paper sx={{p: 3, width: 420}}>
            <Typography variant="h5" gutterBottom>Welcome to Ticketify!</Typography>
            <Typography variant="caption" gutterBottom>Log in to watch your tickets or register for an
                account!</Typography>
            <Stack sx={{justifyContent: "space-between", pt: 3}} direction="row" spacing={2} useFlexGap>
                <Button variant="contained" color="primary" onClick={() => navigate("/login")}>Login</Button>
                <Button variant="contained" color="primary" onClick={() => navigate("/register")}>Register</Button>
            </Stack>
        </Paper>
    </Box>
}