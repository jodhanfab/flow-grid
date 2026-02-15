import { getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';
import type { ConnectionLineComponentProps } from '@xyflow/react';

export function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionLineType,
  connectionStatus,
}: ConnectionLineComponentProps) {
  const pathParams = {
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  };

  let path = '';
  switch (connectionLineType) {
    case ConnectionLineType.SmoothStep:
      [path] = getSmoothStepPath(pathParams);
      break;
    case ConnectionLineType.Step:
      [path] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
      break;
    case ConnectionLineType.Straight:
      [path] = getStraightPath(pathParams);
      break;
    case ConnectionLineType.Bezier:
    case ConnectionLineType.SimpleBezier:
    default:
      [path] = getBezierPath(pathParams);
  }

  const strokeColor =
    connectionStatus === 'invalid'
      ? 'var(--color-danger)'
      : connectionStatus === 'valid'
        ? 'var(--color-success)'
        : 'var(--accent)';
  const strokeWidth = 2.5;
  const glowWidth = 12;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth + glowWidth}
        strokeOpacity={0.2}
        className="react-flow__connection-path"
      />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="react-flow__connection-path"
        style={{ filter: 'drop-shadow(0 0 4px var(--accent))' }}
      />
      <circle
        cx={toX}
        cy={toY}
        r={connectionStatus === 'valid' ? 5 : 4}
        fill={strokeColor}
        className="react-flow__connection-endpoint"
      />
    </g>
  );
}
