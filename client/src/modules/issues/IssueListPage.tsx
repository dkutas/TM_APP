import {type ChangeEvent, useEffect, useMemo, useState} from "react";
import type {Issue} from "../../lib/types";
import Grid from "@mui/material/Grid2";
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {api} from "../../lib/apiClient.ts";
import SearchIcon from "@mui/icons-material/Search";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {useUIStore} from "../../app/store.ts";
import IssueCreateModal from "./IssueCreateModal.tsx";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BASE_COLUMNS = ["Key", "Type", "Summary", "Assignee", "Status", "Estimate"] as const;

type BaseCol = typeof BASE_COLUMNS[number];

type Filters = {
    Key: string;
    Type: string;
    Summary: string;
    Assignee: string;
    Status: string;
};

type IssueListResponse = {
    items: Issue[];
    total: number;
};

export default function IssueListPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<Filters>({Key: "", Type: "", Summary: "", Assignee: "", Status: ""});
    const {isDetailsOpen, selectedIssueId, selectIssue, setDetailsOpen} = useUIStore();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api
            .get<IssueListResponse>("/issue", {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                },
            })
            .then((res) => {
                setIssues(res.data.items);
                setTotal(res.data.total);
            })
            .catch(() => {
                setIssues([]);
                setTotal(0);
            });
    }, [page, rowsPerPage]);

    const customKeys = useMemo(() => {
        const keys = new Set<string>();
        for (const it of issues) {
            const bag: Record<string, unknown> = (it).custom || (it).customValues || {};
            Object.keys(bag).forEach((k) => keys.add(k));
            if (keys.size >= 3) break;
        }
        return Array.from(keys).slice(0, 3);
    }, [issues]);

    const filtered = useMemo(() => {
        const match = (val: unknown, needle: string) =>
            !needle || String(val ?? "").toLowerCase().includes(needle.trim().toLowerCase());

        return issues.filter((i) =>
            match(i.key, filters.Key) &&
            match(i.issueType?.name, filters.Type) &&
            match(i.summary, filters.Summary) &&
            match(i.assignee?.name || i.assignee?.email, filters.Assignee) &&
            match(i.status?.name, filters.Status)
        );
    }, [issues, filters]);

    const selected = useMemo(() => {
        return filtered.find((i) => i.id === selectedIssueId) || filtered[0] || null;
    }, [filtered, selectedIssueId]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        setRowsPerPage(Number.isNaN(value) ? 20 : value);
        setPage(0);
    };

    const onRowClick = (id: string) => {
        if (isDetailsOpen) selectIssue(id);
        else navigate(`/issues/${id}`);
    };

    const renderTable = (rows: Issue[]) => (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Estimate</TableCell>
                        {customKeys.map((ck) => (
                            <TableCell key={ck}>{ck}</TableCell>
                        ))}
                        {isDetailsOpen ? <TableCell>Actions</TableCell> : null}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((i) => {
                        const bag: Record<string, any> = (i as any).custom || (i as any).customValues || {};
                        const active = isDetailsOpen && selected?.id === i.id;
                        return (
                            <TableRow
                                key={i.id}
                                hover
                                selected={active}
                                sx={{cursor: "pointer"}}
                                onClick={() => onRowClick(i.id)}
                            >
                                <TableCell>{i.key}</TableCell>
                                <TableCell>{i.issueType?.name || "—"}</TableCell>
                                <TableCell>{i.summary}</TableCell>
                                <TableCell>{i.assignee?.name || i.assignee?.email || "—"}</TableCell>
                                <TableCell>{i.status?.name || "—"}</TableCell>
                                <TableCell>{(i).estimate ?? "-"}</TableCell>
                                {customKeys.map((ck) => (
                                    <TableCell key={ck}>{bag?.[ck] ?? "—"}</TableCell>
                                ))}
                                {isDetailsOpen ? (
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/issues/${i.id}`);
                                            }}
                                        >
                                            <OpenInNewIcon fontSize="small"/>
                                        </IconButton>
                                    </TableCell>
                                ) : null}
                            </TableRow>
                        );
                    })}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6 + customKeys.length}>
                                <Box py={6} textAlign="center">
                                    <Typography color="text.secondary">No issues found.</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
            />
        </TableContainer>
    );

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid size={12} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Issues</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                        <Button variant="contained" onClick={() => setCreateModalOpen(true)}>Create issue</Button>
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
                    </Box>
                </Grid>

                <Grid size={12}>
                    <Paper sx={{p: 1.5, borderRadius: 4}}>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                            {["Key", "Type", "Summary", "Assignee", "Status"].map((k) => (
                                <TextField
                                    key={k}
                                    label={k as BaseCol}
                                    size="small"
                                    value={(filters)[k]}
                                    onChange={(e) => setFilters((f) => ({...f, [k]: e.target.value}))}
                                    slotProps={{input: {startAdornment: <SearchIcon fontSize="small"/>}}}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {!isDetailsOpen && (
                    <Grid size={12}>
                        <Paper sx={{p: 2, borderRadius: 4}}>{renderTable(filtered)}</Paper>
                    </Grid>
                )}

                {isDetailsOpen && (
                    <>
                        <Grid size={{xs: 12, md: 6}}>
                            <Paper sx={{p: 2, borderRadius: 4}}>{renderTable(filtered)}</Paper>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <Card sx={{borderRadius: 4}}>
                                <CardContent>
                                    {selected ? (
                                        <Stack spacing={1.2}>
                                            <Typography variant="h6">{selected.summary}</Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Key
                                                    </Typography>
                                                    <Typography>{selected.key}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Type
                                                    </Typography>
                                                    <Typography>{selected.issueType?.name || "—"}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <Typography>{selected.status?.name || "—"}</Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={2}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Assignee
                                                    </Typography>
                                                    <Typography>{selected.assignee?.name || selected.assignee?.email || "—"}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Estimate
                                                    </Typography>
                                                    <Typography>{(selected).estimate ?? "—"}</Typography>
                                                </Box>
                                            </Stack>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Description
                                                </Typography>
                                                <Typography
                                                    whiteSpace="pre-line">{(selected).description || "—"}</Typography>
                                            </Box>
                                        </Stack>
                                    ) : (
                                        <Box p={4} textAlign="center">
                                            <Typography color="text.secondary">Select an issue to see
                                                details.</Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </>
                )}
            </Grid>
            <IssueCreateModal open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}
                              onSave={() => setCreateModalOpen(false)}/>
        </Box>

    );
}