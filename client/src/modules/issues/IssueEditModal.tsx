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
    Stack,
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
    type Issue,
    type IssueCustomField,
    type IssueCustomFieldDefs,
    type IssuePriority,
    type IssueSystemFields,
    type NormalizedFieldValue
} from "../../lib/types.ts";
import type {Dayjs} from "dayjs";
import dayjs from 'dayjs';


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

export type IssueEditModalProps = {
    open: boolean;
    issueId: string;
    onClose: (b: boolean) => void;
    onSave: () => void;
    issue: Issue | null;
    /**
     * Optional preloaded fields (if not provided, the modal will fetch them).
     */
    fields?: IssueCustomField[];
};

// Helper to render multi-select chips
function MultiValue({values}: { values: string[] }) {
    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
            {values.map((v) => (
                <Chip key={v} size="small" label={v}/>
            ))}
        </Box>
    );
}

export default function IssueEditModal({
                                           open,
                                           issueId,
                                           issue,
                                           onClose,
                                           fields: fieldsProp,
                                           onSave
                                       }: IssueEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [customFields, setCustomFields] = useState<IssueCustomField[]>(fieldsProp ?? []);
    const [systemFields, setSystemFields] = useState<IssueSystemFields | null>(null);
    const [users, setUsers] = useState<UserLite[]>([]);
    const [priorities, setPriorities] = useState<IssuePriority[]>([]);


    // local state of values keyed by field id
    const [values, setValues] = useState<Record<string, NormalizedFieldValue["value"]>>({});

    const saveValues = async (): Promise<void> => {
        api.put<{ ok: boolean }>(`/issue/${issueId}/fields`, {
            updates: Object.entries(values).map(([field, value]) => ({
                fieldDefId: field,
                value,
                fieldName: customFields.find((_field) => _field.id === field)?.name,
            })),
            systemUpdates: systemFields,
        }).then(async (res) => {
            if (res.data.ok) {
                await onSave()
                setSystemFields(null)
                setCustomFields(fieldsProp ?? [])
            }
        })
        onClose(false)
    }

    // Fetch available fields and users when opened
    useEffect(() => {
        if (!open) return;

        if (issue) {
            setSystemFields({
                summary: issue.summary,
                description: issue.description || undefined,
                assignee: issue.assignee?.id || undefined,
                reporter: issue.reporter.id,
                priority: issue.priority.id,
                dueDate: issue.dueDate || undefined,
            })
        }

        setValues(Object.fromEntries(customFields.map((_field) => ([_field?.id, _field.value]))));

        let cancelled = false;
        const run = async () => {
            try {
                setLoading(true);
                if (!fieldsProp) {
                    const res = await api.get<IssueCustomFieldDefs[]>(`/issue/${issueId}/field-definitions`);
                    if (!cancelled) setCustomFields(res.data as IssueCustomField[]);
                }
                const users = await api.get<Membership[]>(`/project/${issue?.project.id}/members`);
                const priorities = await api.get<IssuePriority[]>('/priority');
                if (!cancelled) {
                    setUsers(users.data.map((u) => u.user));
                    setPriorities(priorities.data)
                }

            } catch {
                // swallow for now
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [open, issueId, fieldsProp, customFields, issue]);

    const optionMap = useMemo(() => {
        const m: Record<string, FieldOption[]> = {};
        for (const f of customFields) if (f.options && f.options.length) m[f.id] = f.options;
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
                        value={issue?.dueDate ? dayjs(new Date(issue.dueDate)) : null}
                        onChange={(e) => setSystemFields((v) => {
                            console.log(e)
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

    const renderCustomFields = (f: IssueCustomField) => {
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

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Edit fields</DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Box py={6} textAlign="center">
                            <CircularProgress/>
                        </Box>
                    ) : (
                        <>
                            <Typography typography="h5" sx={{mb: 3}}>System fields</Typography>
                            <Stack> <Grid container gap={2} spacing={2}>
                                {renderSystemFields()}
                            </Grid></Stack>
                            <Typography typography="h5" sx={{mb: 3}}>Custom fields</Typography>
                            {customFields.length === 0 ? (
                                    <Typography color="text.secondary">No editable custom fields.</Typography>
                                ) :
                                <Stack spacing={2} sx={{mt: 1}}>
                                    <Grid container gap={2} spacing={1}>
                                        {customFields.map((f) => (
                                            <Grid key={f.id} size={{xs: 12, md: 12}}>
                                                {renderCustomFields(f)}
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Stack>}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)}>Close</Button>
                    <Button variant="contained" onClick={() => saveValues()}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}