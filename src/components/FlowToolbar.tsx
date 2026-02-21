import { useCallback, useRef } from 'react';
import { useReactFlow, type Node, type Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';

interface FlowExport {
  nodes: Node[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}

const btnClass = 'py-1.5 px-3.5 bg-transparent text-white/50 border-none rounded-lg text-[0.8125rem] font-medium cursor-pointer transition-all duration-150 hover:bg-white/[0.04] hover:text-white/85 active:bg-white/[0.06]';

export default function FlowToolbar() {
  const { toObject, setNodes, setEdges, setViewport, getNodes, getEdges, deleteElements, fitView } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteSelected = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      deleteElements({ nodes: selectedNodes, edges: selectedEdges });
    }
  }, [getNodes, getEdges, deleteElements]);

  const handleDownloadPng = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;
    toPng(viewport as HTMLElement, {
      style: { transform: 'translate(0, 0) scale(1)' },
      pixelRatio: 2,
    })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `flow-${timestamp()}.png`;
        a.click();
      })
      .catch((err) => {
        console.error('Export PNG failed', err);
        alert('Failed to export PNG.');
      });
  }, []);

  const handleDownloadJson = useCallback(() => {
    const flow = toObject();
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `flow-${timestamp()}.json`);
  }, [toObject]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = JSON.parse((event.target?.result as string) ?? '{}') as FlowExport;
          if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
            alert('Invalid file: must contain "nodes" and "edges" arrays.');
            return;
          }
          setNodes(raw.nodes);
          setEdges(raw.edges);
          if (raw.viewport && typeof raw.viewport === 'object') {
            setViewport(raw.viewport);
          }
        } catch (err) {
          console.error('Import failed', err);
          alert('Invalid JSON file.');
        }
        (e.target as HTMLInputElement).value = '';
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges, setViewport]
  );

  return (
    <header className="shrink-0 flex items-center gap-0 px-5 min-h-[48px] bg-[#0a0a0a] border-b border-white/[0.06]">
      <span className="text-[0.9rem] font-semibold text-white/90 tracking-tight mr-6 select-none">Flow Editor</span>
      <div className="flex items-center gap-0.5 px-2 border-r border-white/[0.04] last:border-r-0 last:pr-0">
        <button type="button" onClick={() => fitView()} title="Fit view" className={btnClass}>
          Fit View
        </button>
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-white/[0.04] last:border-r-0 last:pr-0">
        <button type="button" onClick={handleDeleteSelected} title="Delete selection (Backspace)" className={btnClass}>
          Delete
        </button>
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-white/[0.04] last:border-r-0 last:pr-0">
        <button type="button" onClick={handleDownloadPng} className={btnClass}>PNG</button>
        <button type="button" onClick={handleDownloadJson} className={btnClass}>JSON</button>
        <button type="button" onClick={() => inputRef.current?.click()} className={btnClass}>Import</button>
      </div>
      <input ref={inputRef} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
    </header>
  );
}
