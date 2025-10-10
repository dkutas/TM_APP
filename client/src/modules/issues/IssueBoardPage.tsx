
import {useEffect, useState} from "react";
import {api} from "../../lib/mock";
import type {Issue} from "../../lib/types";
import {Card, CardContent, CardHeader, Grid, Stack, Typography} from "@mui/material";

function Column({title, items}:{title:string; items: Issue[]}){
  return (
    <Grid item xs={12} md={4}>
      <Card>
        <CardHeader title={title}/>
        <CardContent>
          <Stack spacing={1}>
            {items.map(i=>(
              <Card key={i.id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">{i.key}</Typography>
                  <Typography variant="body2">{i.summary}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default function IssueBoardPage(){
  const [issues, setIssues] = useState<Issue[]>([]);
  useEffect(()=>{ api.listIssues().then(setIssues); },[]);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}><Typography variant="h4">Board</Typography></Grid>
      <Column title="To Do" items={issues.filter(i=>i.status==='TODO')}/>
      <Column title="In Progress" items={issues.filter(i=>i.status==='IN_PROGRESS')}/>
      <Column title="Done" items={issues.filter(i=>i.status==='DONE')}/>
    </Grid>
  )
}
