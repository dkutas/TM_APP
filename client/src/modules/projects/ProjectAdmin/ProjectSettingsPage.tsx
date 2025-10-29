import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import type {MembershipWithRole, Project} from "../../../lib/types.ts";
import {Avatar, Chip, CircularProgress, Paper, Stack, Tab, Tabs, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {api} from "../../../lib/apiClient.ts";
import {ProjectIssueTypes} from "./ProjectIssueTypes.tsx";

export function ProjectSettingsPage() {
    const {projectId} = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [projectMembers, setProjectMembers] = useState<MembershipWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState(0);


    useEffect(() => {
        if (projectId) {
            setIsLoading(true);
            Promise.all([api.get(`project/${projectId}`).then(res => res.data), api.get(`project/${projectId}/members-with-roles`).then(res => res.data)]).then(([projectData, membersData]) => {
                    setProject(projectData);
                    setProjectMembers(membersData);
                    setIsLoading(false);
                }
            )
        }
    }, [projectId]);

    if (!projectId || !project) return null;

    if (isLoading) {
        return <CircularProgress/>;
    }

    return (
        <Grid container spacing={3}>
            <Grid size={12}>
                <Typography variant="h4">{project.key} — {project.name}</Typography>
                <Typography variant="body1" color="text.secondary">{project.description}</Typography>
            </Grid>
            <Grid size={12}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Overview"/>
                    <Tab label="Users"/>
                    <Tab label="Issue types"/>
                </Tabs>
            </Grid>
            <Grid size={12}>
                {tab === 0 && (
                    <Paper sx={{p: 2}}>
                        <Typography variant="h6">Project Overview</Typography>
                        <Typography mt={1}>Key: {project.key}</Typography>
                        <Typography>Description: {project.description || '—'}</Typography>
                    </Paper>
                )}
                {tab === 1 && (
                    <Paper sx={{p: 2}}>
                        <Typography variant="h6" gutterBottom>Users</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {projectMembers.map(u => (
                                <Chip key={u.id} avatar={<Avatar>{u.user.name?.[0]}</Avatar>}
                                      label={`${u.user.name} - (${u.role.name})`}/>
                            ))}
                        </Stack>
                    </Paper>
                )}
                {tab === 2 && (
                    <ProjectIssueTypes projectId={projectId}/>
                )}
            </Grid>
        </Grid>
    );
}
