import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {useConfirmStore} from "../store.ts";


export const ConfirmDialog = () => {
    const {confirmOpen, setConfirmOpen, confirmTitle, onConfirmSure, onConfirmClose} = useConfirmStore()
    return (
        <Dialog open={confirmOpen}>
            <DialogTitle>{confirmTitle || "Are your sure?"}</DialogTitle>
            <DialogContent></DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button variant="outlined" onClick={() => {
                    onConfirmClose()
                    setConfirmOpen(false)
                }}>
                    Close
                </Button>
                <Button variant="contained" onClick={() => {
                    onConfirmSure()
                    setConfirmOpen(false)
                }}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
};