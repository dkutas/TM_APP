import {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    type SelectChangeEvent,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {api} from '../../lib/apiClient';
import {
    DataType,
    type ID,
    type IssueCustomFieldContext,
    type IssueCustomFieldDefs,
    type IssuePriority,
    type IssueSystemFields,
    type NormalizedFieldValue,
    type Project,
    type ProjectIssueType,
    type ProjectIssueTypeResponse,
    type User
} from "../../lib/types.ts";
import type {Dayjs} from "dayjs";
import dayjs from 'dayjs';
import {useParams} from "react-router-dom";


export type FieldOption = { id: string; key?: string; value: string };


export type UserLite = {
    id: string;
    name?: string | null;
    email?: string | null
};
export type Membership = {
    id: ID;
    user: {
        id: string;
        name?: string | null;
        email?: string | null
    }
};

export type IssueModalProps = {
    isNew?: boolean;
    open: boolean;
    onClose: (b: boolean) => void;
    onSave: () => void;

};

function MultiValue({values}: { values: string[] }) {
    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
            {values.map((v) => (
                <Chip key={v} size="small" label={v}/>
            ))}
        </Box>
    );
}

export default function IssueCreateModal({
                                             open = false,
                                             onClose,
                                             onSave,
                                         }: IssueModalProps) {
    const [loading, setLoading] = useState(false);
    const [customFields, setCustomFields] = useState<IssueCustomFieldContext[]>([]);
    const [systemFields, setSystemFields] = useState<IssueSystemFields | null>(null);
    const [users, setUsers] = useState<UserLite[]>([]);
    const [priorities, setPriorities] = useState<IssuePriority[]>([]);
    const [activeStep, setActiveStep] = useState<number>(0);

    const {projectId} = useParams();

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectIssueTypes, setProjectIssueTypes] = useState<ProjectIssueType[]>([]);

    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedIssueType, setSelectedIssueType] = useState<string | null>(null);


    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const [values, setValues] = useState<Record<string, NormalizedFieldValue["value"]>>({});

    const saveValues = async (): Promise<void> => {
        api.post<{ ok: boolean }>(`/issue`, {
            cFvalues: Object.entries(values).map(([field, value]) => ({
                fieldDefId: field,
                value,
                fieldName: customFields.find((_field) => _field.fieldDef.id === field)?.fieldDef.name,
            })),
            systemValues: systemFields,
            projectId: selectedProject!,
            issueTypeId: selectedIssueType!,
        }).then(res => {
            if (res.data.ok) {
                onSave()
            }
        })
        onClose(false)
    }

    useEffect(() => {
        setLoading(true)
        api.get<Project[]>("/project").then((res) => {
            setProjects(res.data);
            setSelectedProject(res.data.find(p => p.id === projectId)?.id || null);

        }).finally(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        if (selectedProject) {
            api.get<ProjectIssueTypeResponse>(`/project/${selectedProject}/issue-types`).then(res => {
                setProjectIssueTypes(res.data.projectIssueTypes);
                setSelectedIssueType(res.data.projectIssueTypes[0]?.issueType.id || null);
            })
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedProject && selectedIssueType) {
            api.get<IssueCustomFieldContext[]>(`/project/${selectedProject}/issue-type/${selectedIssueType}/fields`).then(res => {
                setCustomFields(res.data);
                api.get<Membership[]>(`/project/${selectedProject}/members`).then(res => setUsers(res.data.map(m => m.user)));
                api.get<IssuePriority[]>(`/priority`).then(res => setPriorities(res.data));
                api.get<User>(`/auth/me`).then(res => {
                    setSystemFields((v) => (
                        {
                            ...v as IssueSystemFields,
                            reporter: res.data.id,
                        }
                    ))
                })
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [projectId, selectedIssueType, selectedProject]);

    const optionMap = useMemo(() => {
        const m: Record<string, FieldOption[]> = {};
        for (const f of customFields) if (f.fieldDef.options && f.fieldDef.options.length) m[f.fieldDef.id] = f.fieldDef.options;
        return m;
    }, [customFields]);

    const handleChangeCf = (fieldId: string, val: NormalizedFieldValue["value"]) => setValues((v) => {
        return {
            ...v,
            [fieldId]: val
        }
    });

    const renderSystemFields = () => {
        return (<>
                <Grid size={{xs: 12, md: 12}}>
                    <TextField
                        fullWidth
                        minRows={3}
                        label="Summary"
                        value={systemFields?.summary}
                        onChange={(e) => setSystemFields((v) => ({
                            ...v as IssueSystemFields,
                            summary: e.target.value
                        }))}
                    /></Grid>
                <Grid size={{xs: 12, md: 12}}>
                    <TextField
                        fullWidth
                        minRows={3}
                        multiline
                        label="Description"
                        value={systemFields?.description}
                        onChange={(e) => setSystemFields((v) => ({
                            ...v as IssueSystemFields,
                            description: e.target.value
                        }))}
                    /></Grid>

                <Grid size={{xs: 6, md: 6}}>
                    <FormControl fullWidth>
                        <InputLabel>Assignee</InputLabel>
                        <Select
                            label="Assignee"
                            value={systemFields?.assignee ?? ""}
                            onChange={(e) => setSystemFields((v) => {
                                return {
                                    ...(v as IssueSystemFields),
                                    assignee: e.target.value as ID || null
                                }
                            })}
                        >
                            <MenuItem value="">
                                <em>Unassigned</em>
                            </MenuItem>
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name || u.email || u.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs: 6, md: 6}}>
                    <FormControl fullWidth>
                        <InputLabel>Reporter</InputLabel>
                        <Select
                            label="Assignee"
                            value={systemFields?.reporter ?? ""}
                            onChange={(e) => setSystemFields((v) => {
                                return {
                                    ...(v as IssueSystemFields),
                                    reporter: e.target.value as ID || null
                                }
                            })}
                        >
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name || u.email || u.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs: 12, md: 12}}>
                    <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            label="Priority"
                            value={systemFields?.priority ?? ""}
                            onChange={(e) => setSystemFields((v) => {
                                return {
                                    ...(v as IssueSystemFields),
                                    priority: e.target.value as ID || null
                                }
                            })}
                        >
                            {priorities.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name || u.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs: 12, md: 12}}>
                    <DatePicker
                        label="Due Date"
                        value={null}
                        onChange={(e) => setSystemFields((v) => {
                            return {
                                ...(v as IssueSystemFields),
                                dueDate: e?.toISOString() || ""
                            }
                        })}
                        slotProps={{textField: {fullWidth: true}}}
                    />
                </Grid>
            </>
        )
    }

    const renderCustomFields = (f: IssueCustomFieldDefs) => {
        const v = values[f.id];
        switch (f.dataType) {
            case DataType.TEXT:
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label={f.name}
                        value={v ?? ''}
                        onChange={(e) => handleChangeCf(f.id, e.target.value)}
                    />
                );

            case DataType.NUMBER:
                return (
                    <TextField
                        slotProps={{htmlInput: {steps: 'any'}}}
                        fullWidth
                        type="number"
                        label={f.name}
                        value={v ?? ''}
                        onChange={(e) => handleChangeCf(f.id, e.target.value === '' ? null : Number(e.target.value))}
                    />
                );

            case DataType.USER:
                return (
                    <FormControl fullWidth>
                        <InputLabel>{f.name}</InputLabel>
                        <Select
                            label={f.name}
                            value={v?.toString() ?? ''}
                            onChange={(e: SelectChangeEvent) => handleChangeCf(f.id, e.target.value || null)}
                        >
                            <MenuItem value="">
                                <em>Unassigned</em>
                            </MenuItem>
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name || u.email || u.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case DataType.OPTION:
                return (
                    <FormControl fullWidth>
                        <InputLabel>{f.name}</InputLabel>
                        <Select
                            label={f.name}
                            value={v?.toString() ?? ''}
                            onChange={(e: SelectChangeEvent) => handleChangeCf(f.id, e.target.value || null)}
                        >
                            <MenuItem value="">
                                <em>—</em>
                            </MenuItem>
                            {(optionMap[f.id] || []).map((o) => (
                                <MenuItem key={o.id} value={o.id}>
                                    {o.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case DataType.MULTI_OPTION:
                return (
                    <FormControl fullWidth>
                        <InputLabel>{f.name}</InputLabel>
                        <Select
                            multiple
                            label={f.name}
                            value={(v as string[]) ?? []}
                            input={<OutlinedInput label={f.name}/>}
                            onChange={(e: SelectChangeEvent<string[]>) => handleChangeCf(f.id, e.target.value as string[])}
                            renderValue={(selected) => <MultiValue
                                values={selected.map((sel) => f.options?.find((op => op.id === sel))?.value || "No value") || selected}/>}
                        >
                            {(optionMap[f.id] || []).map((o) => (
                                <MenuItem key={o.id} value={o.id}>
                                    {o.key}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case DataType.DATE: {
                const dv: Dayjs | null = v ? dayjs(new Date(v as string)) : null;
                return (
                    <DatePicker
                        label={f.name}
                        value={dv}
                        onChange={(d) => handleChangeCf(f.id, d ? d.toISOString() : null)}
                        slotProps={{textField: {fullWidth: true}}}
                    />
                );
            }

            case DataType.DATETIME: {
                const dv: Dayjs | null = v ? dayjs(new Date(v as string)) : null;
                return (
                    <DateTimePicker
                        label={f.name}
                        value={dv}
                        onChange={(d) => handleChangeCf(f.id, d ? d.toISOString() : null)}
                        slotProps={{textField: {fullWidth: true}}}
                    />
                );
            }

            case DataType.BOOL:
                return (
                    <FormControl fullWidth>
                        <InputLabel>{f.name}</InputLabel>
                        <Select
                            label={f.name}
                            value={typeof v === 'boolean' ? String(v) : ''}
                            onChange={(e: SelectChangeEvent) => {
                                const raw = e.target.value;
                                handleChangeCf(f.id, raw === '' ? null : raw === 'true');
                            }}
                        >
                            <MenuItem value="">
                                <em>—</em>
                            </MenuItem>
                            <MenuItem value="true">true</MenuItem>
                            <MenuItem value="false">false</MenuItem>
                        </Select>
                    </FormControl>
                );
        }
    };

    const renderEditContent = () => {
        return loading ? (
                <Box py={6} textAlign="center">
                    <CircularProgress/>
                </Box>
            ) :
            <>
                <Box mb={2}>
                    <Typography typography="h5" sx={{mb: 3}}>System fields</Typography>
                    <Grid container gap={2} spacing={2}>
                        {renderSystemFields()}
                    </Grid>
                </Box>
                {customFields.length === 0 ? (
                    <Typography color="text.secondary">No editable custom fields.</Typography>
                ) : (
                    <>

                        <Box mb={2}>
                            <Typography typography="h5" sx={{mb: 3}}>Custom fields</Typography>
                            <Grid container gap={2} spacing={1}>
                                {customFields.map((f) => (
                                    <Grid key={f.fieldDef.id} size={{xs: 12, md: 12}}>
                                        {renderCustomFields(f.fieldDef)}
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </>
                )}
            </>
    }


    const renderActions = () => {
        if (activeStep === 0) {
            return <>
                <Button variant="outlined" onClick={() => onClose(false)}>Close</Button>
                <Button variant="contained" onClick={() => handleNext()}>
                    Next
                </Button>
            </>
        } else {
            return <>
                <Button variant="outlined" onClick={() => handleBack()}>Back</Button>
                <Button variant="contained" onClick={() => saveValues()}>
                    Save
                </Button>
            </>
        }

    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Edit fields</DialogTitle>
                <DialogContent>
                    <Stepper sx={{mb: 2}} activeStep={activeStep} orientation="horizontal">
                        <Step key="Project and Issuetype">
                            <StepLabel>Project and Issuetype</StepLabel>
                        </Step>
                        <Step key="Fields">
                            <StepLabel>Fields</StepLabel>
                        </Step>
                    </Stepper>
                    {activeStep === 0 ?
                        <Box sx={{display: "flex", flexDirection: "column"}}>
                            <FormControl sx={{mb: 3}}>
                                <InputLabel>Project</InputLabel>
                                <Select
                                    readOnly={!!projectId}
                                    disabled={!!projectId}
                                    label="Project"
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    {projects.map((project) => (
                                        <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <InputLabel>Issue Type</InputLabel>
                                <Select
                                    label="Issue Type"
                                    value={selectedIssueType}
                                    onChange={(e) => setSelectedIssueType(e.target.value)}
                                >
                                    {projectIssueTypes?.map((pIssueType) => (
                                        <MenuItem key={pIssueType.id}
                                                  value={pIssueType.issueType.id}>{pIssueType.issueType.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        : renderEditContent()
                    }
                </DialogContent>
                <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
                    {renderActions()}
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}