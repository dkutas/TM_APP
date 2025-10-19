import {useCallback, useEffect, useState} from "react";
import {NavLink, useParams} from "react-router-dom";
import type {Issue, IssueLink} from "../../lib/types";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    type ChipOwnProps,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import {api} from "../../lib/apiClient.ts";


const StatusCategoryColorMap: { [key: string]: ChipOwnProps['color'] } = {
    "INPROGRESS": "info",
    "TODO": "default",
    "DONE": "success"
}

function capitalizeFirstLetter(string: string) {
    return string.replace(/^./, string[0].toUpperCase())
}


export default function IssueFullPage() {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [tab, setTab] = useState(0);
    const {issueId} = useParams();

    const getLinkName = useCallback((link: IssueLink) => {
        const {direction, linkType} = link
        if (direction === "IN") {
            return capitalizeFirstLetter(linkType.inward)
        } else {
            return capitalizeFirstLetter(linkType.outward)
        }
    }, [])

    useEffect(() => {
        if (issueId) api.get(`issue/${issueId}/fields`).then((res) => setIssue(res.data));
    }, [issueId]);

    if (!issue) return null;

    return (
        <Box>
            {/* Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                        {issue.project?.key} &gt; {issue.key}
                    </Typography>
                    <Typography variant="h5">{issue.summary}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="outlined">Edit</Button>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Chip label={issue.status?.name || "Todo"} variant="filled"
                      color={StatusCategoryColorMap[issue.status.category]}/>
                <Button variant="contained" color="primary">
                    Start progress
                </Button>
                <Button variant="outlined" color="error">
                    Decline
                </Button>
                <Typography sx={{ml: "auto"}}>
                    Assignee: {issue.assignee?.name || issue.assignee?.email || "—"}
                </Typography>
            </Stack>

            {/* Description */}
            <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                <Typography variant="body1" whiteSpace="pre-line">
                    {issue.description || "Description..."}
                </Typography>
            </Paper>

            {/* Linked issues */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Linked issues</Typography>
                <Button variant="outlined" size="small">
                    Link issue
                </Button>
            </Stack>

            <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                {issue.links && issue.links.length > 0 ? (
                    <Stack spacing={1}>
                        {issue.links.map((link) => (
                            <Stack key={link.id} direction="row" spacing={2} alignItems="center"
                                   justifyContent="space-between">
                                <Box>
                                    <Typography sx={{textDecoration: "none, "}} fontWeight={500} component={NavLink}
                                                to={`/issues/${link.otherIssue?.id}`}>{link.otherIssue?.key}</Typography>
                                    <Typography color="text.secondary" noWrap>
                                        {getLinkName(link)} {link.otherIssue?.summary}
                                    </Typography>
                                </Box>
                                <Chip label={link.otherIssue?.status?.name}
                                      color={StatusCategoryColorMap[link.otherIssue?.status.category]}
                                      variant="filled"/>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography color="text.secondary">No linked issues.</Typography>
                )}
            </Paper>

            {/* Attachments */}
            <Typography variant="h6" mb={1}>
                Attachments
            </Typography>
            <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                {issue.attachments && issue.attachments.length > 0 ? (
                    <Stack spacing={1}>
                        {issue.attachments.map((a) => (
                            <Stack key={a.id} direction="row" alignItems="center" justifyContent="space-between">
                                <Typography>{a.fileName}</Typography>
                                <Typography color="text.secondary" variant="body2">
                                    {a.size || "—"}kb
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography color="text.secondary">No attachments.</Typography>
                )}
            </Paper>

            {/* Comments and History Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{mb: 2}}>
                <Tab label="Comments"/>
                <Tab label="History"/>
            </Tabs>

            <Paper sx={{p: 2, borderRadius: 3}}>
                {tab === 0 && (
                    issue.comments && issue.comments.length > 0 ? (
                        <Stack spacing={2}>
                            {issue.comments.map((c) => (
                                <Card key={c.id} variant="outlined" sx={{borderRadius: 2}}>
                                    <CardContent>
                                        <Typography fontWeight={600}>{c.author?.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(c.createdAt).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body1" sx={{mt: 1}}>
                                            {c.body}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Typography color="text.secondary">No comments yet.</Typography>
                    )
                )}
                {tab === 1 && <Typography color="text.secondary">History — placeholder</Typography>}
            </Paper>
        </Box>
    );
}
