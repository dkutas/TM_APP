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
import type {EditCrudModalProps} from "../../settings/types.ts";
import {useEffect, useState} from "react";
import type {CustomFieldOption, PitCustomFieldContext} from "../../../lib/types.ts";
import {api} from "../../../lib/apiClient.ts";

export const EditCustomFieldContextModal = ({open, id, closeDialog, onSave}: EditCrudModalProps) => {
    const [currentContext, setCurrentContext] = useState<PitCustomFieldContext | null>(null);

    // Globálisan elérhető opciók az adott field-hez (backendről)
    const [options, setOptions] = useState<CustomFieldOption[]>([]);

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
        switch (currentContext.fieldDef?.dataType) {
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

    // ----- OPTION helpers: add / move / remove -----

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
                id: crypto.randomUUID(), // temp ID, backend majd normalizálja
                value: trimmed,
            } as CustomFieldOption);

        const updatedOptions = [...currentOptions, optionToAdd].map((opt, idx) => ({
            ...opt,
            order: idx + 1,
        }));

        setCurrentContext({
            ...currentContext,
            options: updatedOptions,
        });
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
        });
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
        });
    };

    const renderContextInvariants = () => {
        if (!currentContext) return null;
        switch (currentContext.fieldDef?.dataType) {
            case "TEXT":
                return (
                    <>
                        {renderRequiredCheckbox()}
                        {renderDefaultValueField()}
                        <TextField
                            label="Regex"
                            value={currentContext.regex}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, regex: e.target.value});
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
                            value={currentContext.min || ""}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, min: Number(e.target.value)});
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Max"
                            value={currentContext.max || ""}
                            onChange={(e) => {
                                setCurrentContext({...currentContext, max: Number(e.target.value)});
                            }}
                            fullWidth
                        />
                    </>
                );
            case "OPTION":
                return (
                    <>
                        {renderRequiredCheckbox()}

                        {/* Új opció hozzáadása (freeSolo + suggestion a backend options-ből) */}
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

                        {/* Rendezhető lista: currentContext.options sorrendje = order */}
                        <Stack spacing={1} sx={{mt: 2}}>
                            {(currentContext.options || []).map((opt, index, arr) => (
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

                        {/* Default option: mindig a rendezett context options-ből választunk */}
                        <Autocomplete
                            sx={{mt: 2}}
                            options={currentContext.options || []}
                            getOptionLabel={(option) => option.value}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={currentContext.defaultOption || null}
                            onChange={(_, v) => {
                                setCurrentContext({
                                    ...currentContext,
                                    defaultOption: v as CustomFieldOption | null,
                                });
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
                        <Autocomplete
                            options={options}
                            getOptionLabel={(option) => option.value}
                            value={currentContext.defaultOption}
                            onChange={(_, v) => {
                                setCurrentContext({
                                    ...currentContext,
                                    defaultOption: v as CustomFieldOption | null,
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Default Option"
                                    fullWidth
                                />
                            )}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        if (!id) return;
        api
            .get<PitCustomFieldContext>(`field-context/${id}`)
            .then((response) => {
                setCurrentContext(response.data);
                return response.data;
            })
            .then((ctx) => {
                if (ctx.fieldDef.dataType === "OPTION" || ctx.fieldDef.dataType === "MULTI_OPTION") {
                    api.get<CustomFieldOption[]>(`field-context/${ctx.id}/options`).then((response) =>
                        setOptions(response.data)
                    );
                }
            });
    }, [id]);

    const handleSave = () => {
        console.log("Saving context:", currentContext);
        // api.patch(`field-context/${id}`, currentContext).then(() => {
        //   onSave();
        //   closeDialog();
        // });
    };

    return (
        <Dialog open={open}>
            <DialogTitle>Edit {currentContext?.fieldDef.name} field's Invariants</DialogTitle>
            <DialogContent>
                <Stack sx={{gap: 3, width: "400px", py: 2}}>
                    {renderContextInvariants()}
                </Stack>
            </DialogContent>
            <DialogActions sx={{display: "flex", justifyContent: "space-between", px: 3, pb: 2}}>
                <Button variant="outlined" onClick={closeDialog}>
                    Close
                </Button>
                <Button variant="contained" onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};