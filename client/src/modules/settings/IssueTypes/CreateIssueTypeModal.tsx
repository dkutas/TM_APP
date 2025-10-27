import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import {useCallback, useState} from "react";
import {api} from "../../../lib/apiClient.ts";

interface CreateIssueTypeModalProps {
    open: boolean
    closeDialog: () => void
    onSave: () => void

}

export const CreateIssueTypeModal = ({open, closeDialog, onSave}: CreateIssueTypeModalProps) => {
    const [name, setName] = useState<string | null>("")
    const [key, setKey] = useState<string | null>("")
    const [description, setDescription] = useState<string | null>("")

    const handleSave = useCallback(() => {
        const payload = {name, description, key};
        api.post("/issue-type", payload).then((res) => {
            if (res.status === 201) {
                onSave()
            }
        })
    }, [description, key, name, onSave])

    const clearValues = () => {
        setName("")
        setDescription("")
        setKey("")
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Create Issue Type</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            setKey(e.target.value.toUpperCase().trim())
                        }}
                    />
                    <TextField
                        disabled
                        fullWidth
                        label="Key"
                        value={key}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        minRows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button variant="outlined" onClick={() => {
                    closeDialog()
                    clearValues()
                }}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};