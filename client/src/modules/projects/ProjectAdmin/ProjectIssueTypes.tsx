import Grid from "@mui/material/Grid2";
import {Box, Button, IconButton, List, ListItemButton, ListItemText, Paper, Typography} from "@mui/material";
import type {
    PitCustomFieldContext,
    PitWorkflow,
    ProjectIssueType,
    ProjectIssueTypeResponse
} from "../../../lib/types.ts";
import {useCallback, useEffect, useState} from "react";
import {api} from "../../../lib/apiClient.ts";
import {AddIssueTypeModal} from "./AddIssueTypeModal.tsx";
import {Delete, Edit} from "@mui/icons-material";
import {useConfirm} from "../../../app/Confirm/useConfirm.ts";
import {AddCustomFieldContextModal} from "./AddCustomFieldContextModal.tsx";
import {EditCustomFieldContextModal} from "./EditCustomFieldContextModal.tsx";

interface ProjectIssueTypeProps {
    projectId: string;
}

export const ProjectIssueTypes = ({projectId}: ProjectIssueTypeProps) => {
    const [projectIssueTypes, setProjectIssueTypes] = useState<ProjectIssueType[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIssueType, setSelectedIssueType] = useState<ProjectIssueType | null>(null);
    const [pitWorkflow, setPitWorkflow] = useState<PitWorkflow | null>(null);
    const [pitCustomFields, setPitCustomFields] = useState<Array<PitCustomFieldContext> | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedContextId, setSelectedContextId] = useState<string>("");
    const [isAddCFOpen, setIsAddCFOpen] = useState(false);

    const {openConfirm} = useConfirm("Are you sure you want to unassign this custom field?");


    const fetchIssueTypes = useCallback(() => {
        if (projectId) {
            api.get<ProjectIssueTypeResponse>(`project/${projectId}/issue-types`).then((r) => setProjectIssueTypes(r.data.projectIssueTypes));
        }
    }, [projectId])

    const refetchContexts = useCallback(() => {
        if (selectedIssueType) {
            api.get<Array<PitCustomFieldContext>>(`/field-context/${projectId}/${selectedIssueType.issueType.id}`).then((r) => setPitCustomFields(r.data));
        }
    }, [projectId, selectedIssueType])

    useEffect(() => {
        if (selectedIssueType) {
            api.get<PitWorkflow>(`/workflow/project/${projectId}/issueType/${selectedIssueType.issueType.id}`).then((r) => setPitWorkflow(r.data));
            api.get<Array<PitCustomFieldContext>>(`/field-context/${projectId}/${selectedIssueType.issueType.id}`).then((r) => setPitCustomFields(r.data));
        }
    }, [projectId, selectedIssueType]);

    useEffect(() => {
        fetchIssueTypes()
    }, [fetchIssueTypes])

    const handleUnassignCustomField = (cfCtxId: string) => {
        if (!selectedIssueType) return;
        api.delete(`/field-context/${cfCtxId}`)
            .then(() => {
                // Refresh the custom fields list
                api.get<Array<PitCustomFieldContext>>(`/field-context/${projectId}/${selectedIssueType.issueType.id}`).then((r) => setPitCustomFields(r.data));
            });
    }

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
                            <ListItemButton onClick={() => {
                                console.log(it.id)
                                setSelectedIssueType(it)
                            }} key={it.id}
                                            selected={selectedIssueType?.id === it.id}>
                                <ListItemText disableTypography sx={{display: "flex", justifyContent: "center"}}>
                                    <Typography fontWeight="bold" fontSize="large">{it.issueType.name}</Typography>
                                </ListItemText>
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            </Grid>
            <Grid size={{xs: 12, md: 9}}>
                <Paper>
                    <Box>
                        {selectedIssueType ? (
                            <Box sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 3}}>
                                <Typography variant="h4">{selectedIssueType.issueType.name}</Typography>
                                <Typography variant="h6">Workflow</Typography>
                                {pitWorkflow ? (
                                    <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2}}>
                                        <Typography>Name: {pitWorkflow.name}</Typography>
                                        <Typography>Description: {pitWorkflow.description || '—'}</Typography>
                                    </Box>
                                ) : (
                                    <Typography>No workflow assigned.</Typography>
                                )}
                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                    <Typography variant="h6">Custom Fields</Typography>
                                    <Button variant="contained" onClick={() => setIsAddCFOpen(true)}>Add Custom
                                        field</Button>
                                </Box>
                                {pitCustomFields && pitCustomFields.length > 0 ? (
                                    <Box sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        p: 2
                                    }}>
                                        {pitCustomFields.map((cfCtx) => (
                                            <Box key={cfCtx.id}
                                                 sx={{mb: 2, display: "flex", justifyContent: "space-between"}}>
                                                <Box>
                                                    <Typography
                                                        fontWeight="bold">Name: {cfCtx.fieldDef.name}</Typography>
                                                    <Typography>Description: {cfCtx.fieldDef.description || '—'}</Typography>
                                                    <Typography>Type: {cfCtx.fieldDef.dataType.toLowerCase() || '—'}</Typography>
                                                </Box>
                                                <Box>
                                                    <IconButton onClick={() => {
                                                        setIsEditOpen(true)
                                                        setSelectedContextId(cfCtx.id)
                                                    }}>
                                                        <Edit/>
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => openConfirm(() => handleUnassignCustomField(cfCtx.id))}>
                                                        <Delete/>
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography>No custom fields assigned.</Typography>
                                )}
                            </Box>
                        ) : (
                            <Box sx={{p: 3}}>
                                <Typography variant="h6">Select an issue type to view details.</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Grid>
            <AddIssueTypeModal projectId={projectId} open={isAddModalOpen} closeDialog={() => setIsAddModalOpen(false)}
                               onSave={fetchIssueTypes}/>
            <EditCustomFieldContextModal id={selectedContextId} open={isEditOpen}
                                         closeDialog={() => setIsEditOpen(false)} onSave={fetchIssueTypes}/>
            {selectedIssueType?.id ?
                (
                    <AddCustomFieldContextModal open={isAddCFOpen} closeDialog={() => setIsAddCFOpen(false)}
                                                onSave={refetchContexts} projectId={projectId}
                                                issueTypeId={selectedIssueType.issueType.id}/>) : null
            }
        </Grid>
    );
};