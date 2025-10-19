import {useEffect, useMemo, useState} from "react";
import type {Issue} from "../../lib/types";
import Grid from "@mui/material/Grid2";
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {useNavigate, useParams} from "react-router-dom";
import {useUIStore} from "../../app/store";
import {api} from "../../lib/apiClient.ts";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";

export default function ProjectIssuesListPage() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState<Issue[]>([]);
    const {isDetailsOpen, selectedIssueId, selectIssue, setDetailsOpen} = useUIStore();
    const navigate = useNavigate();
    const {projectId} = useParams()

    useEffect(() => {
        api.get<Issue[]>("issue/project/" + projectId).then(res => {
            setItems(res.data);
        });
    }, [projectId]);

    const filtered = useMemo(() => {
        const s = q.toLowerCase();
        return items.filter(i => i.key.toLowerCase().includes(s) || i.summary.toLowerCase().includes(s));
    }, [q, items]);

    const selected = useMemo(() => filtered.find(i => i.id === selectedIssueId), [filtered, selectedIssueId]);

    return (
        <Grid container spacing={2}>
            <Grid size={12} spacing={2}>
                <Grid size={12} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Project issues</Typography>
                    <ToggleButtonGroup
                        value={isDetailsOpen}
                        exclusive
                        onChange={(_, v) => setDetailsOpen(v)}
                        size="small"
                    >
                        <Tooltip title="Table view">
                            <ToggleButton value={false} aria-label="table">
                                <TableRowsIcon fontSize="small"/>
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip title="Split view">
                            <ToggleButton value={true} aria-label="split">
                                <SplitscreenIcon sx={{rotate: "90deg"}} fontSize="small"/>
                            </ToggleButton>
                        </Tooltip>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>
            <Grid size={{xs: 12, md: isDetailsOpen ? 7 : 12}}>
                <Paper sx={{p: 2}}>
                    <TextField value={q} onChange={(e) => setQ(e.target.value)} fullWidth
                               placeholder="Search issues by key or summary"/>
                    <List>
                        {filtered.map(i => (
                            <ListItemButton key={i.id} selected={i.id === selectedIssueId}
                                            onClick={() => selectIssue(i.id)}>
                                <ListItemText primary={`${i.key} — ${i.summary}`}
                                              secondary={`Status: ${i.status.name} • Priority: ${i.priority.name}`}/>
                                <IconButton edge="end" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/issues/${i.id}`)
                                }}><OpenInNewIcon/></IconButton>
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {isDetailsOpen && (
                <Grid size={{xs: 12, md: 5}}>
                    <Paper sx={{p: 2}}>
                        {selected ? (
                            <>
                                <Typography variant="h6">{selected.key} — {selected.summary}</Typography>
                                <Typography color="text.secondary">Status: {selected.status.name} •
                                    Priority: {selected.priority.name}</Typography>
                                <Divider sx={{my: 2}}/>
                                <Typography variant="subtitle1" gutterBottom>Details</Typography>
                                <Typography variant="body2">{selected.description || '—'}</Typography>
                                <Box mt={2}>
                                    <Typography variant="subtitle1">Actions</Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <a href={`/issues/${selected.id}`}>Open full page</a>
                                    </Box>
                                </Box>
                            </>
                        ) : <Typography>Select an issue…</Typography>}
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
}
