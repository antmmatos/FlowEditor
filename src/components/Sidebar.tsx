const NODE_TYPES = [
  { type: 'input', label: 'Input', description: 'One output' },
  { type: 'default', label: 'Default', description: 'Input and output' },
  { type: 'output', label: 'Output', description: 'One input' },
  { type: 'group', label: 'Group', description: 'Container' },
] as const;

const dotColors: Record<string, string> = {
  input: '#10b981',
  default: '#fbbf24',
  output: '#ef4444',
  group: '#38bdf8',
};

export default function Sidebar() {
  return (
    <aside className="shrink-0 w-52 bg-[#0a0a0a]/95 backdrop-blur-sm border-r border-white/[0.06] overflow-y-auto flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.04] flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        <h2 className="m-0 text-[0.775rem] font-semibold text-white/70 tracking-tight">Nodes</h2>
      </div>

      <div className="flex-1 p-3">
        <p className="m-0 mb-2.5 text-[0.6rem] text-white/20 uppercase tracking-widest font-medium px-1">Drag to canvas</p>
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {NODE_TYPES.map(({ type, label, description }) => (
            <li key={type} className="m-0">
              <div
                className="group flex items-center gap-2.5 py-2 px-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150 hover:bg-white/[0.05] hover:border-white/[0.1] active:scale-[0.98]"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', type);
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <span
                  className="w-[7px] h-[7px] rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125"
                  style={{ backgroundColor: dotColors[type] }}
                  aria-hidden
                />
                <div className="flex flex-col min-w-0 gap-px">
                  <span className="font-medium text-[0.775rem] text-white/80 leading-tight">{label}</span>
                  <span className="text-[0.6rem] text-white/20 leading-tight">{description}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-white/0 group-hover:text-white/20 transition-colors shrink-0">
                  <circle cx="9" cy="5" r="1" />
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="15" cy="5" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="15" cy="19" r="1" />
                </svg>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
