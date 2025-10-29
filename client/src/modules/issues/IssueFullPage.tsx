import {useCallback, useEffect, useRef, useState} from "react";
import {NavLink, useParams} from "react-router-dom";
import type {
    Issue,
    IssueCustomField,
    IssueLink,
    IssuePriority,
    IssueTransition,
    NormalizedFieldValue,
    NormalizedHistoryRecord,
    User
} from "../../lib/types";
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
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import {api} from "../../lib/apiClient.ts";
import IssueEditModal from "./IssueEditModal.tsx";
import {LinkIssueModal} from "./LinkIssueModal.tsx";
import {CloudUpload, Delete} from "@mui/icons-material";
import {useConfirm} from "../../app/Confirm/useConfirm.ts";


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
    const [issueFields, setIssueFields] = useState<IssueCustomField[]>([]);
    const [tab, setTab] = useState(0);
    const [customFieldEntries, setCustomFieldEntries] = useState<NormalizedFieldValue[]>([]);
    const [historyEntries, setHistoryEntries] = useState<NormalizedHistoryRecord[]>([]);
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [transitions, setTransitions] = useState<IssueTransition[]>([]);
    const [commentFieldOpen, setCommentFieldOpen] = useState(false);
    const [linkIssuesOpen, setLinkIssuesOpen] = useState(false);
    const [newCommentValue, setNewCommentValue] = useState("");
    const [isOver, setIsOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [showThreeComments, setShowThreeComments] = useState(true);
    const [showThreeHistory, setShowThreeHistory] = useState(true);
    const {openConfirm} = useConfirm("Are you sure you want to delete this issue link?");

    const {issueId} = useParams();

    const refreshIssues = useCallback(async () => {
        if (issueId) {
            await api.get<Issue>(`issue/${issueId}/fields`).then((res) => {
                setIssue(res.data);
                setIssueFields(res.data.fields ?? []);
            });
            await api.get<IssueTransition[]>(`issue/${issueId}/transitions`).then((res) => {
                setTransitions(res.data);
            })
        }
    }, [issueId]);

    const handleDeleteLink = useCallback((linkId: string) => {
        api.delete(`link-type/issue-link/${linkId}`).then(() => {
            refreshIssues()
        })
    }, [refreshIssues])

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

    const uploadFiles = useCallback(async (files: FileList | File[]) => {
        if (!issueId) return;
        const form = new FormData();
        Array.from(files).forEach((f) => form.append('files', f));
        setIsUploading(true);
        try {
            await api.post(`issue/${issueId}/attachments`, form, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            await refreshIssues();
        } finally {
            setIsUploading(false);
        }
    }, [issueId, refreshIssues]);

    const onDropFiles = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            uploadFiles(e.dataTransfer.files);
        }
    }, [uploadFiles]);

    const onBrowseFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            uploadFiles(e.target.files);
            e.target.value = '';
        }
    }, [uploadFiles]);

    const handleDeleteAttachment = useCallback((attachmentId: string) => {
        api.delete(`issue/attachments/${attachmentId}`).then(() => {
            refreshIssues()
        })
    }, [refreshIssues])


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
            api.get<Issue>(`issue/${issueId}/fields`).then((res) => {
                setIssue(res.data)
                setIssueFields(res.data.fields ?? [])
            });
            api.get<IssueTransition[]>(`issue/${issueId}/transitions`).then((res) => {
                setTransitions(res.data);
            })
        }

    }, [issueId]);

    useEffect(() => {
        (async (): Promise<{ entries: NormalizedFieldValue[], history: NormalizedHistoryRecord[] }> => {
            const entries: NormalizedFieldValue[] = [];
            const historyEntries: NormalizedHistoryRecord[] = [];
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

                for (const hLog of issue.history) {
                    const user = await api.get<User>(`/user/${hLog.authorId}`).then((res) => res.data.name).catch(() => hLog.authorId);
                    const createdAt = hLog.createdAt;
                    const items: NormalizedHistoryRecord["items"] = []
                    for (const item of hLog.items) {
                        if (item.fieldKey.toLowerCase().startsWith("custom.")) {
                            const fieldDef = issue.fields.find((field) => field.key === item.fieldKey)
                            if (fieldDef) {
                                const label = fieldDef.name || fieldDef.key || "Custom field";
                                let fromValue: NormalizedFieldValue['value'] = item.fromDisplay;
                                let toValue: NormalizedFieldValue['value'] = item.toDisplay;

                                if (fieldDef.dataType === "OPTION" && fieldDef.options) {
                                    fromValue = fieldDef.options.find(op => op.id === JSON.parse(item.fromDisplay as string)?.optionId)?.value || item.fromDisplay;
                                    toValue = fieldDef.options.find(op => op.id === JSON.parse(item.toDisplay as string)?.optionId)?.value || item.toDisplay;
                                } else if (fieldDef.dataType === "MULTI_OPTION" && fieldDef.options) {
                                    const parsedFrom = JSON.parse(item.fromDisplay as string);
                                    const parsedTo = JSON.parse(item.toDisplay as string);
                                    fromValue = fieldDef.options.filter(op => parsedFrom?.optionIds.includes(op.id)).map(op => op.value).join(", ") || "Empty";
                                    toValue = fieldDef.options.filter(op => parsedTo?.optionIds.includes(op.id)).map(op => op.value).join(", ") || "Empty";
                                } else if (fieldDef.dataType === "USER") {
                                    if (item.fromDisplay) {
                                        const userId = JSON.parse(item.fromDisplay as string)?.userId;
                                        fromValue = await api.get<User>(`/user/${userId}`).then((res) => res.data.name).catch(() => item.fromDisplay);
                                    }
                                    if (item.toDisplay) {
                                        const userId = JSON.parse(item.toDisplay as string)?.userId;
                                        toValue = await api.get<User>(`/user/${userId}`).then((res) => res.data.name).catch(() => item.toDisplay);
                                    }
                                }
                                items.push({fieldLabel: label, value: `${fromValue} -> ${toValue}`});
                            }
                        } else {
                            if (item.fieldKey === "assignee" || item.fieldKey === "reporter") {
                                let fromUser = item.fromDisplay;
                                let toUser = item.toDisplay;
                                if (item.fromDisplay) {
                                    const fromUserId = item.fromDisplay;
                                    fromUser = await api.get<User>(`/user/${fromUserId}`).then((res) => res.data.name).catch(() => item.fromDisplay);
                                }
                                if (item.toDisplay) {
                                    const toUserId = item.toDisplay;
                                    toUser = await api.get<User>(`/user/${toUserId}`).then((res) => res.data.name).catch(() => item.toDisplay);
                                }
                                items.push({
                                    fieldLabel: capitalizeFirstLetter(item.fieldKey),
                                    value: `${fromUser || "—"} -> ${toUser || "—"}`
                                });
                            } else if (item.fieldKey === "priority") {
                                let fromPriority = item.fromDisplay;
                                let toPriority = item.toDisplay;
                                if (item.fromDisplay) {
                                    const fromPriorityId = item.fromDisplay;
                                    fromPriority = await api.get<IssuePriority>(`/priority/${fromPriorityId}`).then((res) => res.data.name).catch(() => item.fromDisplay);
                                }
                                if (item.toDisplay) {
                                    const toPriorityId = item.toDisplay;
                                    toPriority = await api.get<IssuePriority>(`/priority/${toPriorityId}`).then((res) => res.data.name).catch(() => item.toDisplay);
                                }
                                items.push({
                                    fieldLabel: capitalizeFirstLetter(item.fieldKey),
                                    value: `${fromPriority || "—"} -> ${toPriority || "—"}`
                                });
                            } else {
                                items.push({
                                    fieldLabel: item.fieldKey,
                                    value: `${item.fromDisplay || "—"} -> ${item.toDisplay || "—"}`
                                });
                            }
                        }
                    }
                    historyEntries.push({id: hLog.id, actorName: user, createdAt, items})
                }
            }
            console.log({entries, historyEntries})
            return {entries, history: historyEntries};
        })().then(({history, entries}) => {
            setCustomFieldEntries(entries)
            setHistoryEntries(history)
        });
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
                        <Button variant="outlined" onClick={() => setLinkIssuesOpen(true)} size="small">Link
                            issue</Button>
                    </Stack>
                    <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                        {issue.links && issue.links.length > 0 ? (
                            <Stack spacing={1}>
                                {Object.entries(Object.groupBy(issue.links, (link) => link.linkType.name)).map(([linkTypeName, links]) => (
                                        <Box key={linkTypeName} mb={2}>
                                            <Typography variant="subtitle1" fontWeight={600}
                                                        mb={1}>{capitalizeFirstLetter(linkTypeName)}</Typography>
                                            <Stack spacing={1}>
                                                {links && links.map((link) => (
                                                    <Stack key={link.id} direction="row" spacing={2} alignItems="center"
                                                           justifyContent="space-between">
                                                        <Typography
                                                            sx={{textDecoration: "none", color: "inherit"}}
                                                            fontWeight={500}
                                                            component={NavLink}
                                                            to={`/issues/${link.otherIssue?.id}`}>
                                                            {link.otherIssue?.key} {getLinkName(link)} {link.otherIssue?.summary}
                                                        </Typography>
                                                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>

                                                            <Chip label={link.otherIssue?.status?.name}
                                                                  color={StatusCategoryColorMap[link.otherIssue?.status.category]}
                                                                  variant="filled"/>
                                                            <Button startIcon={<Delete/>} color="error"
                                                                    onClick={() => openConfirm(() => {
                                                                        handleDeleteLink(link.id)
                                                                    })}
                                                                    variant="outlined">Delete link</Button>
                                                        </Box>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )
                                )}
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">No linked issues.</Typography>
                        )}
                    </Paper>

                    <Typography variant="h6" mb={1}>Attachments</Typography>
                    <Paper sx={{p: 2, borderRadius: 3, mb: 3}}>
                        {/* Drop/Browse layer */}
                        <Box
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsOver(true);
                            }}
                            onDragLeave={() => setIsOver(false)}
                            onDrop={onDropFiles}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                border: '2px dashed',
                                borderColor: isOver ? 'primary.main' : 'divider',
                                bgcolor: isOver ? 'action.hover' : 'background.default',
                                borderRadius: 2,
                                p: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                mb: 2,
                            }}
                            aria-label="Drop files to upload"
                            role="button"
                        >
                            <input ref={fileInputRef} type="file" multiple hidden onChange={onBrowseFiles}/>
                            <Stack alignItems="center" spacing={1}>
                                <CloudUpload/>
                                <Typography variant="body2">
                                    Húzd ide a fájlokat vagy kattints a böngészéshez
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Max 20 fájl, 50MB / fájl
                                </Typography>
                                {isUploading && (
                                    <Typography variant="caption" color="text.secondary">Feltöltés…</Typography>
                                )}
                            </Stack>
                        </Box>

                        {/* Existing list */}
                        {issue.attachments && issue.attachments.length > 0 ? (
                            <Stack spacing={1}>
                                {issue.attachments.map((a) => (
                                    <Stack key={a.id} direction="row" alignItems="center"
                                           justifyContent="space-between">
                                        <Link href={a.url} target="_blank"
                                              rel="noreferrer"
                                              underline="hover">{a.fileName}</Link>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <Typography color="text.secondary" variant="body2">
                                                {a.size ? `${Math.round(+a.size / 1024)} KB` : '—'}
                                            </Typography>
                                            <IconButton
                                                onClick={() => openConfirm(() => handleDeleteAttachment(a.id), `Are you sure to delete ${a.fileName}`)}
                                                color="error">
                                                <Delete/>
                                            </IconButton>
                                        </Box>
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

                    {tab === 0 && (
                        <Paper sx={{p: 2, borderRadius: 3}}>
                            {
                                !commentFieldOpen ?
                                    <Button fullWidth onClick={() => {
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
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setNewCommentValue("")
                                                        setCommentFieldOpen(false)
                                                    }}>
                                                    Close
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        addComment()
                                                    }}>
                                                    Save
                                                </Button>
                                            </CardActions>
                                        </CardContent>
                                    </Card>
                            }
                            {issue.comments && issue.comments.length > 0 ? (
                                <Stack spacing={1}>
                                    {issue.comments.filter((_, i) => {
                                        if (showThreeComments) {
                                            return i < 3
                                        } else return true
                                    }).map((c) => (
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
                            )}
                            {
                                issue.comments.length > 3 ?
                                    <Button
                                        fullWidth
                                        onClick={() => setShowThreeComments((curr) => !curr)}>{showThreeComments ? "Show all comments" : "Hide all comments"}</Button> : null
                            }
                        </Paper>
                    )}
                    {tab === 1 && <Paper sx={{p: 2, borderRadius: 3}}>
                        {
                            historyEntries.length > 0 ?
                                historyEntries.filter((_, i) => {
                                    if (showThreeHistory) {
                                        return i < 3
                                    } else return true
                                }).map(log => (
                                    <Stack key={`stack-${log.id}`}>
                                        <Card key={`card-${log.id}`} variant="outlined" sx={{mb: 1}}>
                                            <CardContent key={`content-${log.id}`}>
                                                <Typography variant="subtitle1"
                                                            fontWeight={600}>{log.actorName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </Typography>
                                                {log.items.map(item => {
                                                    return (
                                                        <Box key={`field-${item.fieldLabel}`} sx={{my: 0.5}}>
                                                            <Typography

                                                                variant="subtitle2"
                                                                fontWeight={600}>{capitalizeFirstLetter(item.fieldLabel)}</Typography>
                                                            <Typography variant="body1">
                                                                {item.value}
                                                            </Typography>
                                                        </Box>

                                                    )
                                                })}
                                            </CardContent>
                                        </Card>
                                    </Stack>))
                                : <Typography>No history records found.</Typography>
                        }

                        {historyEntries.length > 3 ?
                            <Button
                                fullWidth
                                onClick={() => setShowThreeHistory((curr) => !curr)}>{showThreeHistory ? "Show all History" : "Hide all History"}</Button> : null}
                    </Paper>
                    }
                </Grid>

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
                            <Typography>{issue.priority?.name}</Typography>
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
                fields={issueFields}
                onSave={refreshIssues}
                issue={issue}
            />
            <LinkIssueModal
                open={linkIssuesOpen} onClose={() => {
                setLinkIssuesOpen(false)
                refreshIssues()
            }} issueId={issue.id}
            />
        </Box>
    );
}
