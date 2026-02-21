import { useEffect } from 'react';
import type { ContextMenuProps } from '../types';

export default function ContextMenu({
  x,
  y,
  type,
  nodeId,
  edgeId,
  onClose,
  onFitView,
  onDelete,
  onDuplicate,
}: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleAction = (fn?: () => void) => {
    fn?.();
    onClose();
  };

  const btnClass = 'block w-full py-2 px-4 text-left bg-transparent border-none text-white/75 text-[0.8125rem] cursor-pointer transition-all duration-100 hover:bg-white/[0.05] hover:text-white/95';

  return (
    <div
      className="fixed z-[10000] min-w-[180px] py-1.5 bg-[#111111] border border-white/[0.06] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {type === 'pane' && (
        <button type="button" onClick={() => handleAction(onFitView)} className={btnClass}>
          Fit View
        </button>
      )}
      {type === 'node' && nodeId && (
        <>
          <button type="button" onClick={() => handleAction(() => onDuplicate?.(nodeId))} className={btnClass}>
            Duplicate Node
          </button>
          <button type="button" onClick={() => handleAction(() => onDelete?.('node', nodeId))} className={btnClass}>
            Delete Node
          </button>
        </>
      )}
      {type === 'edge' && edgeId && (
        <button type="button" onClick={() => handleAction(() => onDelete?.('edge', edgeId))} className={btnClass}>
          Delete Edge
        </button>
      )}
    </div>
  );
}
