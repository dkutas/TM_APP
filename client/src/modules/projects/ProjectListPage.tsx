import {useEffect, useState} from "react";
import type {Project} from "../../lib/types";
import Grid from "@mui/material/Grid2";
import {Box, Button, Card, CardActionArea, CardContent, Typography,} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {api} from "../../lib/apiClient.ts";
import {CreateProjectModal} from "./ProjectAdmin/CreateProjectModal.tsx";

export default function ProjectListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchProjects = () => {
        api.get(`/project`).then((res) => setProjects(res.data));
    }

    useEffect(() => {
        fetchProjects()
    }, []);


    const colors = [
        "#CDEBC1", // soft green
        "#FAD3D7", // soft pink
        "#FCE8A8", // pale yellow
        "#BBD6FF", // light blue
        "#E6D4C9", // warm gray
        "#F7E1AF", // sand
        "#C7EBD5", // mint
        "#D7C4F2", // lavender
    ];

    return (
        <Grid container spacing={3}>
            <Grid size={12} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h4">Your Projects</Typography>
                <Button variant="contained" onClick={() => setIsCreateModalOpen(true)}>New Project</Button>
            </Grid>

            <Grid size={12}>
                <Grid container spacing={3}>
                    {projects.map((p, i) => (
                        <Grid key={p.id} size={{xs: 12, sm: 6, md: 3}}>
                            <Card sx={{bgcolor: colors[i % colors.length], borderRadius: 4}}>
                                <CardActionArea
                                    onClick={() => navigate(`/projects/${p.id}`)}
                                    sx={{
                                        height: 200,
                                        p: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} noWrap>
                                            {p.name}
                                        </Typography>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {p.key}
                                        </Typography>
                                    </Box>

                                    <CardContent sx={{p: 0}}>
                                        <Typography variant="body2" sx={{opacity: 0.9}}>
                                            {p.description || "Here comes the description of the projects…"}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <CreateProjectModal open={isCreateModalOpen} closeDialog={() => setIsCreateModalOpen(false)}
                                onSave={fetchProjects}/>
        </Grid>
    );
}
