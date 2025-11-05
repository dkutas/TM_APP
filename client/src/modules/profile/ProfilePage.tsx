import {Avatar, Box, Paper, Stack, Typography} from "@mui/material";
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
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (user?.id) {
            Promise.all([api.get<UserProject[]>("user/" + user?.id + "/memberships").then(res => res.data),
                api.get<UserIssue[]>(`issue/search?role=assignee`).then(res => res.data)]).then(([memberships, issue]) => {
                setProjects(memberships);
                setIssues(issue);
                setIsLoading(false);
            })
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

            <Box
                sx={{gap: 5, mt: 4, display: "flex", justifyContent: "space-between"}}>
                <Paper sx={{flex: 1, display: "flex", p: 2}}>
                    <ProjectsPanel projects={projects} isLoading={isLoading}/>
                </Paper>
                <Paper sx={{flex: 1, display: "flex", p: 2}}>
                    <IssuesPanel issues={issues} isLoading={isLoading}/>
                </Paper>
            </Box>
        </Box>
    )
}
