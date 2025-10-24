import {useCallback, useEffect, useState} from "react";
import {NavLink, useParams} from "react-router-dom";
import type {Issue, IssueLink, IssueTransition, NormalizedFieldValue, User} from "../../lib/types";
import Grid from "@mui/material/Grid2";
import Link from '@mui/material/Link';
import {
    Box,
    Breadcrumbs,
    Button,
    type ButtonOwnProps,
    Card,
    CardActions,
    CardContent,
    Chip,
    type ChipOwnProps,
    Divider,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import {api} from "../../lib/apiClient.ts";
import IssueEditModal from "./IssueEditModal.tsx";


const StatusCategoryColorMap: { [key: string]: ButtonOwnProps['color'] & ChipOwnProps['color'] } = {
    "INPROGRESS": "info",
    "TODO": "warning",
    "DONE": "success"
}

function capitalizeFirstLetter(string: string) {
    return string.replace(/^./, string[0].toUpperCase())
}


export default function IssueFullPage() {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [tab, setTab] = useState(0);
    const [customFieldEntries, setCustomFieldEntries] = useState<NormalizedFieldValue[]>([]);
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [transitions, setTransitions] = useState<IssueTransition[]>([]);
    const [commentFieldOpen, setCommentFieldOpen] = useState(false);
    const [newCommentValue, setNewCommentValue] = useState("");

    const {issueId} = useParams();

    const refreshIssues = useCallback(() => {
        if (issueId) {
            api.get<Issue>(`issue/${issueId}/fields`).then((res) => setIssue(res.data));
            api.get<IssueTransition[]>(`issue/${issueId}/transitions`).then((res) => {
                setTransitions(res.data);
            })
        }
    }, [issueId]);

    const addComment = useCallback(() => {
        if (issueId && newCommentValue.trim().length > 0) {
            api.post(`issue/${issueId}/comments`, {body: newCommentValue}).then(() => {
                setNewCommentValue("");
                setCommentFieldOpen(false);
            }).then(() => {
                refreshIssues()
            })
        }
    }, [issueId, newCommentValue, refreshIssues])


    const transitionIssue = useCallback((transition: IssueTransition) => {
        if (transitions.length > 0 && issueId) {
            api.post(`issue/${issueId}/transition`, {transitionId: transition.id}).then(() => {
                // Refresh issue data
                api.get<Issue>(`issue/${issueId}/fields`).then((res) => setIssue(res.data));
                api.get<IssueTransition[]>(`issue/${issueId}/transitions`).then((res) => {
                    setTransitions(res.data);
                })
            })
        }
    }, [issueId, transitions]);

    const getLinkName = useCallback((link: IssueLink) => {
        const {direction, linkType} = link
        if (direction === "IN") {
            return capitalizeFirstLetter(linkType.inward)
        } else {
            return capitalizeFirstLetter(linkType.outward)
        }
    }, [])

    useEffect(() => {
        if (issueId) {
            api.get<Issue>(`issue/${issueId}/fields`).then((res) => setIssue(res.data));
            api.get<IssueTransition[]>(`issue/${issueId}/transitions`).then((res) => {
                setTransitions(res.data);
            })
        }

    }, [issueId]);

    useEffect(() => {
        (async (): Promise<NormalizedFieldValue[]> => {
            const entries: NormalizedFieldValue[] = [];
            // Array model: fieldValues: [{ fieldDef: { name|key }, valueXxx... }]
            if (!!issue && Array.isArray(issue?.fields)) {
                for (const fv of issue.fields) {
                    const label = fv.name || fv.key || "Custom field";
                    let value = fv.value
                    if (fv.dataType === "OPTION" && fv.options) {
                        value = fv.options.find(op => op.id === fv.value)?.value || "No matching option"
                    } else if (fv.dataType === "MULTI_OPTION" && fv.options) {
                        value = fv.options.filter(op => fv.value.includes(op.id)).map(op => op.value).join(", ")
                    } else if (fv.dataType === "USER") {
                        if (fv.value) {
                            value = await api.get<User>(`/user/${fv.value}`).then((res) => res.data.name).catch(() => "No user")
                        }
                    }
                    entries.push({label, value});
                }
            }
            return entries;
        })().then(values => setCustomFieldEntries(values));
    }, [issue, issue?.fields]);

    if (!issue) return null;


    const valueToString = (v: NormalizedFieldValue['value']): string => {
        if (v === null || v === undefined) return "—";
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
        if (Array.isArray(v)) return v.map(valueToString).join(", ");
        return String(v);
    };

    const renderTransitionButton = (transition: IssueTransition) => {
        return (<Button key={transition.id} onClick={() => transitionIssue(transition)} variant="contained"
                        color={StatusCategoryColorMap[transition.to.category]}>
            {transition.name}
        </Button>)
    }


    return (
        <Box>
            {/* Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Breadcrumbs>
                        <Link
                            component={NavLink} to={`/projects/${issue.project.id}`}
                            sx={{textDecoration: 'none', color: 'inherit'}}
                            underline="hover">
                            {issue.project?.name}
                        </Link>
                        <Link
                            component={NavLink}
                            to={`/issues/${issue.id}`}
                            underline="hover"
                            sx={{textDecoration: 'none', color: 'inherit'}}>
                            {issue.key}
                        </Link>
                    </Breadcrumbs>
                    <Typography variant="h4">{issue.summary}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button onClick={() => setIsEditOpen(true)} variant="outlined">Edit issue</Button>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
                <Button variant="contained" sx={{cursor: "default"}}
                        color={StatusCategoryColorMap[issue.status.category]}>
                    {issue.status?.name}
                </Button>
                <Box display="flex" justifyContent="space-between" gap={2} alignItems="center" mb={2}>
                    {transitions.map(transition => renderTransitionButton(transition))}
                </Box>
            </Stack>

            <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{xs: 12, md: 8}}>
                    <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                        <Typography variant="body1" whiteSpace="pre-line">
                            {issue.description || "Description..."}
                        </Typography>
                    </Paper>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">Linked issues</Typography>
                        <Button variant="outlined" size="small">Link issue</Button>
                    </Stack>
                    <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                        {issue.links && issue.links.length > 0 ? (
                            <Stack spacing={1}>
                                {issue.links.map((link) => (
                                    <Stack key={link.id} direction="row" spacing={2} alignItems="center"
                                           justifyContent="space-between">
                                        <Box>
                                            <Typography
                                                sx={{textDecoration: "none", color: "inherit"}}
                                                fontWeight={500}
                                                component={NavLink}
                                                to={`/issues/${link.otherIssue?.id}`}>
                                                {link.otherIssue?.key} {getLinkName(link)} {link.otherIssue?.summary}
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

                    <Typography variant="h6" mb={1}>Attachments</Typography>
                    <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                        {issue.attachments && issue.attachments.length > 0 ? (
                            <Stack spacing={1}>
                                {issue.attachments.map((a) => (
                                    <Stack key={a.id} direction="row" alignItems="center"
                                           justifyContent="space-between">
                                        <Typography>{a.fileName}</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">{a.size || "—"}kb</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">No attachments.</Typography>
                        )}
                    </Paper>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{mb: 2}}>
                        <Tab label="Comments"/>
                        <Tab label="History"/>
                    </Tabs>

                    <Paper sx={{p: 2, borderRadius: 3}}>
                        {tab === 0 && (
                            issue.comments && issue.comments.length > 0 ? (
                                <Stack spacing={1}>{
                                    !commentFieldOpen ?
                                        <Button onClick={() => {
                                            setCommentFieldOpen(true)
                                        }}>Add comment</Button> :
                                        <Card>
                                            <CardContent>
                                                <TextField
                                                    fullWidth
                                                    minRows={3}
                                                    multiline
                                                    value={newCommentValue}
                                                    onChange={(e) => setNewCommentValue(e.target.value)}
                                                />
                                                <CardActions disableSpacing sx={{justifyContent: "space-between"}}>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                            addComment()
                                                        }}>
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => {
                                                            setNewCommentValue("")
                                                            setCommentFieldOpen(false)
                                                        }}>
                                                        Close
                                                    </Button>
                                                </CardActions>
                                            </CardContent>
                                        </Card>
                                }
                                    {issue.comments.map((c) => (
                                        <Card key={c.id} variant="outlined">
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
                </Grid>

                {/* RIGHT SIDEBAR */}
                <Grid size={{xs: 12, md: 4}}>
                    <Paper sx={{p: 2, borderRadius: 3, position: {md: 'sticky'}, top: {md: 16}}}>
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2" color="text.secondary">Assignee</Typography>
                            <Typography>{issue.assignee?.name || issue.assignee?.email || "—"}</Typography>
                            <Typography variant="subtitle2" color="text.secondary">Reporter</Typography>
                            <Typography>{issue.reporter?.name || issue.reporter?.email || "—"}</Typography>
                            {issue.dueDate &&
                                <>
                                    <Typography variant="subtitle2" color="text.secondary">Due date</Typography>
                                    <Typography>{issue.dueDate}</Typography>
                                </>
                            }
                            <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                            <Typography>{issue.priority.name}</Typography>
                            <Typography
                                variant="subtitle2" color="text.secondary">IssueType</Typography>
                            <Typography>{issue.issueType.name || issue.assignee?.email || "—"}</Typography>
                            <Divider sx={{my: 1}}/>
                            <Typography variant="subtitle2" color="text.secondary">Custom Fields</Typography>
                            {customFieldEntries.length > 0 ? (
                                <Stack spacing={1}>
                                    {customFieldEntries.map((f, idx) => (
                                        <Box key={idx}>
                                            <Typography variant="body2"
                                                        color="text.secondary">{f.label}</Typography>
                                            <Typography variant="body1">{valueToString(f.value)}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">No custom fields.</Typography>
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
            <IssueEditModal
                open={isEditOpen}
                issueId={issue.id}
                onClose={setIsEditOpen}
                fields={issue.fields}
                onSave={refreshIssues}
                issue={issue}/>
        </Box>
    );
}
