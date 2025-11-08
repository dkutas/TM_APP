import {useEffect, useState} from "react";
import type {IssueType} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";
import {Box, Button, Card, CardContent, IconButton, Stack, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {Visibility} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import {useNavigate} from "react-router-dom";

export const WorkflowSettings = () => {
    const [items, setItems] = useState<IssueType[]>([]);

    useEffect(() => {
        api.get<IssueType[]>("/workflow").then((r) => setItems(r.data));
    }, []);

    const navigate = useNavigate();


    const onAdd = () => {/* open create modal */
        navigate("new")
    };
    const onView = (id: string) => {
        navigate(`${id}/view`);
    };
    const onEdit = (id: string) => {/* confirm + call api.delete(`/issue-type/${id}`) */
        navigate(`${id}`);
    };
    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 2}}>
                <Typography variant="h5">Workflows</Typography>
                <Button startIcon={<AddIcon/>} variant="contained" onClick={onAdd}>
                    Create Workflow
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
                                <IconButton aria-label="view" onClick={() => onView(t.id)}>
                                    <Visibility/>
                                </IconButton>
                                <IconButton aria-label="edit" onClick={() => onEdit(t.id)}>
                                    <EditIcon/>
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

        </>
    );
};