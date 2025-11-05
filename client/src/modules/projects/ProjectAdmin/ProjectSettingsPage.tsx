import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import type {MembershipWithRole, Project} from "../../../lib/types.ts";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {api} from "../../../lib/apiClient.ts";
import {ProjectIssueTypes} from "./ProjectIssueTypes.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import {useConfirm} from "../../../app/Confirm/useConfirm.ts";


export function ProjectSettingsPage() {
    const {projectId} = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [projectMembers, setProjectMembers] = useState<MembershipWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState(0);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignableUsers, setAssignableUsers] = useState<Array<{ id: string; name: string }>>([]);

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const {openConfirm} = useConfirm();

    useEffect(() => {
        if (assignableUsers.length === 0 && isAssigning && projectId) {
            api.get<Array<{ id: string; name: string }>>(`/project/${projectId}/assignable-users`).then(res => {
                setAssignableUsers(res.data);
            })
        }
    }, [assignableUsers.length, isAssigning, projectId]);

    const assignUser = () => {
        if (projectId && selectedUserId) {
            api.post(`/project/${projectId}/members`, {userId: selectedUserId}).then(() => {
                setAssignableUsers([])
                // Refresh members list
                api.get(`project/${projectId}/members-with-roles`).then(res => {
                    setProjectMembers(res.data);
                    setIsAssigning(false);
                    setSelectedUserId(null);
                });
            });
        }
    };

    const handleDeleteMember = (memberId: string) => {
        if (projectId) {
            api.delete(`/project/${projectId}/members/${memberId}`).then(() => {
                // Refresh members list
                api.get(`project/${projectId}/members-with-roles`).then(res => {
                    setProjectMembers(res.data);
                });
            });
        }
    };


    useEffect(() => {
        if (projectId) {
            setIsLoading(true);
            Promise.all([api.get(`project/${projectId}`).then(res => res.data), api.get(`project/${projectId}/members-with-roles`).then(res => res.data)]).then(([projectData, membersData]) => {
                    setProject(projectData);
                    setProjectMembers(membersData);
                    setIsLoading(false);
                }
            )
        }
    }, [projectId]);

    if (!projectId || !project) return null;

    if (isLoading) {
        return <CircularProgress/>;
    }

    const renderAssign = () => {
        if (isAssigning) {
            return <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2}}>

                <FormControl>
                    <InputLabel>User</InputLabel>
                    <Select
                        value={selectedUserId}
                        label="User"
                        onChange={(e) => {
                            setSelectedUserId(e.target.value)
                            console.log(e.target.value);
                        }}
                        sx={{minWidth: 200}}
                    >
                        <MenuItem value="" disabled>Select user to assign</MenuItem>
                        {assignableUsers.map(user => (
                            <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={assignUser}>Assign</Button>
            </Box>
        }
        return <Button variant="contained" onClick={() => setIsAssigning(true)}>Assign user</Button>;
    }

    return (
        <Grid container spacing={3}>
            <Grid size={12}>
                <Typography variant="h4">{project.key} — {project.name}</Typography>
                <Typography variant="body1" color="text.secondary">{project.description}</Typography>
            </Grid>
            <Grid size={12}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Overview"/>
                    <Tab label="Users"/>
                    <Tab label="Issue types"/>
                </Tabs>
            </Grid>
            <Grid size={12}>
                {tab === 0 && (
                    <Paper sx={{p: 2}}>
                        <Typography variant="h6">Project Overview</Typography>
                        <Typography mt={1}>Key: {project.key}</Typography>
                        <Typography>Description: {project.description || '—'}</Typography>
                    </Paper>
                )}
                {tab === 1 && (
                    <Paper sx={{p: 2}}>
                        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>

                            <Typography variant="h6" gutterBottom>Users</Typography>
                            {renderAssign()}
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <List>
                                {projectMembers.map(u => (
                                    <ListItem key={u.id} secondaryAction={
                                        <IconButton color="error" edge="end" aria-label="delete"
                                                    onClick={() => openConfirm(() => handleDeleteMember(u.user.id), `Are you sure you want to remove ${u.user.name} from the project?`)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    }>
                                        <ListItemAvatar>
                                            <Avatar>
                                                {u.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={u.user.name}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                    </Paper>
                )}
                {tab === 2 && (
                    <ProjectIssueTypes projectId={projectId}/>
                )}
            </Grid>
        </Grid>
    );
}
