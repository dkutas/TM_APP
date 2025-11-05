import {
    Autocomplete,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Stack,
    TextField
} from "@mui/material";
import type {EditCrudModalProps} from "../../settings/types.ts";
import {useEffect, useState} from "react";
import type {CustomFieldOption, PitCustomFieldContext} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

export const EditCustomFieldContextModal = ({open, id, closeDialog, onSave}: EditCrudModalProps) => {

    const [currentContext, setCurrentContext] = useState<PitCustomFieldContext | null>(null);
    const [options, setOptions] = useState<CustomFieldOption[]>([]);

    const renderRequiredCheckbox = () => {
        if (!currentContext) return null;
        return (
            <FormControl>
                <FormControlLabel
                    label="Is Required?"
                    control={<Checkbox
                        checked={currentContext.required}
                        onChange={(e) => {
                            setCurrentContext({...currentContext, required: e.target.checked})
                        }}
                    />}
                />
            </FormControl>
        );
    }

    const renderDefaultValueField = () => {
        if (!currentContext) return null;
        switch (currentContext.fieldDef?.dataType) {
            case 'TEXT':
                return (
                    <TextField
                        label="Default Value"
                        value={currentContext.defaultValue || ''}
                        onChange={(e) => {
                            setCurrentContext({...currentContext, defaultValue: e.target.value})
                        }}
                        fullWidth
                    />
                );
            case 'NUMBER':
                return (
                    <TextField
                        label="Default Value"
                        value={currentContext.defaultValue || ''}
                        onChange={(e) => {
                            setCurrentContext({...currentContext, defaultValue: Number(e.target.value)})
                        }}
                        fullWidth
                    />
                );
            default:
                return null;
        }
    }

    const renderContextInvariants = () => {
        if (!currentContext) return null;
        switch (currentContext.fieldDef?.dataType) {
            case 'TEXT':
                return (
                    <>
                        {renderRequiredCheckbox()}
                        {renderDefaultValueField()}
                        <TextField
                            label="Regex"
                            value={currentContext.regex}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, regex: e.target.value})
                            }}
                            fullWidth
                        />
                    </>
                );
            case 'NUMBER':
                return (
                    <>
                        {renderRequiredCheckbox()}
                        {renderDefaultValueField()}
                        <TextField
                            label="Min"
                            value={currentContext.min || ''}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, min: Number(e.target.value)})
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Max"
                            value={currentContext.max || ''}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, max: Number(e.target.value)})
                            }}
                            fullWidth
                        />
                    </>
                );
            case 'OPTION':
                return <>
                    {renderRequiredCheckbox()}
                    <Autocomplete
                        options={options}
                        getOptionLabel={(option) => option.value}
                        value={currentContext.defaultOption || null}
                        onChange={(_, v) => {
                            setCurrentContext({...currentContext, defaultOption: v})
                        }}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                label="Default Option"
                                fullWidth
                            />
                        }
                    />
                </>
            case 'MULTI_OPTION':
                return <>
                    {renderRequiredCheckbox()}
                    <Autocomplete
                        options={options}
                        getOptionLabel={(option) => option.value}
                        value={currentContext.defaultOption}
                        onChange={(_, v) => {
                            setCurrentContext({
                                ...currentContext,
                                defaultOption: v
                            })
                        }}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                label="Default Option"
                                fullWidth
                            />
                        }
                    />
                </>
            default:
                return null;
        }
    }

    useEffect(() => {
        if (!id) return;
        console.log(id)
        api.get<PitCustomFieldContext>(`field-context/${id}`).then((response) => {
                setCurrentContext(response.data)
                return response.data
            }
        ).then((ctx) => {
                if (ctx.fieldDef.dataType === 'OPTION' || ctx.fieldDef.dataType === 'MULTI_OPTION') {
                    api.get<CustomFieldOption[]>(`field-definition/${ctx.fieldDef?.id}/options`)
                        .then((response) => setOptions(response.data));
                }
            }
        );
    }, [id])


    const handleSave = () => {
        api.patch(`field-context/${id}`, currentContext).then(() => {
                onSave()
                closeDialog()
            }
        );
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Edit {currentContext?.fieldDef.name} field's Invariants</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    {renderContextInvariants()}
                </Stack>
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between", px: 3, pb: 2}}>
                <Button variant="outlined" onClick={closeDialog}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};