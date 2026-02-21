import { useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Background,
  MiniMap,
  useOnSelectionChange,
  reconnectEdge,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  SelectionMode,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type OnReconnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowSettingsProvider, useFlowSettings } from './contexts/FlowSettingsContext';
import FlowToolbar from './components/FlowToolbar';
import Sidebar from './components/Sidebar';
import DetailsPanel from './components/DetailsPanel';
import ContextMenu from './components/ContextMenu';
import { GroupNodeBox, InputNodeCustom, OutputNodeCustom, DefaultNodeCustom } from './nodes';
import type { ContextMenuState } from './types';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let nodeId = 0;
function getId(): string {
  return `node_${++nodeId}`;
}

const NODE_APPROX: Record<string, { w: number; h: number }> = {
  default: { w: 100, h: 32 },
  input: { w: 80, h: 28 },
  output: { w: 80, h: 28 },
};

function findGroupAtPosition(nodes: Node[], flowX: number, flowY: number): Node | null {
  let found: Node | null = null;
  for (const n of nodes) {
    if (n.type !== 'group') continue;
    const w = (n.style?.width as number | undefined) ?? 220;
    const h = (n.style?.height as number | undefined) ?? 140;
    if (flowX >= n.position.x && flowX <= n.position.x + w && flowY >= n.position.y && flowY <= n.position.y + h) {
      found = n;
    }
  }
  return found;
}

function clampPositionInsideGroup(
  relPos: { x: number; y: number },
  nodeType: string,
  groupWidth: number,
  groupHeight: number
): { x: number; y: number } {
  const dim = NODE_APPROX[nodeType];
  if (!dim) return relPos;
  const x = Math.max(0, Math.min(relPos.x, groupWidth - dim.w));
  const y = Math.max(0, Math.min(relPos.y, groupHeight - dim.h));
  return { x, y };
}

function insertNodeAfterParent(nds: Node[], newNode: Node): Node[] {
  if (!newNode.parentId) return nds.concat(newNode);
  const idx = nds.findIndex((n) => n.id === newNode.parentId);
  if (idx === -1) return nds.concat(newNode);
  return [...nds.slice(0, idx + 1), newNode, ...nds.slice(idx + 1)];
}

function sortParentsBeforeChildren(nodes: Node[]): Node[] {
  const result: Node[] = [];
  const added = new Set<string>();
  const add = (n: Node) => {
    if (added.has(n.id)) return;
    if (n.parentId && !added.has(n.parentId)) {
      const parent = nodes.find((x) => x.id === n.parentId);
      if (parent) add(parent);
    }
    result.push(n);
    added.add(n.id);
  };
  nodes.forEach((n) => add(n));
  return result;
}

function FlowEditor() {
  const { settings } = useFlowSettings();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const { screenToFlowPosition, fitView } = useReactFlow();

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes, edges: selectedEdges }) => {
      setSelectedNodeIds(selectedNodes.map((n) => n.id));
      setSelectedEdgeIds(selectedEdges.map((e) => e.id));
    },
  });

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const onReconnect: OnReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setNodes((nds) => {
        const parentGroup = findGroupAtPosition(nds, flowPosition.x, flowPosition.y);
        const isGroup = type === 'group';

        let position = flowPosition;
        if (parentGroup && !isGroup) {
          const relPos = {
            x: flowPosition.x - parentGroup.position.x,
            y: flowPosition.y - parentGroup.position.y,
          };
          const groupW = (parentGroup.style?.width as number | undefined) ?? 220;
          const groupH = (parentGroup.style?.height as number | undefined) ?? 140;
          position = clampPositionInsideGroup(relPos, type, groupW, groupH);
        }

        const data =
          type === 'input'
            ? { label: '', sourcePosition: 'right' }
            : type === 'output'
              ? { label: '', targetPosition: 'left' }
              : type === 'default'
                ? { label: '', layout: 'horizontal' }
                : { label: '' };

        const newNode: Node = {
          id: getId(),
          type,
          position,
          data,
          ...(isGroup && {
            style: { width: 220, height: 140 },
            className: 'react-flow__group-node-wrapper',
          }),
          ...(parentGroup && !isGroup && {
            parentId: parentGroup.id,
          }),
        };
        return insertNodeAfterParent(nds, newNode);
      });
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_e: React.MouseEvent<Element>, draggedNode: Node) => {
      setNodes((nds: Node[]) => {
        const node = nds.find((n) => n.id === draggedNode.id) ?? draggedNode;
        const parent = node.parentId ? nds.find((n) => n.id === node.parentId) : null;
        const absolutePos = parent
          ? { x: parent.position.x + draggedNode.position.x, y: parent.position.y + draggedNode.position.y }
          : draggedNode.position;

        const groupAt = findGroupAtPosition(nds, absolutePos.x, absolutePos.y);

        if (groupAt && groupAt.id !== node.parentId && groupAt.id !== node.id) {
          const relPos = {
            x: absolutePos.x - groupAt.position.x,
            y: absolutePos.y - groupAt.position.y,
          };
          const groupW = (groupAt.style?.width as number | undefined) ?? 220;
          const groupH = (groupAt.style?.height as number | undefined) ?? 140;
          const clampedPos = clampPositionInsideGroup(relPos, node.type ?? 'default', groupW, groupH);
          const updated = nds.map((n) =>
            n.id === node.id
              ? { ...n, parentId: groupAt.id, position: clampedPos }
              : n
          );
          return sortParentsBeforeChildren(updated);
        }
        if (!groupAt && node.parentId) {
          return nds.map((n) =>
            n.id === node.id ? { ...n, parentId: undefined, extent: undefined, position: absolutePos } : n
          );
        }
        return nds;
      });
    },
    [setNodes]
  );

  const onNodeContextMenu = useCallback((_e: React.MouseEvent, node: Node) => {
    _e.preventDefault();
    setContextMenu({ x: _e.clientX, y: _e.clientY, type: 'node', nodeId: node.id });
  }, []);

  const onEdgeContextMenu = useCallback((_e: React.MouseEvent, edge: Edge) => {
    _e.preventDefault();
    setContextMenu({ x: _e.clientX, y: _e.clientY, type: 'edge', edgeId: edge.id });
  }, []);

  const handleContextMenuAction = useCallback(
    (action: 'node' | 'edge', id: string) => {
      if (action === 'node') {
        setNodes((nds) => nds.filter((n) => n.id !== id));
      }
      if (action === 'edge') {
        setEdges((eds) => eds.filter((e) => e.id !== id));
      }
      setContextMenu(null);
    },
    [setNodes, setEdges]
  );

  const handleDuplicateNode = useCallback(
    (nodeIdToDup: string) => {
      const node = nodes.find((n) => n.id === nodeIdToDup);
      if (!node) return;
      const offset = { x: 30, y: 30 };
      const newNode: Node = {
        ...node,
        id: getId(),
        position: { x: node.position.x + offset.x, y: node.position.y + offset.y },
        selected: false,
      };
      delete (newNode as Record<string, unknown>).width;
      delete (newNode as Record<string, unknown>).height;
      setNodes((nds) => insertNodeAfterParent(nds, newNode));
      setContextMenu(null);
    },
    [nodes, setNodes]
  );

  const defaultEdgeOptions = { type: settings.defaultEdgeType };
  const nodeTypes = {
    input: InputNodeCustom,
    output: OutputNodeCustom,
    default: DefaultNodeCustom,
    group: GroupNodeBox,
  };

  const backgroundVariant =
    settings.backgroundVariant === 'lines'
      ? BackgroundVariant.Lines
      : settings.backgroundVariant === 'cross'
        ? BackgroundVariant.Cross
        : BackgroundVariant.Dots;

  const connectionLineTypeMap: Record<string, ConnectionLineType> = {
    default: ConnectionLineType.Bezier,
    straight: ConnectionLineType.Straight,
    step: ConnectionLineType.Step,
    smoothstep: ConnectionLineType.SmoothStep,
    simplebezier: ConnectionLineType.SimpleBezier,
  };
  const connectionLineType = connectionLineTypeMap[settings.defaultEdgeType ?? 'smoothstep'] ?? ConnectionLineType.SmoothStep;
  const selectionMode =
    settings.selectionMode === 'partial' ? SelectionMode.Partial : SelectionMode.Full;

  return (
    <div className="flex flex-col h-screen w-full bg-[#080808]">
      <FlowToolbar />
      <div className="flex flex-1 min-h-0 w-full">
        <Sidebar />
        <div className="flex-1 min-h-0 min-w-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStop={onNodeDragStop}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={connectionLineType}
            selectionMode={selectionMode}
            selectionOnDrag
            panOnDrag={[2]}
            snapToGrid={settings.snapToGrid}
            snapGrid={settings.snapGrid}
            elevateEdgesOnSelect={settings.elevateEdgesOnSelect}
            edgesReconnectable={settings.edgesReconnectable}
            minZoom={settings.minZoom}
            maxZoom={settings.maxZoom}
            panOnScroll={settings.panOnScroll}
            panOnScrollSpeed={settings.panOnScrollSpeed}
            zoomOnScroll={settings.zoomOnScroll}
            zoomOnPinch={settings.zoomOnPinch}
            zoomOnDoubleClick={settings.zoomOnDoubleClick}
            nodesDraggable={settings.nodesDraggable}
            nodesConnectable={settings.nodesConnectable}
            elementsSelectable={settings.elementsSelectable}
            autoPanOnNodeFocus={settings.autoPanOnNodeFocus}
            autoPanOnConnect={settings.autoPanOnConnect}
            fitView
            attributionPosition="bottom-left"
            deleteKeyCode={['Backspace', 'Delete']}
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
            connectionRadius={6}
            connectionMode={ConnectionMode.Strict}
          >
            <Controls position="top-left" showInteractive={settings.showInteractive} />
            <Background
              variant={backgroundVariant}
              gap={settings.backgroundGap}
              size={settings.backgroundSize}
              color="rgba(255, 255, 255, 0.27)"
              bgColor="#080808"
            />
            <MiniMap
              position="bottom-right"
              className="flow-minimap"
              nodeColor={(node) => {
                if (node.type === 'input') return '#10b981';
                if (node.type === 'output') return '#ef4444';
                if (node.type === 'group') return 'rgba(56, 189, 248, 0.08)';
                return '#fbbf24';
              }}
              nodeStrokeColor={(node) => {
                if (node.type === 'input') return 'rgba(16, 185, 129, 0.5)';
                if (node.type === 'output') return 'rgba(239, 68, 68, 0.5)';
                if (node.type === 'group') return 'rgba(56, 189, 248, 0.25)';
                return 'rgba(251, 191, 36, 0.5)';
              }}
              nodeStrokeWidth={1.5}
              maskColor="rgba(0, 0, 0, 0.7)"
            />
          </ReactFlow>
        </div>
        <DetailsPanel selectedNodeIds={selectedNodeIds} selectedEdgeIds={selectedEdgeIds} />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          nodeId={contextMenu.nodeId}
          edgeId={contextMenu.edgeId}
          onClose={() => setContextMenu(null)}
          onFitView={fitView}
          onDelete={handleContextMenuAction}
          onDuplicate={handleDuplicateNode}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FlowSettingsProvider>
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </FlowSettingsProvider>
  );
}
