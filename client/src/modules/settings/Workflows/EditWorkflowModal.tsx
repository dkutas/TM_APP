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
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    type Connection,
    ConnectionMode,
    Controls,
    type Edge,
    MarkerType,
    type Node,
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

// ===== Node data =====

type StatusNodeData = {
    label: string;
    statusId: string;
    category?: string;
    isTerminal: boolean;
};

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

    const [nodes, setNodes] = useState<Node<StatusNodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const statusesToNodes: (items: WorkflowStatusDTO[], selectedId: string | null) => Node<StatusNodeData>[] = useCallback(
        (items: WorkflowStatusDTO[], selectedId: string | null): Node<StatusNodeData>[] =>
            items.map((s, index) => ({
                id: s.id,
                position: s.position ?? defaultPositionForIndex(index),
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
                    backgroundColor: s.isTerminal ? "#e8f5e9" : "#eceff1",
                    minWidth: 140,
                    fontSize: 13,
                },
            })),
        []
    );

    useEffect(() => {
        setNodes(statusesToNodes(statuses, selectedStatusId));
    }, [statuses, selectedStatusId, statusesToNodes]);

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
                markerEnd: {type: MarkerType.ArrowClosed},
                labelBgPadding: [4, 2],
                labelBgBorderRadius: 4,
            })),
        []
    );


    useEffect(() => {
        if (!workflowId) return;

        api.get<Workflow>(`workflow/${workflowId}`).then((r) => {
            const wf = r.data;

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
            setNodes(statusesToNodes(addDefaultPositions(loadedStatuses), null));

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
    }, [statusesToNodes, transitionsToEdges, workflowId]);


    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
        },
        [],
    );


    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );

    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge({...params, type: "step"}, edgesSnapshot)),
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

    // ===== Új tranzíció connect-ből =====

    const handleConnect = (connection: Connection) => {
        if (!connection.source || !connection.target) return;

        // duplikált átmenet kiszűrése ugyanazon from-to párossal
        const alreadyExists = transitions.some(
            (t) => t.fromStatusId === connection.source && t.toStatusId === connection.target
        );
        if (alreadyExists) {
            return;
        }

        const newTransition: WorkflowTransitionDTO = {
            id: createId(),
            fromStatusId: connection.source,
            toStatusId: connection.target,
            name: "Új átmenet",
            guard: "",
        };
        setTransitions((prev) => [...prev, newTransition]);
        setSelectedTransitionId(newTransition.id);
        setSelectedStatusId(null);
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
                    // variant="outlined"
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
                        onNodeClick={(_, v) => setSelectedStatusId(v.id)}
                        onEdgeClick={(_, v) => setSelectedTransitionId(v.id)}
                        onPaneClick={() => {
                            setSelectedStatusId(null);
                            setSelectedTransitionId(null);
                        }}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
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