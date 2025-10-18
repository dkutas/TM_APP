import type {UserProject} from "../../lib/types";
import {Box, CardContent, CircularProgress, Typography} from "@mui/material";
import {Link} from "react-router-dom";

export const ProjectsPanel = ({projects}: { projects: UserProject[] }) => {
    if (projects.length === 0) {
        return (
            <CircularProgress color="secondary" size={20}/>
        );
    }
    return <CardContent sx={{height: '100%'}}>
        <Typography variant="h5" component="div" mb={2}>
            My Projects
        </Typography>
        <Box display="flex" flexDirection="column" sx={{flexGrow: 1}}>

            {projects.map(project => (
                <Typography sx={{textDecoration: "none", color: "black", pb: 1}} component={Link}
                            to={`/projects/${project.projectId}`} variant="body1">
                    {project.projectName}({project.projectKey}) (Role: {project.role.name})
                </Typography>)
            )}
        </Box>
    </CardContent>
};