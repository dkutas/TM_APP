import Grid from "@mui/material/Grid2";
import {Divider, List, ListItemButton, ListItemText, Paper, Typography,} from "@mui/material";
import {NavLink, Outlet, useLocation} from "react-router-dom";


export default function SettingsPage() {
    const {pathname} = useLocation();


    return (
        <Grid container gap={2} spacing={2}>
            <Grid size={{xs: 12, md: 2}}>
                <Paper sx={{
                    borderRadius: 3,
                    flexGrow: 1,
                    position: 'sticky',
                    top: (t) => `${(2 * +(t.mixins.toolbar?.minHeight ?? 56))}px`,
                    height: (t) => `calc(100vh - ${(4 * +(t.mixins.toolbar?.minHeight ?? 56))}px)`,
                    display: 'flex',
                    overflow: 'hidden',
                }}>
                    <List disablePadding sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        alignItems: 'space-around',
                        flexGrow: 1,
                        height: '100%',
                        width: '100%',
                        p: 0,
                        overflow: 'auto'
                    }}>
                        <ListItemButton component={NavLink} to="/settings/issue-types"
                                        selected={pathname.includes("issue-types")}>
                            <ListItemText disableTypography sx={{display: "flex", justifyContent: "center"}}>
                                <Typography fontWeight="bold" fontSize="large">ISSUE TYPES</Typography>
                            </ListItemText>
                        </ListItemButton>
                        <Divider/>
                        <ListItemButton component={NavLink} to="/settings/custom-fields"
                                        selected={pathname.includes("custom-fields")}>
                            <ListItemText disableTypography sx={{display: "flex", justifyContent: "center"}}
                            >
                                <Typography fontWeight="bold" fontSize="large">CUSTOM FIELDS</Typography>
                            </ListItemText>
                        </ListItemButton>
                        <Divider/>
                        <ListItemButton component={NavLink} to="/settings/workflows"
                                        selected={pathname.includes("workflows")}>
                            <ListItemText disableTypography sx={{display: "flex", justifyContent: "center"}}
                            >
                                <Typography fontWeight="bold" fontSize="large">WORKFLOWS</Typography>
                            </ListItemText>
                        </ListItemButton>
                    </List>
                </Paper>
            </Grid>

            <Grid size={{xs: 12, md: 10}}>
                <Outlet/>
            </Grid>
        </Grid>
    );
}