import {Box, CardContent, CircularProgress, Typography} from "@mui/material";
import type {UserIssue} from "../../lib/types.ts";
import {Link} from "react-router-dom";

export const IssuesPanel = ({issues}: { issues: UserIssue[] }) => {
    if (issues.length === 0) {
        return (
            <CircularProgress color="secondary" size={20}/>
        );
    }
    return (
        <CardContent sx={{height: '100%'}}>
            <Typography variant="h5" component="div" mb={2}>
                My Latest Issues
            </Typography>
            <Box display="flex" flexDirection="column" sx={{flexGrow: 1}}>
                {issues.map(issue => (
                    <Typography sx={{textDecoration: "none", pb: 1, color: "black"}} component={Link}
                                to={`/issues/${issue.id}`} variant="body1">
                        {issue.summary} - [{issue.key}]
                    </Typography>)
                )}
            </Box>
        </CardContent>
    );
};