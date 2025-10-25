import {create} from 'zustand'

type UIState = {
    isDetailsOpen: boolean;
    selectedIssueId?: string;
    splitPaneSize: number;
    setDetailsOpen: (open: boolean) => void;
    selectIssue: (id?: string) => void;
    setSplitPane: (w: number) => void;

}
export const useUIStore = create<UIState>(
    (set => ({
        isDetailsOpen: true,
        selectedIssueId: undefined,
        splitPaneSize: 420,
        setDetailsOpen: (open) => set({isDetailsOpen: open}),
        selectIssue: (id) => set({selectedIssueId: id}),
        setSplitPane: (w) => set({splitPaneSize: w}),
    }))
)

export const useConfirmStore = create<{
    confirmOpen: boolean;
    setConfirmOpen: (open: boolean) => void;
    onConfirmSure: () => void;
    setOnConfirmSure: (cb: () => void) => void;
    confirmTitle?: string;
    setConfirmTitle: (title: string) => void;
    onConfirmClose: () => void;
    setOnConfirmClose: (cb: () => void) => void;
}>(
    (set => ({
        confirmOpen: false,
        setConfirmOpen: (open) => set({confirmOpen: open}),
        onConfirmSure: () => {
        },
        setOnConfirmSure: (cb) => set({onConfirmSure: cb}),
        confirmTitle: undefined,
        setConfirmTitle: (title) => set({confirmTitle: title}),
        onConfirmClose: () => {
        },
        setOnConfirmClose: (cb) => set({onConfirmClose: cb}),
    }))
)
