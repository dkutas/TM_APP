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
    IconButton,
    Stack,
    TextField,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import type {ModalProps} from "../../settings/types.ts";
import {useEffect, useState} from "react";
import type {
    CreateCustomFieldContextDto,
    CustomFieldDefinitionBase,
    CustomFieldDefWithContexts,
    CustomFieldOption
} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

interface AddCustomFieldContext extends ModalProps {
    issueTypeId: string;
    projectId: string;
}

export const AddCustomFieldContextModal = ({
                                               open = false,
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

    // Új opció beviteléhez (freesolo, de ajánl a backend options alapján)
    const [optionInput, setOptionInput] = useState("");

    const renderRequiredCheckbox = () => {
        if (!currentContext) return null;
        return (
            <FormControl>
                <FormControlLabel
                    label="Is Required?"
                    control={
                        <Checkbox
                            checked={currentContext.required}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, required: e.target.checked});
                            }}
                        />
                    }
                />
            </FormControl>
        );
    };

    const renderDefaultValueField = () => {
        if (!currentContext) return null;
        switch (selectedFieldDefinition?.dataType) {
            case "TEXT":
                return (
                    <TextField
                        label="Default Value"
                        value={currentContext.defaultValue || ""}
                        onChange={(e) => {
                            setCurrentContext({...currentContext, defaultValue: e.target.value});
                        }}
                        fullWidth
                    />
                );
            case "NUMBER":
                return (
                    <TextField
                        label="Default Value"
                        value={currentContext.defaultValue || ""}
                        onChange={(e) => {
                            setCurrentContext({...currentContext, defaultValue: Number(e.target.value)});
                        }}
                        fullWidth
                    />
                );
            default:
                return null;
        }
    };

    // ----- OPTION / MULTI_OPTION helpers: add / move / remove -----

    const handleAddOption = () => {
        if (!currentContext) return;
        const trimmed = optionInput.trim();
        if (!trimmed) return;

        const currentOptions = currentContext.options || [];

        // már benne van context szinten?
        const alreadyInContext = currentOptions.some(
            (o) => o.value.toLowerCase() === trimmed.toLowerCase()
        );
        if (alreadyInContext) {
            setOptionInput("");
            return;
        }

        // ha létezik backend options-ben, azt használjuk
        const existingGlobal = options.find(
            (o) => o.value.toLowerCase() === trimmed.toLowerCase()
        );

        const optionToAdd: CustomFieldOption =
            existingGlobal ??
            ({
                id: crypto.randomUUID(), // temp ID, backend normalizálja
                value: trimmed,
            } as CustomFieldOption);

        const updatedOptions = [...currentOptions, optionToAdd].map((opt, idx) => ({
            ...opt,
            order: idx + 1,
        }));

        setCurrentContext({
            ...currentContext,
            options: updatedOptions,
        } as CreateCustomFieldContextDto);
        setOptionInput("");
    };

    const handleMoveOption = (index: number, direction: "up" | "down") => {
        if (!currentContext?.options) return;
        const opts = [...currentContext.options];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= opts.length) return;

        const [moved] = opts.splice(index, 1);
        opts.splice(newIndex, 0, moved);

        const reOrdered = opts.map((opt, idx) => ({
            ...opt,
            order: idx + 1,
        }));

        setCurrentContext({
            ...currentContext,
            options: reOrdered,
        } as CreateCustomFieldContextDto);
    };

    const handleRemoveOption = (id: string) => {
        if (!currentContext?.options) return;
        const updated = currentContext.options.filter((o) => o.id !== id);

        const reOrdered = updated.map((opt, idx) => ({
            ...opt,
            order: idx + 1,
        }));

        const isDefaultRemoved = currentContext.defaultOption?.id === id;

        setCurrentContext({
            ...currentContext,
            options: reOrdered,
            defaultOption: isDefaultRemoved ? null : currentContext.defaultOption,
        } as CreateCustomFieldContextDto);
    };

    const renderContextInvariants = () => {
        if (!selectedFieldDefinition) return null;
        let renderContainer = true
        const renderContent = () => {
            switch (selectedFieldDefinition.dataType) {
                case "TEXT":
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
                                        regex: e.target.value,
                                    } as CreateCustomFieldContextDto);
                                }}
                                fullWidth
                            />
                        </>
                    );
                case "NUMBER":
                    return (
                        <>
                            {renderRequiredCheckbox()}
                            {renderDefaultValueField()}
                            <TextField
                                label="Min"
                                value={currentContext?.min || ""}
                                onChange={(e) => {
                                    setCurrentContext({
                                        ...currentContext,
                                        min: Number(e.target.value),
                                    } as CreateCustomFieldContextDto);
                                }}
                                fullWidth
                            />
                            <TextField
                                label="Max"
                                value={currentContext?.max || ""}
                                onChange={(e) => {
                                    setCurrentContext({
                                        ...currentContext,
                                        max: Number(e.target.value),
                                    } as CreateCustomFieldContextDto);
                                }}
                                fullWidth
                            />
                        </>
                    )
                case "OPTION":
                    return (
                        <>
                            {renderRequiredCheckbox()}

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Autocomplete
                                    freeSolo
                                    options={options.map((o) => o.value)}
                                    inputValue={optionInput}
                                    onInputChange={(_, newInput) => setOptionInput(newInput)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="New option"
                                            placeholder="Type option and press Add"
                                            fullWidth
                                        />
                                    )}
                                    sx={{flex: 1}}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddOption}
                                >
                                    Add
                                </Button>
                            </Stack>

                            <Stack spacing={1} sx={{mt: 2}}>
                                {(currentContext?.options || []).map((opt, index, arr) => (
                                    <Stack
                                        key={opt.id}
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <TextField
                                            value={opt.value}
                                            size="small"
                                            fullWidth
                                            disabled
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleMoveOption(index, "up")}
                                            disabled={index === 0}
                                        >
                                            <ArrowUpwardIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleMoveOption(index, "down")}
                                            disabled={index === arr.length - 1}
                                        >
                                            <ArrowDownwardIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveOption(opt.id)}
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>

                            <Autocomplete
                                sx={{mt: 2}}
                                options={currentContext?.options || []}
                                getOptionLabel={(option) => option.value}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={currentContext?.defaultOption || null}
                                onChange={(_, v) => {
                                    setCurrentContext({
                                        ...currentContext!,
                                        defaultOption: v as CustomFieldOption | null,
                                    } as CreateCustomFieldContextDto);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Default option"
                                        fullWidth
                                    />
                                )}
                            />
                        </>
                    );
                case "MULTI_OPTION":
                    return (
                        <>
                            {renderRequiredCheckbox()}

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Autocomplete
                                    freeSolo
                                    options={options.map((o) => o.value)}
                                    inputValue={optionInput}
                                    onInputChange={(_, newInput) => setOptionInput(newInput)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="New option"
                                            placeholder="Type option and press Add"
                                            fullWidth
                                        />
                                    )}
                                    sx={{flex: 1}}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddOption}
                                >
                                    Add
                                </Button>
                            </Stack>

                            <Stack spacing={1} sx={{mt: 2}}>
                                {(currentContext?.options || []).map((opt, index, arr) => (
                                    <Stack
                                        key={opt.id}
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <TextField
                                            value={opt.value}
                                            size="small"
                                            fullWidth
                                            disabled
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleMoveOption(index, "up")}
                                            disabled={index === 0}
                                        >
                                            <ArrowUpwardIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleMoveOption(index, "down")}
                                            disabled={index === arr.length - 1}
                                        >
                                            <ArrowDownwardIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveOption(opt.id)}
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>

                            <Autocomplete
                                sx={{mt: 2}}
                                options={currentContext?.options || []}
                                getOptionLabel={(option) => option.value}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={currentContext?.defaultOption || null}
                                onChange={(_, v) => {
                                    setCurrentContext({
                                        ...currentContext!,
                                        defaultOption: v as CustomFieldOption | null,
                                    } as CreateCustomFieldContextDto);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Default option"
                                        fullWidth
                                    />
                                )}
                            />
                        </>
                    );
                default: {
                    renderContainer = false
                    return null;
                }
            }
        }
        return renderContainer ? <Stack sx={{gap: 3, width: "400px", py: 2}}>{renderContent()}</Stack> : null;
    };

    useEffect(() => {
        api.get<CustomFieldOption[]>("field-option").then((res) => {
            setOptions(res.data);
        });
        api.get<CustomFieldDefWithContexts[]>("/field-definition/with-contexts").then((res) => {

            const assignedFieldDefIds = res.data
                .filter((fd) =>
                    fd.contexts.some(
                        (ctx) =>
                            ctx.project.id === projectId &&
                            ctx.issueType.id === issueTypeId
                    )
                )
                .map((fd) => fd.id);

            const unassignedFieldDefs = res.data.filter(
                (fd) => !assignedFieldDefIds.includes(fd.id)
            );

            setFieldDefinitions(unassignedFieldDefs);
        });
        // reset state when issueTypeId or projectId changes
        setSelectedFieldDefinition(null);
        setCurrentContext({
            required: false,
        });
    }, [issueTypeId, projectId]);

    const handleSave = () => {
        if (selectedFieldDefinition) {
            api.post("field-context", {
                ...currentContext,
                issueTypeId,
                projectId,
                fieldDefId: selectedFieldDefinition.id,
            }).then(() => {
                onSave();
                closeDialog();
            });
        }
    };

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
                                setSelectedFieldDefinition(v);
                                setCurrentContext({
                                    ...currentContext!,
                                    required: false,
                                    defaultValue: undefined,
                                    regex: undefined,
                                    min: undefined,
                                    max: undefined,
                                    defaultOption: undefined,
                                    options: [],
                                } as CreateCustomFieldContextDto);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Custom Field Definition"
                                fullWidth
                            />
                        )}
                    />
                </Stack>
                {renderContextInvariants()}
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between", px: 3, pb: 2}}>
                <Button variant="outlined" onClick={closeDialog}>Close</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};