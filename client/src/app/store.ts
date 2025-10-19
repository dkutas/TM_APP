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
        isDetailsOpen: false,
        selectedIssueId: undefined,
        splitPaneSize: 420,
        setDetailsOpen: (open) => set({isDetailsOpen: open}),
        selectIssue: (id) => set({selectedIssueId: id}),
        setSplitPane: (w) => set({splitPaneSize: w}),
    }))
)
