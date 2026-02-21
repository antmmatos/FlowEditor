import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import type { EdgeDetailsPanelProps } from '../types';

const EDGE_TYPES = [
  { value: 'default', label: 'Bezier' },
  { value: 'straight', label: 'Straight' },
  { value: 'step', label: 'Step' },
  { value: 'smoothstep', label: 'Smooth' },
  { value: 'simplebezier', label: 'Simple' },
];

const selectClass = 'panel-select w-full py-[0.4rem] px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-md text-white/75 text-[0.75rem] cursor-pointer transition-all duration-150 focus:outline-none focus:border-[#3b82f6]/40 focus:ring-[2px] focus:ring-[#3b82f6]/10';
const labelClass = 'block mb-1 text-[0.625rem] font-medium text-white/30 uppercase tracking-widest';
const inputClass = 'w-full py-[0.4rem] px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-md text-white/80 text-[0.8rem] transition-all duration-150 focus:outline-none focus:border-[#3b82f6]/40 focus:ring-[2px] focus:ring-[#3b82f6]/10 placeholder:text-white/15';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="panel-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  );
}

export default function EdgeDetailsPanel({ selectedEdgeIds }: EdgeDetailsPanelProps) {
  const { getEdge, setEdges } = useReactFlow();
  const selectedId = selectedEdgeIds?.length === 1 ? selectedEdgeIds[0] : null;
  const edge = selectedId ? getEdge(selectedId) : null;

  const [label, setLabel] = useState<string>(() => (edge?.data?.label as string | undefined) ?? '');
  const [animated, setAnimated] = useState<boolean>(() => edge?.animated ?? false);
  const [type, setType] = useState<string>(() => edge?.type ?? 'smoothstep');

  useEffect(() => {
    if (edge) {
      setLabel((edge.data?.label as string) ?? '');
      setAnimated(edge.animated ?? false);
      setType(edge.type ?? 'smoothstep');
    } else {
      setLabel('');
      setAnimated(false);
      setType('smoothstep');
    }
  }, [edge?.id, edge?.data?.label, edge?.animated, edge?.type]);

  if (!edge) return null;

  const updateEdge = (updates: Partial<Edge>) => {
    setEdges((eds) => eds.map((e) => (e.id === selectedId ? { ...e, ...updates } : e)));
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLabel(value);
    setEdges((eds) =>
      eds.map((e) => (e.id === selectedId ? { ...e, data: { ...e.data, label: value } } : e))
    );
  };

  return (
    <div className="mt-4 pt-3.5 border-t border-white/[0.04]">
      <div className="flex items-center gap-2 mb-3.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 shrink-0">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">Edge</span>
      </div>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="edge-label" className={labelClass}>Label</label>
          <input id="edge-label" type="text" value={label} onChange={handleLabelChange} placeholder="No text" className={inputClass} />
        </div>

        <div>
          <label htmlFor="edge-type" className={labelClass}>Type</label>
          <select id="edge-type" value={type} onChange={(e) => { setType(e.target.value); updateEdge({ type: e.target.value }); }} className={selectClass}>
            {EDGE_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="panel-row opacity-80">
          <span className="text-[0.775rem] text-white/55 select-none">Animated</span>
          <Toggle checked={animated} onChange={(v) => { setAnimated(v); updateEdge({ animated: v }); }} />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.03] flex items-center gap-1.5 text-[0.6rem] text-white/15">
        <span className="font-mono bg-white/[0.03] px-1.5 py-0.5 rounded truncate max-w-[80px]">{edge.source}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/15">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <span className="font-mono bg-white/[0.03] px-1.5 py-0.5 rounded truncate max-w-[80px]">{edge.target}</span>
      </div>
    </div>
  );
}
