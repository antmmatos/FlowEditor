import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FlowSettings, FlowSettingsContextValue, FlowSettingsKey } from '../types';

const FlowSettingsContext = createContext<FlowSettingsContextValue | null>(null);

const initialSettings: FlowSettings = {
  connectionLineType: 'smoothstep',
  backgroundVariant: 'dots',
  backgroundGap: 20,
  backgroundSize: 1,
  snapToGrid: true,
  snapGrid: [15, 15],
  selectionMode: 'full',
  selectionOnDrag: true,
  panActivationKeyCode: null,
  defaultEdgeType: 'smoothstep',
  elevateEdgesOnSelect: true,
  edgesReconnectable: true,
  minZoom: 0.1,
  maxZoom: 4,
  panOnScroll: false,
  panOnScrollSpeed: 0.5,
  zoomOnScroll: true,
  zoomOnPinch: true,
  zoomOnDoubleClick: true,
  panOnDrag: false,
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  autoPanOnNodeFocus: true,
  autoPanOnConnect: true,
  showInteractive: true,
};

export function FlowSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FlowSettings>(initialSettings);

  const updateSetting = useCallback(<K extends FlowSettingsKey>(key: K, value: FlowSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  return (
    <FlowSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </FlowSettingsContext.Provider>
  );
}

export function useFlowSettings(): FlowSettingsContextValue {
  const ctx = useContext(FlowSettingsContext);
  if (!ctx) throw new Error('useFlowSettings must be used within FlowSettingsProvider');
  return ctx;
}
