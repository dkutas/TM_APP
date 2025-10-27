import Grid from "@mui/material/Grid2";
import {Divider, List, ListItemButton, ListItemText, Paper,} from "@mui/material";
import {NavLink, Outlet, useLocation} from "react-router-dom";


export default function SettingsPage() {
    const {pathname} = useLocation();


    return (
        <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 3}}>
                <Paper sx={{borderRadius: 3, position: "sticky"}}>
                    <List disablePadding>
                        <ListItemButton component={NavLink} to="/settings/issue-types"
                                        selected={pathname.includes("issue-types")}>
                            <ListItemText primary="Issuetypes"/>
                        </ListItemButton>
                        <Divider/>
                        <ListItemButton component={NavLink} to="/settings/custom-fields"
                                        selected={pathname.includes("custom-fields")}>
                            <ListItemText primary="Customfields"/>
                        </ListItemButton>
                        <Divider/>
                        <ListItemButton component={NavLink} to="/settings/workflows"
                                        selected={pathname.includes("workflows")}>
                            <ListItemText primary="Workflows"/>
                        </ListItemButton>
                    </List>
                </Paper>
            </Grid>

            <Grid size={{xs: 12, md: 9}}>
                <Outlet/>
            </Grid>
        </Grid>
    );
}