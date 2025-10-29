export interface EditCrudModalProps extends CreateCrudModalProps {
    id: string
}

export interface CreateCrudModalProps {
    open: boolean
    closeDialog: () => void
    onSave: () => void
}