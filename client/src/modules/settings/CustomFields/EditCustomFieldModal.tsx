import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from "@mui/material";
import type {EditCrudModalProps} from "../types.ts";
import {useEffect, useState} from "react";
import {type CustomFieldDefinitionBase} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";


export const EditCustomFieldModal = ({open, id, closeDialog, onSave}: EditCrudModalProps) => {
    const [selectedField, setSelectedField] = useState<CustomFieldDefinitionBase | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        api.get<CustomFieldDefinitionBase>(`field-definition/${id}`).then((res) => {
            setSelectedField(res.data);
            setIsLoading(false);
        })
    }, [id]);

    const onEditFieldName = (newName: string) => {
        if (selectedField) {
            setSelectedField({...selectedField, name: newName});
        }
    }

    const onEditFieldDescription = (newDescription: string) => {
        if (selectedField) {
            setSelectedField({...selectedField, description: newDescription});
        }
    }

    const handleFieldUpdate = async () => {
        if (selectedField) {
            await api.patch(`/field-definition/${id}`, selectedField);
        }
    }

    const handleSave = async () => {
        setIsLoading(true);
        await handleFieldUpdate();
        setIsLoading(false);
        onSave();
    }


    if (isLoading) {
        return <CircularProgress/>
    }

    return (
        <Dialog open={open}>
            {isLoading ? (
                <CircularProgress/>
            ) : <>
                <DialogTitle>{`Edit ${selectedField?.name || "custom field"}`}</DialogTitle>
                <DialogContent>
                    <Stack sx={{gap: 3, width: "400px", py: 2}}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={selectedField?.name}
                            onChange={(e) => onEditFieldName(e.target.value)}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            minRows={3}
                            value={selectedField?.description || ""}
                            onChange={(e) => onEditFieldDescription(e.target.value)}
                        />

                    </Stack>
                </DialogContent>
                <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                    <Button variant="outlined" onClick={closeDialog}>Close</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </>
            }
        </Dialog>
    );
};