import Grid from "@mui/material/Grid2";
import {Box, Button, List, ListItemButton, ListItemText, Paper, Typography} from "@mui/material";
import type {ProjectIssueType, ProjectIssueTypeResponse} from "../../../lib/types.ts";
import {useCallback, useEffect, useState} from "react";
import {api} from "../../../lib/apiClient.ts";
import {AddIssueTypeModal} from "./AddIssueTypeModal.tsx";

interface ProjectIssueTypeProps {
    projectId: string;
}

export const ProjectIssueTypes = ({projectId}: ProjectIssueTypeProps) => {
    const [projectIssueTypes, setProjectIssueTypes] = useState<ProjectIssueType[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchIssueTypes = useCallback(() => {
        if (projectId) {
            api.get<ProjectIssueTypeResponse>(`project/${projectId}/issue-types`).then((r) => setProjectIssueTypes(r.data.projectIssueTypes));
        }
    }, [projectId])

    useEffect(() => {
        fetchIssueTypes()
    }, [fetchIssueTypes])

    return (
        <Grid container spacing={3} gap={3}>
            <Grid size={{xs: 12, md: 3}} sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant="h5">Issue Types</Typography>
                    <Button variant="contained" onClick={() => setIsAddModalOpen(true)}>Add IssueType</Button>
                </Box>
                <Paper
                    sx={{
                        borderRadius: 3,
                        flexGrow: 1,
                        position: 'sticky',
                        display: 'flex',
                        overflow: 'hidden',
                    }}>
                    <List sx={{
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
                        {projectIssueTypes.map((it) => (
                            <ListItemButton>
                                <ListItemText disableTypography sx={{display: "flex", justifyContent: "center"}}>
                                    <Typography fontWeight="bold" fontSize="large">{it.issueType.name}</Typography>
                                </ListItemText>
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            </Grid>
            <Grid size={{xs: 12, md: 9}}>
                <Paper></Paper>
            </Grid>
            <AddIssueTypeModal projectId={projectId} open={isAddModalOpen} closeDialog={() => setIsAddModalOpen(false)}
                               onSave={fetchIssueTypes}/>
        </Grid>
    );
};