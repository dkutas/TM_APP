import {Link, NavLink, useNavigate, useRoutes} from "react-router-dom";
import {routes} from "./routes.tsx";
import {useEffect, useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SettingsIcon from '@mui/icons-material/Settings';
import CommandPalette from "../layout/CommandPalette.tsx";
import {useAuth} from "../auth/authContext.tsx";
import {ConfirmDialog} from "./Confirm/ConfirmDialog.tsx";


function App() {
    const page = useRoutes(routes)
    const [palette, setPalette] = useState(false)
    const {user, logout} = useAuth()
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPalette(v => !v)
            }
        }

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey)
    }, [])
    const navigate = useNavigate()
    const handleClickAuth = () => {
        if (user?.id) {
            logout();
        } else {
            navigate('/login');
        }
    }
    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position="fixed" sx={{zIndex: (t) => t.zIndex.drawer + 1}}>
                <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant="h6" component={Link} to="/profile"
                                sx={{color: 'inherit', textDecoration: 'none', ml: 1, mr: 2}}>Ticketify</Typography>
                    <Stack direction="row" spacing={1} sx={{ml: 2, alignItems: 'center', justifyItems: 'center'}}>
                        <Button color="inherit" variant="outlined"
                                onClick={handleClickAuth}>{user?.id ? "Logout" : "Login"}</Button>
                    </Stack>
                </Toolbar>
            </AppBar>
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 220,
                borderRight: 1,
                borderColor: 'divider',
                height: '100vh',
                bgcolor: 'background.paper'
            }}>
                <Toolbar/>
                <List sx={{
                    gap: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: "column",
                    height: "full",
                }}>
                    <Box>
                        <ListItemButton sx={{pr: 5}} component={NavLink} to='/projects'>
                            <ListItemIcon>
                                <AccountTreeIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Projects"/>
                        </ListItemButton>
                        <ListItemButton sx={{pr: 5}} component={NavLink} to='/issues'>
                            <ListItemIcon>
                                <ConfirmationNumberIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Issues"/>
                        </ListItemButton>
                    </Box>
                    <Box>
                        <ListItemButton sx={{pr: 5}} component={NavLink} to='/settings'>
                            <ListItemIcon>
                                <SettingsIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Settings"/>
                        </ListItemButton>
                    </Box>
                </List>
            </Box>

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                ml: "220px",
                justifyContent: 'space-between',
                pb: (t) => `calc(${(t.mixins.toolbar).minHeight || 56}px + ${t.spacing(1)})`
            }}>
                <Toolbar/>
                <Container maxWidth="2xl">
                    {page}
                </Container>
                <CommandPalette open={palette} onClose={() => setPalette(false)}/>
            </Box>
            <AppBar position="fixed" color="primary" sx={{top: 'auto', bottom: 0}}><Toolbar/></AppBar>
            <ConfirmDialog/>
        </Box>
    )
}

export default App
