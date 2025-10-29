import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import type {CreateCrudModalProps} from "../../settings/types.ts";
import {useState} from "react";
import {api} from "../../../lib/apiClient.ts";

type CreateProjectDTO = {
    name: string;
    description?: string;
    key: string;
}

export const CreateProjectModal = ({open, closeDialog, onSave}: CreateCrudModalProps) => {

    const [formValues, setFormValues] = useState<CreateProjectDTO | null>(null);

    const handleSave = () => {
        if (formValues) {
            api.post<CreateProjectDTO>("/project", formValues).then(() => {
                onSave();
                closeDialog()
            })
        }
    }
    return (
        <Dialog open={open}>
            <DialogTitle>Create Project</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    <TextField
                        label="Project's name"
                        value={formValues?.name || ""}
                        onChange={(e) => setFormValues({
                            ...formValues!,
                            key: e.target.value.split(" ").join("_").toUpperCase().substring(0, 10),
                            name: e.target.value
                        })}
                    />
                    <TextField
                        label="Project's key"
                        value={formValues?.key || ""}
                        disabled
                    />
                    <TextField
                        label="Project's description"
                        multiline
                        minRows={3}
                        value={formValues?.description || ""}
                        onChange={(e) => setFormValues({
                            ...formValues!,
                            description: e.target.value
                        })}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button variant="outlined" onClick={closeDialog}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};