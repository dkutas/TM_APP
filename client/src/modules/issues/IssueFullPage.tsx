import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import type {Issue} from "../../lib/types";
import {Box, Paper, Tab, Tabs, Typography} from "@mui/material";
import {api} from "../../lib/apiClient.ts";

export default function IssueFullPage() {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [tab, setTab] = useState(0);

    const {issueId} = useParams();
    useEffect(() => {
        if (issueId) api.get("issue/" + issueId).then(res => setIssue(res.data));
    }, [issueId]);
    if (!issue) return null;

    return (
        <Box>
            <Typography variant="h4">{issue.key} — {issue.summary}</Typography>
            <Typography color="text.secondary">Status: {issue.status.name} •
                Priority: {issue.priority.name}</Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{mt: 2}}>
                <Tab label="Details"/>
                <Tab label="Comments"/>
                <Tab label="Attachments"/>
                <Tab label="Links"/>
                <Tab label="History"/>
            </Tabs>
            <Paper sx={{mt: 2, p: 2}}>
                {tab === 0 && (
                    <Box>
                        <Typography variant="subtitle1">System fields</Typography>
                        <Typography variant="body2">Reporter: TBD • Assignee: TBD</Typography>
                        <Typography variant="subtitle1" sx={{mt: 2}}>Custom fields</Typography>
                        <Typography variant="body2">—</Typography>
                    </Box>
                )}
                {tab === 1 && <Typography>Comments — placeholder</Typography>}
                {tab === 2 && <Typography>Attachments — placeholder</Typography>}
                {tab === 3 && <Typography>Links — placeholder</Typography>}
                {tab === 4 && <Typography>History — placeholder</Typography>}
            </Paper>
        </Box>
    )
}
