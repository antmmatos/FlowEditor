import { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

const POSITION_MAP: Record<string, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

interface NodeData {
  label?: string;
  sourcePosition?: string;
  targetPosition?: string;
  layout?: string;
}

interface EditableLabelProps {
  nodeId: string;
  label?: string;
  defaultLabel: string;
}

function EditableLabel({ nodeId, label, defaultLabel }: EditableLabelProps) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(label ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(label ?? '');
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = () => {
    const trimmed = String(value).trim();
    updateNodeData(nodeId, { label: trimmed });
    setValue(trimmed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="py-1 px-1.5 text-inherit font-inherit text-white/90 bg-white/[0.06] border border-[#3b82f6]/40 rounded outline-none text-center focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/15"
        value={value}
        size={Math.max(4, value.length + 1)}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') {
            setValue(label ?? '');
            setIsEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      className="react-flow__node-label text-center inline-block whitespace-pre min-w-[2rem] min-h-[1.2em]"
      onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
    >
      {value || <span className="text-white/25">{defaultLabel}</span>}
    </div>
  );
}


export function InputNodeCustom({ id, data }: NodeProps) {
  const pos = POSITION_MAP[(data as NodeData)?.sourcePosition ?? 'right'] ?? Position.Right;
  return (
    <div className="react-flow__node-input-wrapper flex items-center justify-center text-center w-full py-1.5 px-2.5 box-border" onDoubleClick={(e) => e.stopPropagation()}>
      <EditableLabel nodeId={id} label={(data as NodeData)?.label} defaultLabel="" />
      <Handle type="source" position={pos} className="handle-input" />
    </div>
  );
}

export function OutputNodeCustom({ id, data }: NodeProps) {
  const pos = POSITION_MAP[(data as NodeData)?.targetPosition ?? 'left'] ?? Position.Left;
  return (
    <div className="react-flow__node-output-wrapper flex items-center justify-center text-center w-full py-1.5 px-2.5 box-border" onDoubleClick={(e) => e.stopPropagation()}>
      <Handle type="target" position={pos} className="handle-output" />
      <EditableLabel nodeId={id} label={(data as NodeData)?.label} defaultLabel="" />
    </div>
  );
}

export function DefaultNodeCustom({ id, data }: NodeProps) {
  const layout = (data as NodeData)?.layout ?? 'horizontal';
  const targetPos = layout === 'vertical' ? Position.Top : Position.Left;
  const sourcePos = layout === 'vertical' ? Position.Bottom : Position.Right;
  const isVertical = layout === 'vertical';
  return (
    <div
      className={`react-flow__node-default-wrapper flex items-center justify-center gap-2 w-full py-1.5 px-2.5 box-border ${isVertical ? 'flex-col' : 'flex-row'}`}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={targetPos} className="handle-default" />
      <EditableLabel nodeId={id} label={(data as NodeData)?.label} defaultLabel="" />
      <Handle type="source" position={sourcePos} className="handle-default" />
    </div>
  );
}

export function GroupNodeBox({ selected }: NodeProps) {
  return (
    <>
      <NodeResizer
        minWidth={160}
        minHeight={100}
        isVisible={selected ?? false}
        lineClassName="flow-group-resizer-line"
        handleClassName="flow-group-resizer-handle"
      />
      <div className="react-flow__group-node w-full h-full min-w-[160px] min-h-[100px] bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl" />
    </>
  );
}
