import { useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { NodePalette } from './components/NodePalette';
import { FlowCanvas } from './components/FlowCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Toast } from './components/Toast';
import { ContextMenu } from './components/ContextMenu';
import { useFlowStore } from './store/useFlowStore';

const STORAGE_KEY = 'flow-diagram';
const SAVE_DEBOUNCE_MS = 500;


function App() {
  const loadDiagram = useFlowStore((s) => s.loadDiagram);
  const setDarkMode = useFlowStore((s) => s.setDarkMode);
  const contextMenu = useFlowStore((s) => s.contextMenu);
  const setContextMenu = useFlowStore((s) => s.setContextMenu);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load diagram from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.nodes && state.edges) loadDiagram(state);
      } catch (_) {}
    }
  }, [loadDiagram]);

  // Persist diagram to localStorage when nodes, edges, or viewport change (debounced)
  useEffect(() => {
    const unsub = useFlowStore.subscribe(() => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const { getDiagramState } = useFlowStore.getState();
        const state = getDiagramState();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (_) {}
        saveTimeoutRef.current = null;
      }, SAVE_DEBOUNCE_MS);
    });
    return () => {
      unsub();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(dark);
  }, [setDarkMode]);

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-app)]">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <NodePalette />
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <FlowCanvas />
        </main>
        <PropertiesPanel />
      </div>
      <Toast />
      <ContextMenu state={contextMenu} onClose={() => setContextMenu(null)} />
    </div>
  );
}

export default App;
