import {useConfirmStore} from "../store.ts";

export const useConfirm = (title: string = "", onClose?: () => void) => {
    const {setConfirmOpen, setConfirmTitle, setOnConfirmSure, setOnConfirmClose} = useConfirmStore()

    return {
        openConfirm: (_onConfirm?: (params?: never) => void, _confirmTitle?: string) => {
            setOnConfirmSure(_onConfirm || (() => {
            }));
            setOnConfirmClose(() => onClose);
            setConfirmTitle(_confirmTitle || title);
            setConfirmOpen(true);
        }
    }
}