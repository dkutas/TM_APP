import {useEffect, useMemo, useState} from "react";
import type {Issue} from "../../lib/types";
import Grid from "@mui/material/Grid2";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    List,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {api} from "../../lib/apiClient.ts";
import {NavLink, useNavigate, useParams} from "react-router-dom";

type Project = {
    id: string;
    name: string;
    key: string;
    description?: string;
};

type Member = {
    id: string;
    name: string;
    email?: string;
    createdAt?: string;
};

type MemberShip = {
    id: string;
    user: Member;
}

export default function ProjectPage() {
    const [project, setProject] = useState<Project | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const navigate = useNavigate();
    const {projectId} = useParams();

    useEffect(() => {
        if (!projectId) return;
        api.get<Project>(`/project/${projectId}`).then((res) => setProject(res.data)).catch(() => {
        });
        api.get<Issue[]>(`/issue/project/${projectId}`).then((res) =>
            setIssues(res.data)).catch(() => {
        });
        api
            .get<MemberShip[]>(`/project/${projectId}/members`)
            .then((res) => setMembers(res.data.map((ms) => ms.user)))
            .catch(() => setMembers([]));
    }, [projectId]);

    const latest = useMemo(() => issues.slice(0, 8), [issues]);

    const initials = (full?: string, email?: string) => {
        const n = (full || email || "?").trim();
        const parts = n.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return n.slice(0, 2).toUpperCase();
    };

    const fmtDate = (iso?: string) => {
        try {
            if (!iso) return "—";
            return new Date(iso).toISOString().slice(0, 10);
        } catch {
            return "—";
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12} display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4">{project?.name || "Project"}</Typography>
                    <Typography color="text.secondary">{project?.description}</Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Button component={NavLink} to={`/projects/${projectId}/settings`} variant="outlined">
                        Manage
                    </Button>
                    <Button component={NavLink} to={`/projects/${projectId}/issues`} variant="contained">
                        View all issues
                    </Button>
                </Box>
            </Grid>

            <Grid size={{xs: 12, md: 7}}>
                <Typography variant="h6" sx={{mb: 1}}>
                    Latest issues in {project?.name || "this project"}
                </Typography>
                <Paper sx={{p: 2, mt: 2, borderRadius: 3}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Key</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Summary</TableCell>
                                <TableCell>Assignee</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {latest.map((i) => (
                                <TableRow key={i.id} hover onClick={() => navigate(`/issues/${i.id}`)}
                                          sx={{cursor: "pointer"}}>
                                    <TableCell>{i.key}</TableCell>
                                    <TableCell>{i.issueType.name || "—"}</TableCell>
                                    <TableCell>{i.summary}</TableCell>
                                    <TableCell>{i.assignee?.name || i.assignee?.email || "Unassigned"}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/issues/${i.id}`);
                                        }}>
                                            <OpenInNewIcon fontSize="small"/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {latest.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography color="text.secondary">No issues yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Grid>

            <Grid size={{xs: 12, md: 5}}>
                <Typography variant="h6" sx={{mb: 1}}>
                    Your collaborators
                </Typography>
                <List sx={{display: "flex", flexDirection: "column", gap: 1}}>
                    {members.map((m) => (
                        <Card key={m.id} variant="outlined" sx={{borderRadius: 3}}>
                            <CardContent sx={{display: "flex", alignItems: "center", gap: 2}}>
                                <Avatar sx={{width: 48, height: 48}}>{initials(m.name, m.email)}</Avatar>
                                <Box sx={{flex: 1}}>
                                    <Typography fontWeight={600}>{m.name || m.email}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {m.email || "—"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        joined: {fmtDate(m.createdAt)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                    {members.length === 0 && (
                        <Paper variant="outlined" sx={{p: 2, borderRadius: 3}}>
                            <Typography color="text.secondary">No collaborators yet.</Typography>
                        </Paper>
                    )}
                </List>
            </Grid>
        </Grid>
    );
}
