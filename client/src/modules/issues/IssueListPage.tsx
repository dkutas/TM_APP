
import {useEffect, useMemo, useState} from "react";
import {api} from "../../lib/mock";
import type {Issue} from "../../lib/types";
import {Box, Divider, Grid, IconButton, List, ListItemButton, ListItemText, Paper, TextField, Typography} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {useNavigate} from "react-router-dom";
import {useUIStore} from "../../app/store";

export default function IssueListPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Issue[]>([]);
  const { isDetailsOpen, selectedIssueId, selectIssue, splitPaneSize, setSplitPane } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => { api.listIssues().then(setItems); }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter(i => i.key.toLowerCase().includes(s) || i.summary.toLowerCase().includes(s));
  }, [q, items]);

  const selected = useMemo(() => filtered.find(i => i.id === selectedIssueId), [filtered, selectedIssueId]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Issues — list view</Typography>
      </Grid>
      <Grid item xs={12} md={isDetailsOpen ? 7 : 12}>
        <Paper sx={{p:2}}>
          <TextField value={q} onChange={(e)=>setQ(e.target.value)} fullWidth placeholder="Search issues by key or summary"/>
          <List>
            {filtered.map(i => (
              <ListItemButton key={i.id} selected={i.id===selectedIssueId} onClick={()=>selectIssue(i.id)}>
                <ListItemText primary={`${i.key} — ${i.summary}`} secondary={`Status: ${i.status} • Priority: ${i.priority}`} />
                <IconButton edge="end" onClick={(e)=>{e.stopPropagation(); navigate(`/issues/${i.id}`)}}><OpenInNewIcon/></IconButton>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Grid>

      {isDetailsOpen && (
        <Grid item xs={12} md={5}>
          <Paper sx={{p:2}}>
            {selected ? (
              <>
                <Typography variant="h6">{selected.key} — {selected.summary}</Typography>
                <Typography color="text.secondary">Status: {selected.status} • Priority: {selected.priority}</Typography>
                <Divider sx={{my:2}}/>
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
