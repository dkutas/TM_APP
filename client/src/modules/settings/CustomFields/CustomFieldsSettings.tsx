import {useEffect, useState} from "react";
import type {CustomFieldDefinitionBase} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";
import {Box, Button, Card, CardContent, IconButton, Stack, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {Visibility} from "@mui/icons-material";
import {EditCustomFieldModal} from "./EditCustomFieldModal.tsx";
import {CreateCustomFieldModal} from "./CreateCustomFieldModal.tsx";
import {useNavigate} from "react-router-dom";

export const CustomFieldsSettings = () => {
    const [items, setItems] = useState<CustomFieldDefinitionBase[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState<string>("")
    const navigate = useNavigate();

    useEffect(() => {
        api.get<CustomFieldDefinitionBase[]>("/field-definition").then((r) => setItems(r.data));
    }, []);

    const handleOnSave = () => {
        setCreateOpen(false)
        setEditOpen(false)
        api.get<CustomFieldDefinitionBase[]>("/field-definition").then((r) => setItems(r.data));
    }


    const onAdd = () => {
        setCreateOpen(true)
    };
    const onEdit = (id: string) => {
        setSelectedFieldId(id);
        setEditOpen(true);
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
                                gridTemplateColumns: "minmax(160px, 1fr) 1fr 2fr auto",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Box>
                                <Typography variant="h6">{t.name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">{t.dataType.toLowerCase().split("_").join(" ")}</Typography>
                            </Box>
                            <Typography color="text.secondary" noWrap>
                                {t.description || "—"}
                            </Typography>
                            <Box sx={{display: "flex", gap: 1}}>
                                <IconButton aria-label="view"
                                            onClick={() => navigate(`/settings/custom-fields/${t.id}/contexts`)}>
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
            <EditCustomFieldModal id={selectedFieldId} open={editOpen} closeDialog={() => setEditOpen(false)}
                                  onSave={handleOnSave}/>
            <CreateCustomFieldModal open={createOpen} closeDialog={() => {
                setCreateOpen(false)
            }} onSave={handleOnSave}/>

        </>
    );
};