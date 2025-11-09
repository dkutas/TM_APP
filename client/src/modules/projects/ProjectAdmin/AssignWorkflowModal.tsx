import type {ModalProps} from "../../settings/types.ts";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import {api} from "../../../lib/apiClient.ts";
import {useEffect, useState} from "react";
import type {Workflow} from "../../../lib/types.ts";

interface AssingWfModalProps extends ModalProps {
    issueTypeId: string;
    projectId: string;
}

export const AssignWorkflowModal = ({
                                        open = false,
                                        issueTypeId,
                                        projectId,
                                        closeDialog,
                                        onSave
                                    }: AssingWfModalProps) => {

    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");


    useEffect(() => {
        api.get<Workflow[]>("workflow").then(res => setWorkflows(res.data));
    }, []);

    const handleSave = () => {
        if (selectedWorkflow) {
            api.patch(`project/${projectId}/issue-type/${issueTypeId}`, {workflowId: selectedWorkflow}).then(() => {
                onSave();
                closeDialog()
            })
        }
    }


    return (
        <Dialog open={open}>
            <DialogTitle>Assign workflow</DialogTitle>
            <DialogContent>
                <Box sx={{gap: 3, width: "400px", py: 2}}>

                    <FormControl fullWidth>
                        <InputLabel>Workflow</InputLabel>
                        <Select
                            value={selectedWorkflow}
                            label="Workflow"
                            onChange={(e) => setSelectedWorkflow(e.target.value)}
                        >
                            {workflows.map(wf => (
                                <MenuItem key={wf.id} value={wf.id}>{wf.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button variant="outlined" onClick={closeDialog}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};