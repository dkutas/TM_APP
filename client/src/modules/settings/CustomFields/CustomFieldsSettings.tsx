import {useEffect, useState} from "react";
import type {IssueType} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";
import {Box, Button, Card, CardContent, IconButton, Paper, Stack, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {Visibility} from "@mui/icons-material";

export const CustomFieldsSettings = () => {
    const [items, setItems] = useState<IssueType[]>([]);

    useEffect(() => {
        api.get<IssueType[]>("/field-definition").then((r) => setItems(r.data));
    }, []);


    const onAdd = () => {/* open create modal */
    };
    const onEdit = (id: string) => {/* open edit modal */
    };
    const onDelete = (id: string) => {/* confirm + call api.delete(`/issue-type/${id}`) */
    };
    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 2}}>
                <Typography variant="h5">Custom fields</Typography>
                <Button startIcon={<AddIcon/>} variant="contained" onClick={onAdd}>
                    Add Custom field
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
                                <IconButton aria-label="view" onClick={() => onEdit(t.id)}>
                                    <Visibility/>
                                </IconButton>
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

        </>
    );
};