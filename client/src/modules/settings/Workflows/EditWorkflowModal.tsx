import {type FC, useCallback, useEffect, useMemo, useState} from "react";
import "@xyflow/react/dist/style.css";
import {
    Box,
    Button,
    Chip,
    Divider,
    FormControlLabel,
    IconButton,
    Paper,
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
    guard?: string;
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
                                                        initialStatuses,
                                                        initialTransitions,
                                                        height = "70vh",
                                                        onChange,
                                                    }) => {

    const {workflowId} = useParams();
    const [statuses, setStatuses] = useState<WorkflowStatusDTO[]>(() =>
        addDefaultPositions(initialStatuses ?? [])
    );
    const [transitions, setTransitions] = useState<WorkflowTransitionDTO[]>(
        initialTransitions ?? []
    );

    const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
    const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(
        null
    );

    const updateStatus = (id: string, patch: Partial<WorkflowStatusDTO>) => {
        setStatuses((prev) => prev.map((s) => (s.id === id ? {...s, ...patch} : s)));
    };

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
        (items: WorkflowTransitionDTO[]) =>
            items.map((t) => ({
                id: t.id,
                source: t.fromStatusId,
                target: t.toStatusId,
                label: t.name,
                type: "floating",
                markerEnd: {type: MarkerType.ArrowClosed, size: 6,},
                style: {
                    stroke: "#555",
                    strokeWidth: 3,
                },
                labelBgPadding: [4, 2],
                labelBgBorderRadius: 4,
            })),
        []
    );


    useEffect(() => {
        if (!workflowId) return;

        api.get<Workflow>(`workflow/${workflowId}`).then((r) => {
            const wf = {
                "id": "1ce06f38-3d01-4d01-93c2-278e66e044d9",
                "name": "Default Workflow",
                "description": "Alap workflow",
                "isActive": true,
                "statuses": [
                    {
                        "id": "783002f8-e766-4335-8f86-e9b5d433c9bf",
                        "key": "DONE",
                        "name": "Done",
                        "isTerminal": true,
                        "category": "DONE",
                        "position": {
                            "x": 620,
                            "y": 320
                        }
                    },
                    {
                        "id": "88f52c72-fe10-4f69-ba38-0934a1da88e5",
                        "key": "INPROG",
                        "name": "In Progress",
                        "isTerminal": false,
                        "category": "INPROGRESS",
                        "position": {
                            "x": 400,
                            "y": 200
                        }
                    },
                    {
                        "id": "5a19ccea-30c5-4179-b367-b74d96dbba9c",
                        "key": "TODO",
                        "name": "To Do",
                        "isTerminal": false,
                        "category": "TODO",
                        "position": {
                            "x": 100,
                            "y": 80
                        }
                    }
                ],
                "transitions": [
                    {
                        "id": "e8b4047b-7528-4d90-80f8-1830e451b6e2",
                        "fromStatus": {
                            "id": "5a19ccea-30c5-4179-b367-b74d96dbba9c",
                            "key": "TODO",
                            "name": "To Do",
                            "isTerminal": false,
                            "category": "TODO",
                            "position": {
                                "x": 100,
                                "y": 80
                            }
                        },
                        "toStatus": {
                            "id": "88f52c72-fe10-4f69-ba38-0934a1da88e5",
                            "key": "INPROG",
                            "name": "In Progress",
                            "isTerminal": false,
                            "category": "INPROGRESS",
                            "position": {
                                "x": 400,
                                "y": 200
                            }
                        },
                        "name": "Start Progress",
                        "guard": null
                    },
                    {
                        "id": "996f67c6-a72b-496d-8533-d966c1b1e007",
                        "fromStatus": {
                            "id": "783002f8-e766-4335-8f86-e9b5d433c9bf",
                            "key": "DONE",
                            "name": "Done",
                            "isTerminal": true,
                            "category": "DONE",
                            "position": {
                                "x": 620,
                                "y": 320
                            }
                        },
                        "toStatus": {
                            "id": "5a19ccea-30c5-4179-b367-b74d96dbba9c",
                            "key": "TODO",
                            "name": "To Do",
                            "isTerminal": false,
                            "category": "TODO",
                            "position": {
                                "x": 100,
                                "y": 80
                            }
                        },
                        "name": "Back to backlog",
                        "guard": null
                    },
                    {
                        "id": "f90d4dd5-a261-44e3-bbe5-024b8565f71b",
                        "fromStatus": {
                            "id": "88f52c72-fe10-4f69-ba38-0934a1da88e5",
                            "key": "INPROG",
                            "name": "In Progress",
                            "isTerminal": false,
                            "category": "INPROGRESS",
                            "position": {
                                "x": 400,
                                "y": 200
                            }
                        },
                        "toStatus": {
                            "id": "5a19ccea-30c5-4179-b367-b74d96dbba9c",
                            "key": "TODO",
                            "name": "To Do",
                            "isTerminal": false,
                            "category": "TODO",
                            "position": {
                                "x": 100,
                                "y": 80
                            }
                        },
                        "name": "Reopen",
                        "guard": null
                    },
                    {
                        "id": "37d1bc01-77ab-46d2-b045-2beff5134cb0",
                        "fromStatus": {
                            "id": "88f52c72-fe10-4f69-ba38-0934a1da88e5",
                            "key": "INPROG",
                            "name": "In Progress",
                            "isTerminal": false,
                            "category": "INPROGRESS",
                            "position": {
                                "x": 400,
                                "y": 200
                            }
                        },
                        "toStatus": {
                            "id": "783002f8-e766-4335-8f86-e9b5d433c9bf",
                            "key": "DONE",
                            "name": "Done",
                            "isTerminal": true,
                            "category": "DONE",
                            "position": {
                                "x": 620,
                                "y": 320
                            }
                        },
                        "name": "Resolve",
                        "guard": null
                    }
                ]
            }

            // státuszok
            const loadedStatuses: WorkflowStatusDTO[] = (wf.statuses ?? []).map((s, idx) => ({
                id: s.id,
                key: s.key,
                name: s.name,
                isTerminal: s.isTerminal,
                category: (s).category,
                position: (s as any).position ?? defaultPositionForIndex(idx),
            }));

            setStatuses(addDefaultPositions(loadedStatuses));

            // tranzíciók (csak ID-kat tárolunk)
            const loadedTransitions: WorkflowTransitionDTO[] = (wf.transitions ?? []).map(
                (t) => ({
                    id: t.id,
                    name: t.name,
                    fromStatusId: t.fromStatus.id,
                    toStatusId: t.toStatus.id,
                    guard: (t as any).guard,
                })
            );
            setTransitions(loadedTransitions);
            setEdges(transitionsToEdges(loadedTransitions));
        })
    }, [workflowId]);

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
        [],
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
            name: `Új státusz ${num}`,
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
        console.log(connection)

        const newTransition: WorkflowTransitionDTO = {
            id: createId(),
            fromStatusId: connection.source,
            toStatusId: connection.target,
            name: "Új átmenet",
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


    return (
        <Box sx={{display: "flex", flexDirection: "column", height}}>
            {/* Felső toolbar */}
            <Box
                sx={{
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <Typography variant="h6">Workflow editor</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Húzd a státuszokat, rajzolj éleket köztük, majd szerkeszd a jobb oldali
                        panelen.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleAddStatus}>
                        Új státusz
                    </Button>
                </Stack>
            </Box>

            {/* Fő tartalom */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                }}
            >
                {/* Bal: graf */}
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

                {/* Jobb: details panel */}
                <Box sx={{width: 360, ml: 2, flexShrink: 0}}>
                    <Paper
                        variant="outlined"
                        sx={{
                            height: "100%",
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {selectedStatus ? (
                            <>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography variant="subtitle1">Státusz</Typography>
                                    <Chip
                                        label={selectedStatus.category || "N/A"}
                                        size="small"
                                        color={
                                            selectedStatus.category === "DONE"
                                                ? "success"
                                                : selectedStatus.category === "INPROGRESS"
                                                    ? "warning"
                                                    : "default"
                                        }
                                    />
                                </Stack>
                                <TextField
                                    margin="dense"
                                    label="Név"
                                    fullWidth
                                    value={selectedStatus.name}
                                    onChange={(e) =>
                                        updateStatus(selectedStatus.id, {name: e.target.value})
                                    }
                                />
                                <TextField
                                    margin="dense"
                                    label="Kulcs"
                                    fullWidth
                                    value={selectedStatus.key}
                                    onChange={(e) =>
                                        updateStatus(selectedStatus.id, {key: e.target.value})
                                    }
                                />
                                <TextField
                                    margin="dense"
                                    label="Kategória (TODO / INPROGRESS / DONE / ...)"
                                    fullWidth
                                    value={selectedStatus.category ?? ""}
                                    onChange={(e) =>
                                        updateStatus(selectedStatus.id, {category: e.target.value})
                                    }
                                />
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
                                    label="Terminális státusz"
                                />
                                <Box
                                    sx={{mt: 2, display: "flex", justifyContent: "space-between"}}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {selectedStatus.id}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => deleteStatus(selectedStatus.id)}
                                    >
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
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
                                    <Typography variant="subtitle1">Átmenet</Typography>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => deleteTransition(selectedTransition.id)}
                                    >
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </Stack>
                                <TextField
                                    margin="dense"
                                    label="Név"
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
                                    Forrás / Cél státusz
                                </Typography>
                                <TextField
                                    margin="dense"
                                    label="From"
                                    fullWidth
                                    value={getStatusById(selectedTransition.fromStatusId)?.name ?? ""}
                                    InputProps={{readOnly: true}}
                                />
                                <TextField
                                    margin="dense"
                                    label="To"
                                    fullWidth
                                    value={getStatusById(selectedTransition.toStatusId)?.name ?? ""}
                                    InputProps={{readOnly: true}}
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
                                    Nincs kiválasztott elem
                                </Typography>
                                <Typography variant="body2">
                                    Kattints egy státuszra vagy átmenetre a grafon, vagy hozz létre egy új
                                    státuszt.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default EditWorkflowModal;