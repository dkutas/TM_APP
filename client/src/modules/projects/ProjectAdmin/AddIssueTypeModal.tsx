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
    Stack
} from "@mui/material";
import type {CreateCrudModalProps} from "../../settings/types.ts";
import {useEffect, useState} from "react";
import {type IssueType} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

export const AddIssueTypeModal = ({open, closeDialog, onSave, projectId}: CreateCrudModalProps & {
    projectId: string
}) => {
    const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
    const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);

    useEffect(() => {
        api.get<IssueType[]>("issue-type").then(res => setIssueTypes(res.data));
    }, []);

    const handleSave = () => {
        if (selectedIssueType) {
            api.post(`project/${projectId}/issue-type/${selectedIssueType?.id}`).then(() => {
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
                    <FormControl fullWidth>
                        <InputLabel>Issue type</InputLabel>
                        <Select
                            value={selectedIssueType?.id || ''}
                            label={selectedIssueType?.name || ''}
                            onChange={(e) => {
                                const issueType = issueTypes.find(it => it.id === e.target.value);
                                setSelectedIssueType(issueType || null);
                            }}
                        >
                            {issueTypes.map(it => (
                                <MenuItem key={it.id} value={it.id}>{it.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button variant="outlined" onClick={closeDialog}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};