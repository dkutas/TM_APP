import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import type {Project} from "../../lib/types";
import {Paper, Tab, Tabs, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {api} from "../../lib/apiClient.ts";

export default function ProjectSettingsPage() {
    const {projectId} = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (projectId) api.get("project/" + projectId).then(res => setProject(res.data));
    }, [projectId]);

    if (!project) return null;

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
                    <Tab label="Workflows"/>
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
                        {/*<Stack direction="row" spacing={1} flexWrap="wrap">*/}
                        {/*    {project.users.map(u => (*/}
                        {/*        <Chip key={u.id} avatar={<Avatar>{u.name[0]}</Avatar>} label={`${u.name}`}/>*/}
                        {/*    ))}*/}
                        {/*</Stack>*/}
                    </Paper>
                )}
                {tab === 2 && (
                    <Paper sx={{p: 2}}>
                        <Typography>Issue types — placeholder</Typography>
                    </Paper>
                )}
                {tab === 3 && (
                    <Paper sx={{p: 2}}>
                        <Typography>Workflows — placeholder</Typography>
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
}
