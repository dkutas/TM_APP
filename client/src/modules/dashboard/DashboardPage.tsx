
import {Card, CardContent, CardHeader, Grid, List, ListItemButton, ListItemText, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {api} from "../../lib/mock";
import type {Issue, Project} from "../../lib/types";
import {useNavigate} from "react-router-dom";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.listProjects().then(setProjects);
    api.listIssues().then(res => setIssues(res.slice(0,6)));
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="My Projects"/>
          <CardContent>
            <List>
              {projects.map(p => (
                <ListItemButton key={p.id} onClick={() => navigate(`/projects/${p.id}`)}>
                  <ListItemText primary={`${p.key} — ${p.name}`} secondary={`${p.users.length} members`}/>
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="My latest issues"/>
          <CardContent>
            <List>
              {issues.map(i => (
                <ListItemButton key={i.id} onClick={() => navigate(`/issues/${i.id}`)}>
                  <ListItemText primary={`${i.key} — ${i.summary}`} secondary={`Status: ${i.status} • Priority: ${i.priority}`}/>
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
