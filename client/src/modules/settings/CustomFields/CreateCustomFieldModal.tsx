import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import type {ModalProps} from "../types.ts";
import {useState} from "react";
import {type CustomFieldDefinitionBase, DataType} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

export const CreateCustomFieldModal = ({open = false, closeDialog, onSave}: ModalProps) => {
    const [formValues, setFormValues] = useState<CustomFieldDefinitionBase | null>(null);
    const handleSave = () => {
        if (formValues) {
            api.post<CustomFieldDefinitionBase>("field-definition", formValues).then(() => {
                onSave();
            })
        }
    }
    return (
        <Dialog open={open}>
            <DialogTitle>Create custom fields</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    <TextField
                        label="Field Name"
                        value={formValues?.name || ''}
                        onChange={(e) => setFormValues({
                            ...formValues!,
                            name: e.target.value
                        })}
                    />
                    <FormControl fullWidth={true}>
                        <InputLabel id="data-type-label">Data Type</InputLabel>
                        <Select
                            labelId="data-type-label"
                            id="data-type-select"
                            value={formValues?.dataType || ''}
                            label="Data Type"
                            onChange={(e) => setFormValues({
                                ...formValues!,
                                dataType: e.target.value as CustomFieldDefinitionBase['dataType']
                            })}
                        >
                            {Object.keys(DataType).map(key => (
                                <MenuItem key={key}
                                          value={DataType[key as keyof typeof DataType]}>{DataType[key as keyof typeof DataType]}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Description"
                        value={formValues?.description || ''}
                        multiline
                        minRows={3}
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