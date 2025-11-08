export interface EditCrudModalProps extends ModalProps {
    id: string
}

export interface ModalProps {
    open: boolean
    closeDialog: () => void
    onSave: () => void
}