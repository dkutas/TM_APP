import {type InternalNode, type Node, Position} from '@xyflow/react';

function getParams(nodeA: InternalNode<Node>, nodeB: InternalNode<Node>) {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    const horizontalDiff = Math.abs(centerA.x - centerB.x);
    const verticalDiff = Math.abs(centerA.y - centerB.y);

    let position;

    if (horizontalDiff > verticalDiff) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const [x, y] = getHandleCoordsByPosition(nodeA, position);
    return [x, y, position];
}

function getHandleCoordsByPosition(node: InternalNode<Node>, handlePosition: Position) {
    const handle = node.internals.handleBounds?.source?.find(
        (h) => h.position === handlePosition,
    );

    let offsetX = (handle?.width || 0) / 2;
    let offsetY = (handle?.height || 0) / 2;

    switch (handlePosition) {
        case Position.Left:
            offsetX = 0;
            break;
        case Position.Right:
            offsetX = (handle?.width || 0);
            break;
        case Position.Top:
            offsetY = 0;
            break;
        case Position.Bottom:
            offsetY = (handle?.height || 0);
            break;
    }

    const x = node.internals.positionAbsolute.x + (handle?.x || 0) + offsetX;
    const y = node.internals.positionAbsolute.y + (handle?.y || 0) + offsetY;

    return [x, y];
}

function getNodeCenter(node: InternalNode<Node>) {
    return {
        x: node.internals.positionAbsolute.x + (node.measured.width || 0) / 2,
        y: node.internals.positionAbsolute.y + (node.measured.height || 0) / 2,
    };
}

export function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
    const [sx, sy, sourcePos] = getParams(source, target);
    const [tx, ty, targetPos] = getParams(target, source);

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
    };
}
