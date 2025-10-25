import {Link, NavLink, useNavigate, useRoutes} from "react-router-dom";
import {routes} from "./routes.tsx";
import {useEffect, useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    InputBase,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search'
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SettingsIcon from '@mui/icons-material/Settings';
import CommandPalette from "../layout/CommandPalette.tsx";
import {useAuth} from "../auth/authContext.tsx";
import {ConfirmDialog} from "./Confirm/ConfirmDialog.tsx";


const navItems = [
    {to: '/projects', label: 'Projects', Icon: <AccountTreeIcon/>},
    {to: '/issues', label: 'Issues', Icon: <ConfirmationNumberIcon/>},
    {to: '/settings', label: 'Settings', Icon: <SettingsIcon/>}
]


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
                <Toolbar>
                    <Typography variant="h6" component={Link} to="/profile"
                                sx={{color: 'inherit', textDecoration: 'none', ml: 1, mr: 2}}>Ticketify</Typography>
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1
                    }} onClick={() => setPalette(true)}>
                        <SearchIcon fontSize="small" color="primary"/>
                        <InputBase placeholder="Global search (⌘K)" sx={{flex: 1}}/>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ml: 2, alignItems: 'center', justifyItems: 'center'}}>
                        <Button color="inherit" variant="outlined"
                                onClick={handleClickAuth}>{user?.id ? "Logout" : "Login"}</Button>
                    </Stack>
                </Toolbar>
            </AppBar>
            {/* Fixed sidebar */}
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
                <List sx={{gap: 2}}>
                    {navItems.map((it) => (
                        <ListItemButton sx={{pr: 5}} key={it.to} component={NavLink} to={it.to}>
                            <ListItemIcon>
                                {it.Icon}
                            </ListItemIcon>
                            <ListItemText primary={it.label}/>
                        </ListItemButton>
                    ))}
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
                <Container maxWidth="xl">
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
