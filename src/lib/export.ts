import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import type { DiagramState } from '../types';

export async function exportAsPng(getElement: () => HTMLElement | null): Promise<void> {
  const el = getElement();
  if (!el) return;
  const dataUrl = await toPng(el, {
    backgroundColor: 'var(--bg-canvas)',
    pixelRatio: 2,
    filter: (node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      return !className.includes('react-flow__controls') && !className.includes('react-flow__minimap');
    },
  });
  saveAs(dataUrl, `flow-diagram-${Date.now()}.png`);
}

export async function exportAsSvg(getElement: () => HTMLElement | null): Promise<void> {
  const el = getElement();
  if (!el) return;
  const dataUrl = await toSvg(el, {
    backgroundColor: 'var(--bg-canvas)',
    filter: (node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      return !className.includes('react-flow__controls') && !className.includes('react-flow__minimap');
    },
  });
  saveAs(dataUrl, `flow-diagram-${Date.now()}.svg`);
}

export function exportAsJson(state: DiagramState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, `flow-diagram-${Date.now()}.json`);
}
