
import {useEffect, useState} from "react";
import {api} from "../../lib/mock";
import type {Project} from "../../lib/types";
import {Button, Card, CardContent, CardHeader, Grid, List, ListItemButton, ListItemText, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => { api.listProjects().then(setProjects); }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained">New Project</Button>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="All projects"/>
          <CardContent>
            <List>
              {projects.map(p => (
                <ListItemButton key={p.id} onClick={() => navigate(`/projects/${p.id}`)}>
                  <ListItemText primary={`${p.key} — ${p.name}`} secondary={p.description}/>
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
