import {type FC, useCallback, useEffect, useMemo, useState} from "react";
import "@xyflow/react/dist/style.css";
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    type Connection,
    ConnectionMode,
    Controls,
    type Edge,
    type EdgeChange,
    MarkerType,
    type Node,
    type NodeChange,
    Position,
    ReactFlow
} from "@xyflow/react";
import {useParams} from "react-router-dom";
import {api} from "../../../lib/apiClient.ts";
import type {Workflow} from "../../../lib/types.ts";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomNode from "./CustomNode.tsx";
import SimpleFloatingEdge from "./SimpleFloatingEdge.tsx";

// ===== DTO-k =====

export interface WorkflowStatusDTO {
    id: string;
    key: string;
    name: string;
    isTerminal: boolean;
    category?: string; // TODO / INPROGRESS / DONE / stb.
    position?: { x: number; y: number };
}

export interface WorkflowTransitionDTO {
    id: string;
    fromStatusId: string;
    toStatusId: string;
    name: string;
}

// ===== Helper az ID generáláshoz =====

const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).slice(2, 11)}`;
};

const getColorForCategory = (category: string | undefined) => {
    switch (category) {
        case "DONE":
            return "#4caf50";
        case "INPROGRESS":
            return "#2196f3";
        case "TODO":
            return "#9e9e9e";
        default:
            return "#9e9e9e";
    }
}

// ===== Helper a default pozíciókhoz =====

const defaultPositionForIndex = (index: number) => {
    // Stair-step layout: each next node is shifted right and down to form a diagonal "lépcsőzetes" layout
    const stepX = 180 + index * 220;
    const stepY = 80 + index * 120;
    return {
        x: stepX,
        y: stepY,
    };
};

const addDefaultPositions = (statuses: WorkflowStatusDTO[]): WorkflowStatusDTO[] =>
    statuses.map((s, index) =>
        s.position
            ? s
            : {
                ...s,
                position: defaultPositionForIndex(index),
            }
    );

const buildNodesFromStatuses = (
    statuses: WorkflowStatusDTO[],
    existingNodes: Node[],
    selectedId: string | null,
): Node[] =>
    statuses.map((s, index) => {
        const existing = existingNodes.find((n) => n.id === s.id);
        const position = existing?.position ?? s.position ?? defaultPositionForIndex(index);

        return {
            id: s.id,
            position,
            data: {
                label: s.name || s.key,
                statusId: s.id,
                category: s.category,
                isTerminal: s.isTerminal,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            type: "custom",
            style: {
                padding: 8,
                borderRadius: 8,
                border: `2px solid ${s.id === selectedId ? "#1976d2" : "#90a4ae"}`,
                backgroundColor: getColorForCategory(s.category),
                minWidth: 140,
                fontSize: 13,
            },
        };
    });

// ===== Props =====

export interface WorkflowEditorProps {
    initialStatuses?: WorkflowStatusDTO[];
    initialTransitions?: WorkflowTransitionDTO[];
    height?: number | string;
    onChange?: (data: {
        statuses: WorkflowStatusDTO[];
        transitions: WorkflowTransitionDTO[];
    }) => void;
}

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    "floating": SimpleFloatingEdge,
};

const fitViewOptions = {padding: 4};

// ===== Fő komponens =====

const EditWorkflowModal: FC<WorkflowEditorProps> = ({

                                                        height = "80vh",
                                                    }) => {

    const {workflowId, view} = useParams();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [statuses, setStatuses] = useState<WorkflowStatusDTO[]>([]);
    const [transitions, setTransitions] = useState<WorkflowTransitionDTO[]>([]);

    const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
    const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(
        null
    );

    const updateStatus = useCallback((id: string, patch: Partial<WorkflowStatusDTO>) => {
        setStatuses((prev) => prev.map((s) => (s.id === id ? {...s, ...patch} : s)));
    }, []);

    const updateTransition = (id: string, patch: Partial<WorkflowTransitionDTO>) => {
        setTransitions((prev) => prev.map((t) => (t.id === id ? {...t, ...patch} : t)));
    };

    const deleteStatus = (id: string) => {
        setStatuses((prev) => prev.filter((s) => s.id !== id));
        setTransitions((prev) =>
            prev.filter((t) => t.fromStatusId !== id && t.toStatusId !== id)
        );
        setSelectedStatusId(null);
    };

    const deleteTransition = (id: string) => {
        setTransitions((prev) => prev.filter((t) => t.id !== id));
        setSelectedTransitionId(null);
    };


    const selectedStatus = useMemo(
        () => (selectedStatusId ? statuses.find((s) => s.id === selectedStatusId) ?? null : null),
        [statuses, selectedStatusId]
    );

    const selectedTransition = useMemo(
        () =>
            selectedTransitionId
                ? transitions.find((t) => t.id === selectedTransitionId) ?? null
                : null,
        [transitions, selectedTransitionId]
    );


    const [edges, setEdges] = useState<Edge[]>([]);
    const [nodes, setNodes] = useState<Node[]>([]);

    const getStatusById = useCallback(
        (id: string | null | undefined) =>
            id ? statuses.find((s) => s.id === id) ?? null : null,
        [statuses]
    );


    const transitionsToEdges: (items: WorkflowTransitionDTO[]) => Edge[] = useCallback(
        (items) => {
            // Gruppoljuk a tranzíciókat node-párok szerint (iránytól függetlenül)
            const groups = items.reduce<Record<string, WorkflowTransitionDTO[]>>((acc, t) => {
                const key = [t.fromStatusId, t.toStatusId].sort().join('__');
                if (!acc[key]) acc[key] = [];
                acc[key].push(t);
                return acc;
            }, {});

            const baseOffset = 40; // px – ennyire távolodjanak egymástól a párhuzamos élek

            return items.map((t) => {
                const key = [t.fromStatusId, t.toStatusId].sort().join('__');
                const group = groups[key] ?? [];
                const index = group.findIndex((g) => g.id === t.id);
                const count = group.length;

                let curveOffset = 0;
                if (count > 1 && index !== -1) {
                    // index: 0..count-1 → ..., -1, 0, 1, ...
                    const middle = (count - 1) / 2;
                    const offsetIndex = index - middle;
                    curveOffset = offsetIndex * baseOffset;
                }

                return {
                    id: t.id,
                    source: t.fromStatusId,
                    target: t.toStatusId,
                    label: t.name,
                    type: 'floating',          // ez a te SimpleFloatingEdge-ed typja
                    data: {curveOffset},     // <-- ezt használja majd a SimpleFloatingEdge
                    markerEnd: {type: MarkerType.ArrowClosed, strokeWidth: 3, color: '#000000'},
                    style: {
                        strokeWidth: 3,
                        stroke: t.id === selectedTransitionId ? "#1976d2" : "#555",
                    },
                };
            });
        },
        [],
    );


    useEffect(() => {
        if (!workflowId) return;

        if (workflowId === "new") {
            setName("New Workflow");
            setStatuses([]);
            setTransitions([]);
            setDescription("This is a new workflow.");
        } else {


            api.get<Workflow>(`workflow/${workflowId}`).then((r) => {
                const wf = r.data;

                // státuszok
                const loadedStatuses: WorkflowStatusDTO[] = (wf.statuses ?? []).map((s, idx) => ({
                    id: s.id,
                    key: s.key,
                    name: s.name,
                    isTerminal: s.isTerminal,
                    category: s.category,
                    position: s.position ?? defaultPositionForIndex(idx),
                }));

                setStatuses(addDefaultPositions(loadedStatuses));

                // tranzíciók (csak ID-kat tárolunk)
                const loadedTransitions: WorkflowTransitionDTO[] = (wf.transitions ?? []).map(
                    (t) => ({
                        id: t.id,
                        name: t.name,
                        fromStatusId: t.fromStatus.id,
                        toStatusId: t.toStatus.id,
                    })
                );
                setTransitions(loadedTransitions);
                setEdges(transitionsToEdges(loadedTransitions));

                setName(wf.name);
                setDescription(wf.description || "");
            })
        }
    }, [workflowId, transitionsToEdges]);

    useEffect(() => {
        setEdges(transitionsToEdges(transitions));
    }, [transitions, transitionsToEdges]);

    useEffect(() => {
        setEdges((prev) =>
            prev.map((e) => ({
                ...e,
                style: {
                    ...(e.style ?? {}),
                    stroke: e.id === selectedTransitionId ? "#1976d2" : "#555",
                    strokeWidth: 3,
                },
            })),
        );
    }, [selectedTransitionId]);

    useEffect(() => {
        setNodes((prevNodes) => buildNodesFromStatuses(statuses, prevNodes, selectedStatusId));
    }, [statuses, selectedStatusId]);


    const onNodesChange = useCallback(
        (changes: NodeChange[]) =>
            setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );


    const handleAddStatus = () => {
        const index = statuses.length;
        const id = createId();
        const position = defaultPositionForIndex(index);
        const keyBase = "STATUS";
        let num = index + 1;
        let keyCandidate = `${keyBase}_${num}`;
        const existingKeys = new Set(statuses.map((s) => s.key));

        while (existingKeys.has(keyCandidate)) {
            num += 1;
            keyCandidate = `${keyBase}_${num}`;
        }

        const newStatus: WorkflowStatusDTO = {
            id,
            key: keyCandidate,
            name: `New Status ${num}`,
            isTerminal: false,
            category: index === 0 ? "TODO" : "INPROGRESS",
            position,
        };
        setStatuses((prev) => [...prev, newStatus]);
        setSelectedStatusId(id);
        setSelectedTransitionId(null);
    };


    const handleConnect = (connection: Connection) => {
        if (!connection.source || !connection.target) return;

        const exists = transitions.some(
            (t) =>
                t.fromStatusId === connection.source &&
                t.toStatusId === connection.target
        );
        if (exists) {
            return;
        }

        const newTransition: WorkflowTransitionDTO = {
            id: createId(),
            fromStatusId: connection.source,
            toStatusId: connection.target,
            name: "New Transition",
        };
        setTransitions((prev) => [...prev, newTransition]);
        setSelectedTransitionId(newTransition.id);
        setSelectedStatusId(null);
    };

    const handleOnDelete = (props: { nodes: Node[], edges: Edge[] }) => {
        const {nodes: deletedNodes, edges: deletedEdges} = props;

        if (deletedNodes.length > 0) {
            const deletedNodeIds = new Set(deletedNodes.map((n) => n.id));
            setStatuses((prev) => prev.filter((s) => !deletedNodeIds.has(s.id)));
            setTransitions((prev) =>
                prev.filter(
                    (t) =>
                        !deletedNodeIds.has(t.fromStatusId) &&
                        !deletedNodeIds.has(t.toStatusId)
                )
            );
            setSelectedStatusId(null);
        }

        if (deletedEdges.length > 0) {
            const deletedEdgeIds = new Set(deletedEdges.map((e) => e.id));
            setTransitions((prev) => prev.filter((t) => !deletedEdgeIds.has(t.id)));
            setSelectedTransitionId(null);
        }
    };

    const handleSave = () => {
        if (workflowId === "new") {
            api.post<Workflow>(`/workflow`, {
                id: workflowId,
                statuses,
                transitions,
                name,
                description
            }).then((r) => {
                console.log("Workflow saved:", r.data);
            });
        } else {
            api.patch<Workflow>(`/workflow/${workflowId}`, {
                id: workflowId,
                statuses,
                transitions,
                name,
                description
            }).then((r) => {
                console.log("Workflow saved:", r.data);
            });
        }
    }


    return (
        <Box sx={{display: "flex", flexDirection: "column", height}}>
            <Box
                sx={{
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <Typography variant="h6">{!view ? "Edit" : "View"} <strong>{name}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">
                        Drag the statuses, draw edges between them, then edit them in the right-hand
                        panel.
                    </Typography>
                </Box>
                {!view ?
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={handleAddStatus}>
                            New Status
                        </Button>
                        <Button variant="contained" color="success" onClick={() => handleSave()}>
                            Save Workflow
                        </Button>
                    </Stack> : null}
            </Box>

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                }}
            >
                <Paper
                    sx={{
                        flex: 1,
                        height: "100%",
                    }}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodesDraggable={!view}
                        nodesConnectable={!view}
                        onNodeClick={(_, v) => {
                            setSelectedTransitionId(null);
                            setSelectedStatusId(v.id)
                        }}
                        onEdgeClick={(_, v) => {
                            setSelectedStatusId(null)
                            setSelectedTransitionId(v.id)
                        }}
                        onPaneClick={() => {
                            setSelectedStatusId(null);
                            setSelectedTransitionId(null);
                        }}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onDragEnd={(props) => {
                            console.log(props)
                        }}
                        onNodeDragStop={(_, node) => updateStatus(node.id, {position: node.position})}
                        onDelete={handleOnDelete}
                        onConnect={handleConnect}
                        fitView
                        fitViewOptions={fitViewOptions}
                        connectionMode={ConnectionMode.Loose}
                    >
                        <Background/>
                        <Controls/>
                    </ReactFlow>
                </Paper>

                {!view ? <Box sx={{width: 340, ml: 2, flexShrink: 0}}>
                    <Paper
                        variant="outlined"
                        sx={{
                            height: "100%",
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Workflow Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{mt: 1}}

                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={2}
                            sx={{mt: 1, mb: 2}}
                        />
                        <Divider sx={{mb: 2}}/>
                        {selectedStatus ? (
                            <>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography variant="subtitle1">Status</Typography>
                                    <IconButton
                                        color="error"
                                        onClick={() => deleteStatus(selectedStatus.id)}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Stack>
                                <TextField
                                    margin="dense"
                                    label="Name"
                                    fullWidth
                                    value={selectedStatus.name}
                                    onChange={(e) =>
                                        updateStatus(selectedStatus.id, {
                                            name: e.target.value,
                                            key: e.target.value.split(" ").join("_").toUpperCase()
                                        })
                                    }
                                />
                                <TextField
                                    margin="dense"
                                    label="Key"
                                    fullWidth
                                    value={selectedStatus.key}
                                    disabled
                                />
                                <FormControl fullWidth sx={{mt: 1}}>
                                    <InputLabel id="data-input-label">Category</InputLabel>
                                    <Select
                                        sx={{
                                            backgroundColor: getColorForCategory(selectedStatus.category),
                                            color: "#fff"
                                        }}
                                        label="Category"
                                        value={selectedStatus.category || ""}
                                        onChange={(e) =>
                                            updateStatus(selectedStatus.id, {
                                                category: e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <MenuItem>
                                            Select category
                                        </MenuItem>
                                        <MenuItem value="TODO">TODO</MenuItem>
                                        <MenuItem value="INPROGRESS">INPROGRESS</MenuItem>
                                        <MenuItem value="DONE">DONE</MenuItem>
                                    </Select>

                                </FormControl>
                                <FormControlLabel
                                    sx={{mt: 1}}
                                    control={
                                        <Switch
                                            checked={selectedStatus.isTerminal}
                                            onChange={(e) =>
                                                updateStatus(selectedStatus.id, {
                                                    isTerminal: e.target.checked,
                                                })
                                            }
                                        />
                                    }
                                    label="Terminal state"
                                />
                                <Box
                                    sx={{mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center"}}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {selectedStatus.id}
                                    </Typography>

                                </Box>
                            </>
                        ) : selectedTransition ? (
                            <>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography variant="subtitle1">Transition</Typography>
                                    <IconButton
                                        color="error"
                                        onClick={() => deleteTransition(selectedTransition.id)}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Stack>
                                <TextField
                                    margin="dense"
                                    label="Name"
                                    fullWidth
                                    value={selectedTransition.name}
                                    onChange={(e) =>
                                        updateTransition(selectedTransition.id, {
                                            name: e.target.value,
                                        })
                                    }
                                />
                                <Divider sx={{my: 2}}/>
                                <Typography variant="subtitle2" gutterBottom>
                                    Source / Destination status
                                </Typography>
                                <TextField
                                    margin="dense"
                                    label="From"
                                    fullWidth
                                    value={getStatusById(selectedTransition.fromStatusId)?.name ?? ""}
                                    slotProps={{input: {readOnly: true}}}
                                />
                                <TextField
                                    margin="dense"
                                    label="To"
                                    fullWidth
                                    value={getStatusById(selectedTransition.toStatusId)?.name ?? ""}
                                    slotProps={{input: {readOnly: true}}}
                                />
                                <Box sx={{mt: 2}}>
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {selectedTransition.id}
                                    </Typography>
                                </Box>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    color: "text.secondary",
                                }}
                            >
                                <Typography variant="subtitle1" gutterBottom>
                                    No selected element
                                </Typography>
                                <Typography variant="body2">
                                    Click on a status, or draw edges in between them to edit
                                    transitions.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box> : null}
            </Box>
        </Box>
    );
};

export default EditWorkflowModal;