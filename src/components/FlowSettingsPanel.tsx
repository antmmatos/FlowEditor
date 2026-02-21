import { useState } from 'react';
import { useFlowSettings } from '../contexts/FlowSettingsContext';

const BACKGROUND_VARIANTS = [
  { value: 'dots', label: 'Dots' },
  { value: 'lines', label: 'Lines' },
  { value: 'cross', label: 'Cross' },
];

const CONNECTION_LINE_TYPES = [
  { value: 'default', label: 'Bezier' },
  { value: 'straight', label: 'Straight' },
  { value: 'step', label: 'Step' },
  { value: 'smoothstep', label: 'Smooth' },
  { value: 'simplebezier', label: 'Simple' },
];

const SELECTION_MODES = [
  { value: 'full', label: 'Full' },
  { value: 'partial', label: 'Partial' },
];

const selectClass = 'panel-select w-full py-[0.4rem] px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-md text-white/75 text-[0.75rem] cursor-pointer transition-all duration-150 focus:outline-none focus:border-[#3b82f6]/40 focus:ring-[2px] focus:ring-[#3b82f6]/10';
const labelClass = 'block mb-1 text-[0.625rem] font-medium text-white/30 uppercase tracking-widest';

function Chevron() {
  return (
    <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="panel-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  );
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/[0.04] pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
      <button type="button" className="panel-section-btn" data-open={open} onClick={() => setOpen(!open)}>
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">{title}</span>
        <Chevron />
      </button>
      <div className="panel-section-body" data-open={open}>
        <div>
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function FlowSettingsPanel() {
  const { settings, updateSetting } = useFlowSettings();

  return (
    <div className="flow-settings-panel">
      <Section title="Canvas" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className={labelClass}>Background</label>
            <select value={settings.backgroundVariant} onChange={(e) => updateSetting('backgroundVariant', e.target.value)} className={selectClass}>
              {BACKGROUND_VARIANTS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Selection</label>
            <select value={settings.selectionMode} onChange={(e) => updateSetting('selectionMode', e.target.value)} className={selectClass}>
              {SELECTION_MODES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Edge type</label>
          <select value={settings.defaultEdgeType} onChange={(e) => updateSetting('defaultEdgeType', e.target.value)} className={selectClass}>
            {CONNECTION_LINE_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Behavior" defaultOpen={true}>
        <div className="flex flex-col gap-1">
          <div className="panel-row opacity-80">
            <span className="text-[0.775rem] text-white/55 select-none">Snap to grid</span>
            <Toggle checked={settings.snapToGrid} onChange={(v) => updateSetting('snapToGrid', v)} />
          </div>
          <div className="panel-row opacity-80">
            <span className="text-[0.775rem] text-white/55 select-none">Selection on drag</span>
            <Toggle checked={settings.selectionOnDrag} onChange={(v) => updateSetting('selectionOnDrag', v)} />
          </div>
          <div className="panel-row opacity-80">
            <span className="text-[0.775rem] text-white/55 select-none">Reconnectable edges</span>
            <Toggle checked={settings.edgesReconnectable} onChange={(v) => updateSetting('edgesReconnectable', v)} />
          </div>
        </div>
      </Section>

      <Section title="Scroll" defaultOpen={true}>
        <div className="segmented-control">
          <label>
            <input
              type="radio"
              name="scrollMode"
              checked={settings.panOnScroll}
              onChange={() => { updateSetting('panOnScroll', true); updateSetting('zoomOnScroll', false); }}
            />
            <span>Pan</span>
          </label>
          <label>
            <input
              type="radio"
              name="scrollMode"
              checked={settings.zoomOnScroll}
              onChange={() => { updateSetting('zoomOnScroll', true); updateSetting('panOnScroll', false); }}
            />
            <span>Zoom</span>
          </label>
        </div>
      </Section>
    </div>
  );
}
