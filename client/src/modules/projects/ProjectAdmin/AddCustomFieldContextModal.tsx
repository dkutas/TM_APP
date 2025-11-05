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
import type {CreateCrudModalProps} from "../../settings/types.ts";
import {useEffect, useState} from "react";
import type {CreateCustomFieldContextDto, CustomFieldDefinitionBase, CustomFieldOption} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

interface AddCustomFieldContext extends CreateCrudModalProps {
    issueTypeId: string;
    projectId: string;
}

export const AddCustomFieldContextModal = ({
                                               open,
                                               closeDialog,
                                               onSave,
                                               issueTypeId,
                                               projectId
                                           }: AddCustomFieldContext) => {

    const [currentContext, setCurrentContext] = useState<CreateCustomFieldContextDto | null>({
        required: false,
    });
    const [options, setOptions] = useState<CustomFieldOption[]>([]);
    const [fieldDefinitions, setFieldDefinitions] = useState<CustomFieldDefinitionBase[]>([]);
    const [selectedFieldDefinition, setSelectedFieldDefinition] = useState<CustomFieldDefinitionBase | null>(null);


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
        switch (selectedFieldDefinition?.dataType) {
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
        if (!selectedFieldDefinition) return null;
        switch (selectedFieldDefinition.dataType) {
            case 'TEXT':
                return (
                    <>
                        {renderRequiredCheckbox()}
                        {renderDefaultValueField()}
                        <TextField
                            label="Regex"
                            value={currentContext?.regex}
                            onChange={(e) => {
                                setCurrentContext({
                                    defaultOption: undefined,
                                    defaultValue: undefined,
                                    issueTypeId: undefined,
                                    max: 0,
                                    min: 0,
                                    projectId: undefined,
                                    required: false,
                                    ...currentContext,
                                    regex: e.target.value
                                })
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
                            value={currentContext?.min || ''}
                            onChange={(e) => {
                                setCurrentContext({
                                    ...currentContext,
                                    min: Number(e.target.value)
                                } as CreateCustomFieldContextDto)
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Max"
                            value={currentContext?.max || ''}
                            onChange={(e) => {
                                setCurrentContext({
                                    ...currentContext,
                                    max: Number(e.target.value)
                                } as CreateCustomFieldContextDto)
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
                        value={currentContext?.defaultOption || null}
                        onChange={(_, v) => {
                            setCurrentContext({...currentContext, defaultOption: v} as CreateCustomFieldContextDto)
                        }}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                label="Default Option"
                                fullWidth/>
                        }
                    />
                </>
            case 'MULTI_OPTION':
                return <>
                    {renderRequiredCheckbox()}
                    <Autocomplete
                        options={options}
                        getOptionLabel={(option) => option.value}
                        value={currentContext?.defaultOption || null}
                        onChange={(_, v) => {
                            setCurrentContext({
                                ...currentContext,
                                defaultOption: v
                            } as CreateCustomFieldContextDto)
                        }}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                label="Default Options"
                                fullWidth/>
                        }
                    />
                </>
            default:
                return null;
        }
    }

    useEffect(() => {
        api.get<CustomFieldOption[]>('field-option').then((res) => {
            setOptions(res.data);
        });
        api.get<CustomFieldDefinitionBase[]>('field-definition').then((res) => {
            setFieldDefinitions(res.data);
            return res.data;
        });
    }, [])


    const handleSave = () => {
        if (selectedFieldDefinition) {
            api.post('field-context', {
                ...currentContext,
                issueTypeId,
                projectId,
                fieldDefId: selectedFieldDefinition.id
            }).then(() => {
                onSave();
                closeDialog();
            })
        }
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Assign new custom field</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    <Autocomplete
                        options={fieldDefinitions}
                        getOptionLabel={(option) => option.name}
                        value={selectedFieldDefinition || null}
                        onChange={(_, v) => {
                            if (v) {
                                setSelectedFieldDefinition(v)
                                setCurrentContext({
                                    ...currentContext!,
                                    required: false,
                                    defaultValue: undefined,
                                    regex: undefined,
                                    min: undefined,
                                    max: undefined,
                                    defaultOption: undefined
                                })
                            }
                        }}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                label="Custom Field Definition"
                                fullWidth/>
                        }
                    />
                </Stack>
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