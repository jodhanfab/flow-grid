import {
  Save,
  Image,
  FileCode,
  FileJson,
  Undo2,
  Redo2,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Settings,
  User,
  Network,
  LayoutGrid,
} from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import { exportAsPng, exportAsSvg, exportAsJson } from '../lib/export';
import { hierarchicalLayout, forceDirectedLayout } from '../lib/layout';
import type { EdgeTypeId } from '../types';

export function Toolbar() {
  const {
    nodes,
    edges,
    setNodes,
    loadDiagram,
    setSidebarOpen,
    sidebarOpen,
    setDarkMode,
    darkMode,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    pushHistory,
    getDiagramState,
    addToast,
    exportRef,
    setEdgeType,
    edgeType,
  } = useFlowStore();

  const handleSave = () => {
    const state = getDiagramState();
    localStorage.setItem('flow-diagram', JSON.stringify(state));
    addToast({ message: 'Diagram saved', type: 'success' });
  };

  const handleExportPng = async () => {
    try {
      await exportAsPng(() => exportRef);
      addToast({ message: 'Exported as PNG', type: 'success' });
    } catch {
      addToast({ message: 'Export failed', type: 'error' });
    }
  };

  const handleExportSvg = async () => {
    try {
      await exportAsSvg(() => exportRef);
      addToast({ message: 'Exported as SVG', type: 'success' });
    } catch {
      addToast({ message: 'Export failed', type: 'error' });
    }
  };

  const handleExportJson = () => {
    exportAsJson(getDiagramState());
    addToast({ message: 'Exported as JSON', type: 'success' });
  };

  const handleUndo = () => {
    undo();
    addToast({ message: 'Undo', type: 'info' });
  };

  const handleRedo = () => {
    redo();
    addToast({ message: 'Redo', type: 'info' });
  };

  const handleClear = () => {
    if (typeof window !== 'undefined' && window.confirm('Clear entire canvas?')) {
      clearCanvas();
      addToast({ message: 'Canvas cleared', type: 'info' });
    }
  };

  const handleLayoutHierarchical = () => {
    const next = hierarchicalLayout(nodes, edges);
    setNodes(next);
    pushHistory();
    addToast({ message: 'Applied hierarchical layout', type: 'success' });
  };

  const handleLayoutForce = () => {
    const next = forceDirectedLayout(nodes, edges);
    setNodes(next);
    pushHistory();
    addToast({ message: 'Applied grid layout', type: 'success' });
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const state = JSON.parse(reader.result as string);
        if (state.nodes && state.edges) {
          loadDiagram(state);
          addToast({ message: 'Diagram loaded', type: 'success' });
        }
      } catch {
        addToast({ message: 'Invalid file', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const iconProps = { size: 18, strokeWidth: 1.75 };

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-panel)] shrink-0"
      style={{ height: '56px' }}
    >
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] select-none">
          Flow
        </h1>
        <nav className="flex items-center gap-0.5">
          <ToolbarButton onClick={handleSave} title="Save" icon={<Save {...iconProps} />} />
          <label
            title="Load JSON"
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] cursor-pointer transition-colors duration-[var(--transition-fast)] inline-flex items-center justify-center"
          >
            <input type="file" accept=".json" className="hidden" onChange={handleLoadJson} />
            <FileJson {...iconProps} />
          </label>
          <ToolbarButton onClick={handleExportPng} title="Export PNG" icon={<Image {...iconProps} />} />
          <ToolbarButton onClick={handleExportSvg} title="Export SVG" icon={<FileCode {...iconProps} />} />
          <ToolbarButton onClick={handleExportJson} title="Export JSON" icon={<FileJson {...iconProps} />} />
          <div className="w-px h-5 bg-[var(--border-color)] mx-1.5" aria-hidden />
          <ToolbarButton onClick={handleUndo} disabled={!canUndo()} title="Undo" icon={<Undo2 {...iconProps} />} />
          <ToolbarButton onClick={handleRedo} disabled={!canRedo()} title="Redo" icon={<Redo2 {...iconProps} />} />
          <ToolbarButton onClick={handleClear} title="Clear canvas" icon={<Trash2 {...iconProps} />} />
          <div className="w-px h-5 bg-[var(--border-color)] mx-1.5" aria-hidden />
          <ToolbarButton
            onClick={handleLayoutHierarchical}
            title="Hierarchical layout"
            icon={<Network {...iconProps} />}
          />
          <ToolbarButton
            onClick={handleLayoutForce}
            title="Grid layout"
            icon={<LayoutGrid {...iconProps} />}
          />
          <select
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value as EdgeTypeId)}
            className="ml-2 px-2.5 py-1.5 text-[13px] font-medium border border-[var(--border-color)] rounded-[var(--radius-md)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-[var(--transition-fast)]"
            title="Edge type"
          >
            <option value="default">Bezier</option>
            <option value="straight">Straight</option>
            <option value="step">Step</option>
          </select>
        </nav>
      </div>

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse palette' : 'Open palette'}
          icon={sidebarOpen ? <PanelLeftClose {...iconProps} /> : <PanelLeftOpen {...iconProps} />}
        />
        <ToolbarButton
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          icon={darkMode ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
        />
        <ToolbarButton title="Settings" icon={<Settings {...iconProps} />} />
        <ToolbarButton title="User" icon={<User {...iconProps} />} />
      </div>
    </header>
  );
}

function ToolbarButton({
  onClick,
  title,
  icon,
  disabled,
}: {
  onClick?: () => void;
  title: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] disabled:opacity-40 disabled:pointer-events-none transition-colors duration-[var(--transition-fast)] inline-flex items-center justify-center"
    >
      {icon}
    </button>
  );
}
