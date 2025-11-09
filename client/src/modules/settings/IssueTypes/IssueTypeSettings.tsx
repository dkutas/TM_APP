import {Box, Button, Card, CardContent, CircularProgress, IconButton, Paper, Stack, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {useCallback, useEffect, useState} from "react";
import {api} from "../../../lib/apiClient.ts";
import type {IssueType} from "../../../lib/types.ts";
import {EditIssueTypeModal} from "./EditIssueTypeModal.tsx";
import {CreateIssueTypeModal} from "./CreateIssueTypeModal.tsx";
import {useConfirm} from "../../../app/Confirm/useConfirm.ts";

export const IssueTypeSettings = () => {
    const [items, setItems] = useState<IssueType[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedIssueTypeId, setSelectedIssueTypeId] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        api.get<IssueType[]>("/issue-type").then((r) => {
            setItems(r.data)
            setIsLoading(false)
        });
    }, []);

    const refreshIssueTypes = useCallback(() => {
        setIsLoading(true)
        api.get<IssueType[]>("/issue-type").then((r) => {
            setItems(r.data)
            setIsLoading(false)
        });
    }, [])

    const handleOnSave = async () => {
        setCreateOpen(false)
        setEditOpen(false)
        refreshIssueTypes()
    }

    const {openConfirm} = useConfirm("Are you sure you want to delete this issueType?")


    const onAdd = () => {
        setCreateOpen(true);
    };
    const onEdit = (id: string) => {
        setEditOpen(true);
        setSelectedIssueTypeId(id)
    };
    const onDelete = (id: string) => {
        const deleteCB = () => api.delete(`/issue-type/${id}`).then((r) => {
            refreshIssueTypes();
        });
        openConfirm(deleteCB);
    };
    if (isLoading) {
        return <CircularProgress/>;
    } else
        return (
            <>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 2}}>
                    <Typography variant="h5">IssueTypes</Typography>
                    <Button startIcon={<AddIcon/>} variant="contained" onClick={onAdd}>
                        Add IssueType
                    </Button>
                </Stack>

                <Stack spacing={2}>
                    {items.map((t) => (
                        <Card key={t.id} variant="outlined" sx={{borderRadius: 3}}>
                            <CardContent
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(160px, 1fr) 2fr auto",
                                    gap: 2,
                                    alignItems: "center",
                                }}
                            >
                                <Box>
                                    <Typography variant="h6">{t.name}</Typography>
                                </Box>
                                <Typography color="text.secondary" noWrap>
                                    {t.description || "—"}
                                </Typography>
                                <Box sx={{display: "flex", gap: 1}}>
                                    <IconButton aria-label="edit" onClick={() => onEdit(t.id)}>
                                        <EditIcon/>
                                    </IconButton>
                                    <IconButton aria-label="delete" onClick={() => onDelete(t.id)}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}

                    {items.length === 0 && (
                        <Paper variant="outlined" sx={{p: 4, borderRadius: 3, textAlign: "center"}}>
                            <Typography color="text.secondary">No issue types yet.</Typography>
                        </Paper>
                    )}
                </Stack>
                <EditIssueTypeModal open={editOpen} id={selectedIssueTypeId} closeDialog={() => setEditOpen(false)}
                                    onSave={handleOnSave}/>
                <CreateIssueTypeModal open={createOpen} closeDialog={() => setCreateOpen(false)} onSave={handleOnSave}/>
            </>
        );
};