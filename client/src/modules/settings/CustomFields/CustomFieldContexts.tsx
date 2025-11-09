import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {CustomFieldDefWithContexts} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";
import {Box, Card, CardContent, CircularProgress, IconButton, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditIcon from "@mui/icons-material/Edit";

export const CustomFieldContexts = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [fieldDefWithContexts, setFieldDefWithContexts] = useState<CustomFieldDefWithContexts | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true)
        if (id) {
            api.get<CustomFieldDefWithContexts>(`field-definition/${id}/with-contexts`).then((res) => {
                setFieldDefWithContexts(res.data);
                setIsLoading(false);
            })

        }
    }, [id]);

    if (!id) {
        navigate("/settings/custom-fields")
    }
    if (isLoading) {
        return <CircularProgress/>
    }

    const colors = [
        "#CDEBC1",
        "#FAD3D7",
        "#FCE8A8",
        "#BBD6FF",
        "#E6D4C9",
        "#F7E1AF",
        "#C7EBD5",
        "#D7C4F2",
    ];


    return (
        <Grid container spacing={3}>
            <Grid size={12} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h4">{`${fieldDefWithContexts?.name} occures on`}</Typography>
            </Grid>

            {fieldDefWithContexts?.contexts.length === 0 ? (<></>) : (


                <Grid size={12}>
                    <Grid container spacing={3}>
                        {Object.entries(Object.groupBy(fieldDefWithContexts?.contexts || [], ((ctx) => ctx.project.name))).map(([pName, ctx], i) => {
                            const p = ctx?.[0].project;
                            return (
                                <Grid key={p?.id} size={{xs: 12, sm: 6, md: 3}}>
                                    <Card sx={{
                                        bgcolor: colors[i % colors.length],
                                        borderRadius: 4,
                                        p: 2,
                                        height: '100%',
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="h6" fontWeight={700} noWrap>
                                                {pName}
                                            </Typography>
                                            <IconButton aria-label="view"
                                                        onClick={() => navigate(`/projects/${p?.id}/settings`)}>
                                                <EditIcon/>
                                            </IconButton>
                                        </Box>

                                        <CardContent sx={{p: 0}}>
                                            {ctx?.map(ctx => (
                                                <Typography key={ctx.issueType?.id} variant="subtitle1" sx={{py: 0.5}}>
                                                    {ctx.issueType?.name}
                                                </Typography>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            )}
        </Grid>
    );
};