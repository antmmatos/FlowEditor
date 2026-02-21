import { useState, useEffect } from 'react';
import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import type { NodeDetailsPanelProps } from '../types';

const HANDLE_POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
];

const LAYOUT_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const NODE_META: Record<string, { label: string; color: string }> = {
  input: { label: 'Input', color: '#10b981' },
  default: { label: 'Default', color: '#fbbf24' },
  output: { label: 'Output', color: '#ef4444' },
  group: { label: 'Group', color: '#38bdf8' },
};

const selectClass = 'panel-select w-full py-[0.4rem] px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-md text-white/75 text-[0.75rem] cursor-pointer transition-all duration-150 focus:outline-none focus:border-[#3b82f6]/40 focus:ring-[2px] focus:ring-[#3b82f6]/10';
const labelClass = 'block mb-1 text-[0.625rem] font-medium text-white/30 uppercase tracking-widest';
const inputClass = 'w-full py-[0.4rem] px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-md text-white/80 text-[0.8rem] transition-all duration-150 focus:outline-none focus:border-[#3b82f6]/40 focus:ring-[2px] focus:ring-[#3b82f6]/10 placeholder:text-white/15';

export default function NodeDetailsPanel({ selectedNodeIds }: NodeDetailsPanelProps) {
  const { getNode, updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const selectedId = selectedNodeIds?.length === 1 ? selectedNodeIds[0] : null;
  const node = selectedId ? getNode(selectedId) : null;

  const [label, setLabel] = useState<string>(() => (node?.data?.label as string | undefined) ?? '');

  useEffect(() => {
    if (node) setLabel((node.data?.label as string) ?? '');
    else setLabel('');
  }, [node?.id, node?.data?.label]);

  if (!node || !selectedId) return null;

  const nodeId = selectedId;
  const meta = NODE_META[node.type ?? 'default'] ?? NODE_META.default;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLabel(value);
    updateNodeData(nodeId, { label: value });
  };

  const handleSourcePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(nodeId, { sourcePosition: e.target.value });
    updateNodeInternals(nodeId);
  };

  const handleTargetPositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(nodeId, { targetPosition: e.target.value });
    updateNodeInternals(nodeId);
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(nodeId, { layout: e.target.value });
    updateNodeInternals(nodeId);
  };

  const data = node.data as Record<string, unknown> | undefined;

  return (
    <div className="mt-4 pt-3.5 border-t border-white/[0.04]">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/30 flex-1">Node</span>
        <span className="text-[0.6rem] font-medium tracking-wide px-1.5 py-px rounded-sm" style={{ backgroundColor: meta.color + '18', color: meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="node-label" className={labelClass}>Label</label>
          <input id="node-label" type="text" value={label} onChange={handleLabelChange} placeholder="Unnamed" className={inputClass} />
        </div>

        {node.type === 'input' && (
          <div>
            <label htmlFor="node-source-pos" className={labelClass}>Output handle</label>
            <select id="node-source-pos" value={(data?.sourcePosition as string) ?? 'right'} onChange={handleSourcePositionChange} className={selectClass}>
              {HANDLE_POSITIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {node.type === 'output' && (
          <div>
            <label htmlFor="node-target-pos" className={labelClass}>Input handle</label>
            <select id="node-target-pos" value={(data?.targetPosition as string) ?? 'left'} onChange={handleTargetPositionChange} className={selectClass}>
              {HANDLE_POSITIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {node.type === 'default' && (
          <div>
            <label htmlFor="node-layout" className={labelClass}>Layout</label>
            <div className="segmented-control">
              {LAYOUT_OPTIONS.map(({ value, label }) => (
                <label key={value}>
                  <input type="radio" name="node-layout" checked={(data?.layout as string ?? 'horizontal') === value} onChange={() => handleLayoutChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.03] flex items-center gap-1.5">
        <span className="text-[0.6rem] text-white/15 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded">{node.id}</span>
      </div>
    </div>
  );
}
