import {Link, NavLink, useRoutes} from "react-router-dom";
import {routes} from "./routes.tsx";
import {useEffect, useState} from "react";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    Drawer,
    IconButton,
    InputBase,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import CommandPalette from "../layout/CommandPalette.tsx";

const drawerWidth = 240

const navItems = [
    {to: '/dashboard', label: 'Dashboard', Icon: <DashboardIcon/>},
    {to: '/projects', label: 'Projects', Icon: <AccountTreeIcon/>},
    {to: '/projects/1', label: 'Issues', Icon: <ConfirmationNumberIcon/>},
    {to: '/projects/1/board', label: 'Board', Icon: <SpaceDashboardIcon/>},
    {to: '/projects/1/settings', label: 'Project Settings', Icon: <SettingsIcon/>}
]


function App() {
    const element = useRoutes(routes)
    const [open, setOpen] = useState(true)
    const [palette, setPalette] = useState(false)
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
    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position="fixed" sx={{zIndex: (t) => t.zIndex.drawer + 1}}>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => setOpen((o) => !o)}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component={Link} to="/"
                                sx={{color: 'inherit', textDecoration: 'none', ml: 1, mr: 2}}>Jira-like</Typography>
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
                        <Button color="inherit" startIcon={<AddIcon/>}>Create</Button>
                        <Avatar sx={{width: 28, height: 28}}>A</Avatar>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open} sx={{
                '& .MuiDrawer-paper': {width: open ? drawerWidth : 60, boxSizing: 'border-box'}
            }}>
                <Toolbar/>
                <List>
                    {navItems.map((it) => (
                        <ListItemButton key={it.to} component={NavLink} to={it.to}>
                            <ListItemIcon>
                                {it.Icon}
                            </ListItemIcon>
                            {open ? <ListItemText primary={it.label}/> : null}
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <Toolbar/>
                <Container maxWidth="xl">
                    {element}
                </Container>
                <CommandPalette open={palette} onClose={() => setPalette(false)}/>
            </Box>
        </Box>
    )
}

export default App
