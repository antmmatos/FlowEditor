import FlowSettingsPanel from './FlowSettingsPanel';
import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import type { DetailsPanelProps } from '../types';

function EmptyState() {
  return (
    <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col items-center py-8 gap-3">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/10">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M14 9h3" />
        <path d="M14 13h3" />
        <path d="M14 17h1" />
      </svg>
      <p className="m-0 text-[0.7rem] text-white/20 text-center leading-relaxed max-w-[180px]">
        Select a node or edge to edit its properties
      </p>
    </div>
  );
}

export default function DetailsPanel({ selectedNodeIds, selectedEdgeIds }: DetailsPanelProps) {
  const hasNode = selectedNodeIds?.length === 1;
  const hasEdge = selectedEdgeIds?.length === 1;

  return (
    <aside className="flow-details-panel shrink-0 w-[272px] bg-[#0a0a0a]/95 backdrop-blur-sm border-l border-white/[0.06] overflow-y-auto flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.04] flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <h2 className="m-0 text-[0.775rem] font-semibold text-white/70 tracking-tight">Properties</h2>
      </div>

      <div className="flex-1 px-4 py-3.5 flex flex-col">
        <FlowSettingsPanel />

        {hasNode && selectedNodeIds && <NodeDetailsPanel selectedNodeIds={selectedNodeIds} />}
        {hasEdge && selectedEdgeIds && <EdgeDetailsPanel selectedEdgeIds={selectedEdgeIds} />}

        {!hasNode && !hasEdge && <EmptyState />}
      </div>
    </aside>
  );
}
