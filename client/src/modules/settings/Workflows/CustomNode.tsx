import {memo} from 'react';
import {Handle, type NodeProps, Position} from '@xyflow/react';
import {Typography} from "@mui/material";

const CustomNode = ({data}: NodeProps) => {
    return (
        <div style={{padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Typography>{data.label as string}</Typography>
            <Handle type="source" position={Position.Top} id="a"/>
            <Handle type="source" position={Position.Right} id="b"/>
            <Handle type="source" position={Position.Bottom} id="c"/>
            <Handle type="source" position={Position.Left} id="d"/>
        </div>
    );
};

export default memo(CustomNode);
