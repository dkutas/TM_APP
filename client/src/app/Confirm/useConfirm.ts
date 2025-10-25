import {useConfirmStore} from "../store.ts";

export const useConfirm = (title: string, onClose?: () => void) => {
    const {setConfirmOpen, setConfirmTitle, setOnConfirmSure, setOnConfirmClose} = useConfirmStore()

    return {
        openConfirm: (_onConfirm?: () => void) => {
            setOnConfirmSure(_onConfirm || (() => {
            })
            );
            setOnConfirmClose(() => onClose);
            setConfirmTitle(title);
            setConfirmOpen(true);
        }
    }
}