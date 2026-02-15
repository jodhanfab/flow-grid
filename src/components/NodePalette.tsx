import { useMemo, useState } from 'react';
import {
  Search,
  Square,
  Diamond,
  Database,
  Circle,
  Shapes,
  Webhook,
  Box,
  ListOrdered,
  Zap,
  MessageSquare,
  FileText,
  Puzzle,
  Package,
  Server,
  Code,
  Cloud,
  User,
  ArrowLeftRight,
} from 'lucide-react';
import type { PaletteItem } from '../types';
import { useFlowStore } from '../store/useFlowStore';

const PALETTE_ITEMS: PaletteItem[] = [
  // Flow
  { id: 'process', label: 'Process', category: 'Flow', icon: 'process', defaultData: { label: 'Process', width: 180, height: 52 } },
  { id: 'decision', label: 'Decision', category: 'Flow', icon: 'decision', defaultData: { label: 'Decision', size: 84 } },
  { id: 'terminal', label: 'Start / End', category: 'Flow', icon: 'terminal', defaultData: { label: 'Start', variant: 'start' } },
  // Data
  { id: 'data', label: 'Data Store', category: 'Data', icon: 'data', defaultData: { label: 'Data', width: 160, height: 48 } },
  // Development
  { id: 'api', label: 'API', category: 'Development', icon: 'api', defaultData: { label: 'API', shape: 'rounded' } },
  { id: 'service', label: 'Service', category: 'Development', icon: 'service', defaultData: { label: 'Service', shape: 'rounded' } },
  { id: 'queue', label: 'Queue', category: 'Development', icon: 'queue', defaultData: { label: 'Queue', shape: 'rounded' } },
  { id: 'cache', label: 'Cache', category: 'Development', icon: 'cache', defaultData: { label: 'Cache', shape: 'rounded' } },
  { id: 'message', label: 'Message', category: 'Development', icon: 'message', defaultData: { label: 'Message', shape: 'rounded' } },
  { id: 'document', label: 'Document', category: 'Development', icon: 'document', defaultData: { label: 'Document', shape: 'rectangle' } },
  { id: 'interface', label: 'Interface', category: 'Development', icon: 'interface', defaultData: { label: 'Interface', shape: 'rounded' } },
  // Infrastructure
  { id: 'container', label: 'Container', category: 'Infrastructure', icon: 'container', defaultData: { label: 'Container', shape: 'rounded' } },
  { id: 'server', label: 'Server', category: 'Infrastructure', icon: 'server', defaultData: { label: 'Server', shape: 'rounded' } },
  { id: 'function', label: 'Function', category: 'Infrastructure', icon: 'function', defaultData: { label: 'Function', shape: 'rounded' } },
  { id: 'cloud', label: 'Cloud', category: 'Infrastructure', icon: 'cloud', defaultData: { label: 'Cloud', shape: 'ellipse' } },
  // UML / flow
  { id: 'actor', label: 'Actor', category: 'UML', icon: 'actor', defaultData: { label: 'Actor', shape: 'ellipse' } },
  { id: 'inputoutput', label: 'Input / Output', category: 'UML', icon: 'inputoutput', defaultData: { label: 'Input / Output', shape: 'parallelogram' } },
  // Custom
  { id: 'custom', label: 'Custom Shape', category: 'Custom', icon: 'custom', defaultData: { label: 'Custom', shape: 'rounded' } },
];

const iconProps = { size: 16, strokeWidth: 1.75 };
const iconMap: Record<string, React.ReactNode> = {
  process: <Square {...iconProps} />,
  decision: <Diamond {...iconProps} />,
  data: <Database {...iconProps} />,
  terminal: <Circle {...iconProps} />,
  api: <Webhook {...iconProps} />,
  service: <Box {...iconProps} />,
  queue: <ListOrdered {...iconProps} />,
  cache: <Zap {...iconProps} />,
  message: <MessageSquare {...iconProps} />,
  document: <FileText {...iconProps} />,
  interface: <Puzzle {...iconProps} />,
  container: <Package {...iconProps} />,
  server: <Server {...iconProps} />,
  function: <Code {...iconProps} />,
  cloud: <Cloud {...iconProps} />,
  actor: <User {...iconProps} />,
  inputoutput: <ArrowLeftRight {...iconProps} />,
  custom: <Shapes {...iconProps} />,
};

export function NodePalette() {
  const [search, setSearch] = useState('');
  const sidebarOpen = useFlowStore((s) => s.sidebarOpen) ?? true;

  const filtered = useMemo(() => {
    if (!search.trim()) return PALETTE_ITEMS;
    const q = search.toLowerCase();
    return PALETTE_ITEMS.filter(
      (p) => p.label.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const byCategory = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    filtered.forEach((p) => {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    });
    return map;
  }, [filtered]);

  if (!sidebarOpen) return null;

  return (
    <aside
      className="w-[240px] border-r border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col shrink-0 transition-[var(--transition-base)] overflow-hidden"
      style={{ width: '240px' }}
    >
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            size={16}
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-[var(--border-color)] rounded-[var(--radius-md)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-[var(--transition-fast)]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {Array.from(byCategory.entries()).map(([category, items]) => (
          <div key={category} className="mb-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] px-2 py-1.5">
              {category}
            </h3>
            <div className="space-y-0.5">
              {items.map((item) => (
                <PaletteNodeItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[13px] text-[var(--text-secondary)] px-2 py-6">No nodes match.</p>
        )}
      </div>
    </aside>
  );
}

function PaletteNodeItem({ item }: { item: PaletteItem }) {
  const icon = iconMap[item.icon] ?? <Square size={16} strokeWidth={1.75} />;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify(item.defaultData));
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage) {
      const ghost = document.createElement('div');
      ghost.className = 'opacity-60 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] font-medium shadow-[var(--shadow-card)]';
      ghost.textContent = item.label;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => document.body.removeChild(ghost), 0);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-md)] border border-transparent hover:border-[var(--border-color)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] cursor-grab active:cursor-grabbing transition-colors duration-[var(--transition-fast)]"
    >
      <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-color)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] shrink-0">
        {icon}
      </div>
      <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">{item.label}</span>
    </div>
  );
}
