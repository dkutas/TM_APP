import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
    TextField
} from "@mui/material";
import {type SyntheticEvent, useCallback, useEffect, useRef, useState} from "react";
import {api} from "../../lib/apiClient";
import type {IssueLinkType, UserIssue} from "../../lib/types.ts";

interface LinkIssueModalProps {
    open: boolean
    onClose: () => void
    issueId: string
}

const DEBOUNCE_DELAY = 400; // ms


export const LinkIssueModal = ({open, onClose, issueId}: LinkIssueModalProps) => {
    const [selectedLinkType, setSelectedLinkType] = useState<IssueLinkType | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<UserIssue | null>(null);
    const [linkTypes, setLinkTypes] = useState<Array<IssueLinkType>>([])
    const [issues, setIssues] = useState<Array<UserIssue>>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [direction, setDirection] = useState<string>('');

    const handleSave = useCallback(() => {
        if (!selectedIssue || !selectedLinkType) return;
        const payload = {
            srcIssueId: direction === "in" ? selectedIssue.id : issueId,
            dstIssueId: direction === "in" ? issueId : selectedIssue.id,
            linkTypeId: selectedLinkType.id
        };
        api.post(`/link-type/issue-link`, payload).then(() => {
            setSelectedLinkType(null)
            setSelectedIssue(null)
            setDirection("")
            onClose();
        });
    }, [direction, issueId, onClose, selectedIssue, selectedLinkType])


    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInputChange = useCallback((_: SyntheticEvent<Element, Event>, value: string) => {
        if (!value) {
            setIssues([])
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            setLoading(true);
            api.get<UserIssue[]>(`issue/search?query=${value}`).then((response) => {
                setIssues(response.data.filter(issue => issue.id !== issueId));
                setLoading(false);
            });
        }, DEBOUNCE_DELAY);
    }, [issueId]);

    useEffect(() => {
        api.get<IssueLinkType[]>('/link-type').then(response => {
            setLinkTypes(response.data);
        })
    }, []);

    return (
        <Dialog open={open}>
            <DialogTitle>Link issue</DialogTitle>
            <DialogContent
                sx={{display: "flex", flexDirection: "column", gap: 2, minWidth: 400, py: 5}}>
                <Autocomplete
                    sx={{mt: 3}}
                    fullWidth
                    onChange={(_, v) => {
                        setSelectedLinkType(v)
                        if (!v || !v.directed) {
                            setDirection("")
                        }
                    }}
                    value={selectedLinkType}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.name}
                    options={linkTypes}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Link type"
                        />
                    )}
                />
                {selectedLinkType?.directed ?
                    <FormControl fullWidth>
                        <InputLabel>Direction</InputLabel>
                        <Select
                            label="Direction"
                            value={direction}
                            onChange={(e: SelectChangeEvent) => {
                                setDirection(e.target.value);
                            }}
                        >
                            {["in", "out"].map((direction) => (
                                <MenuItem key={direction} value={direction}>
                                    {/* @ts-expect-error Indexed with dynamic key*/}
                                    {selectedLinkType[`${direction}wardLabel`]}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    : null}
                <Autocomplete
                    fullWidth
                    onInputChange={handleInputChange}
                    onChange={(_, issue: UserIssue | null) => setSelectedIssue(issue || null)}
                    value={selectedIssue}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => `${option.key} - ${option.summary}`}
                    options={issues}
                    loading={loading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search issue to link..."
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                },
                            }}
                        />
                    )}
                />

            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
                <Button variant="outlined" onClick={onClose}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Link</Button>
            </DialogActions>
        </Dialog>
    );
};

