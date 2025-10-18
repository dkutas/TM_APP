import {Avatar, Box, Card, Paper, Stack, Typography} from "@mui/material";
import {useAuth} from "../../auth/authContext.tsx";
import {api} from "../../lib/apiClient.ts";
import {useEffect, useState} from "react";
import type {UserIssue, UserProject} from "../../lib/types.ts";
import {IssuesPanel} from "./IssuesPanel.tsx";
import {ProjectsPanel} from "./ProjectsPanel.tsx";

export default function ProfilePage() {
    const {user} = useAuth();
    const [projects, setProjects] = useState<UserProject[]>([]);
    const [issues, setIssues] = useState<UserIssue[]>([]);
    useEffect(() => {
        if (user?.id) {
            api.get<UserProject[]>("user/" + user?.id + "/memberships").then(res => {
                setProjects(res.data);
            });
            api.get<UserIssue[]>("issue/users/" + user?.id + "/issues?role=reporter").then(res => {
                setIssues(res.data);
            });
        }
    }, [user, setProjects])
    return (
        <Box display="flex" flexDirection="column" justifyContent="center" mt={4}>
            <Paper sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>{user?.name?.[0] || 'U'}</Avatar>
                    <Box>
                        <Typography variant="h6">{user?.name || 'User'}</Typography>
                        <Typography color="text.secondary">{user?.email}</Typography>
                    </Box>
                </Stack>
            </Paper>

            <Paper elevation={0}
                   sx={{gap: 5, mt: 4, display: "flex", justifyContent: "space-between"}}>
                <Card sx={{flex: 1, display: "flex", p: 2}}>
                    <ProjectsPanel projects={projects}/>
                </Card>
                <Card sx={{flex: 1, display: "flex", p: 2}}>
                    <IssuesPanel issues={issues}/>
                </Card>
            </Paper>
        </Box>
    )
}
