export interface FlowSettings {
  connectionLineType: string;
  panActivationKeyCode: string | null;
  backgroundVariant: string;
  backgroundGap: number;
  backgroundSize: number;
  snapToGrid: boolean;
  snapGrid: [number, number];
  selectionMode: string;
  selectionOnDrag: boolean;
  defaultEdgeType: string;
  elevateEdgesOnSelect: boolean;
  edgesReconnectable: boolean;
  minZoom: number;
  maxZoom: number;
  panOnScroll: boolean;
  panOnScrollSpeed: number;
  zoomOnScroll: boolean;
  zoomOnPinch: boolean;
  zoomOnDoubleClick: boolean;
  panOnDrag: boolean;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  autoPanOnNodeFocus: boolean;
  autoPanOnConnect: boolean;
  showInteractive: boolean;
}

export type FlowSettingsKey = keyof FlowSettings;

export interface FlowSettingsContextValue {
  settings: FlowSettings;
  updateSetting: <K extends FlowSettingsKey>(key: K, value: FlowSettings[K]) => void;
}

export interface ContextMenuState {
  x: number;
  y: number;
  type: 'pane' | 'node' | 'edge';
  nodeId?: string;
  edgeId?: string;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  type: 'pane' | 'node' | 'edge';
  nodeId?: string | null;
  edgeId?: string | null;
  onClose: () => void;
  onFitView?: () => void;
  onDelete?: (action: 'node' | 'edge', id: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export interface DetailsPanelProps {
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
}

export interface NodeDetailsPanelProps {
  selectedNodeIds?: string[];
}

export interface EdgeDetailsPanelProps {
  selectedEdgeIds?: string[];
}
