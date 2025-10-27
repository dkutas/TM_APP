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
import {useEffect, useState} from "react";
import type {IssueType} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

interface EditIssueTypeModalProps {
    open: boolean
    id: string
    closeDialog: () => void
    onSave: () => void
}

export const EditIssueTypeModal = ({open, id, closeDialog, onSave}: EditIssueTypeModalProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [formValue, setFormValue] = useState<IssueType | null>(null)

    useEffect(() => {
        setIsLoading(true)
        api.get<IssueType>(`/issue-type/${id}`).then((res) => {
            setFormValue(res.data)
            setIsLoading(false)
        })
    }, [id])


    const handleSave = () => {
        setIsLoading(true)
        api.patch(`/issue-type/${id}`, formValue).then(() => {
            onSave()
            setFormValue(null)
        })
    }


    if (isLoading) {
        return <CircularProgress/>;
    }
    return (
        <Dialog open={open}>
            <DialogTitle>Edit Issue Type</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    <TextField
                        value={formValue?.name}
                        label="Name"
                        onChange={(e) => setFormValue((fv) => {
                            return {
                                ...fv as IssueType, name: e.target.value
                            }
                        })
                        }
                    />
                    <TextField
                        value={formValue?.description}
                        label="Description"
                        onChange={(e) => setFormValue((fv) => {
                            return {
                                ...fv as IssueType, description: e.target.value
                            }
                        })
                        }
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