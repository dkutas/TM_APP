import {EdgeLabelRenderer, type EdgeProps, getSmoothStepPath, useInternalNode} from '@xyflow/react';

import {getEdgeParams} from './utils.js';
import {Paper} from "@mui/material";

function SimpleFloatingEdge({id, source, target, markerEnd, style, label, data}: EdgeProps) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const {sx, sy, tx, ty, sourcePos, targetPos} = getEdgeParams(
        sourceNode,
        targetNode,
    );

    const curveOffset =
        typeof (data as any)?.curveOffset === 'number' ? (data as any).curveOffset : 0;

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX: sx,
        sourceY: sy + curveOffset,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty + curveOffset,
    });

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={5}
                markerEnd={markerEnd}
                style={style}
            />
            <EdgeLabelRenderer>
                <Paper sx={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    pointerEvents: 'all',
                    cursor: 'pointer',
                    padding: 0.5,
                }}>
                    {label}
                </Paper>
            </EdgeLabelRenderer>
        </>
    );
}

export default SimpleFloatingEdge;
