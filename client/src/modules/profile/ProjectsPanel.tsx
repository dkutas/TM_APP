import type {UserProject} from "../../lib/types";
import {Box, CardContent, CircularProgress, Typography} from "@mui/material";
import {Link} from "react-router-dom";

export const ProjectsPanel = ({projects, isLoading}: { projects: UserProject[], isLoading: boolean }) => {
    if (isLoading) {
        return (
            <CircularProgress color="secondary" size={20}/>
        );
    }
    return <CardContent sx={{height: '100%'}}>
        <Typography variant="h5" component="div" mb={2}>
            My Projects
        </Typography>
        <Box display="flex" flexDirection="column" sx={{flexGrow: 1}}>

            {projects.length > 0 ? projects.map(project => (
                    <Typography key={project.projectId} sx={{textDecoration: "none", color: "black", pb: 1}}
                                component={Link}
                                to={`/projects/${project.projectId}`} variant="body1">
                        {project.projectName}({project.projectKey}) (Role: {project.role.name})
                    </Typography>)) :
                <Typography variant="body1" color="text.secondary">
                    You are not a member of any projects.
                </Typography>
            }
        </Box>
    </CardContent>
};