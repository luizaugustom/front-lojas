import { create } from 'zustand';
import { Block, BlockType, StorefrontTheme, DEFAULT_THEME } from '@/lib/storefront-types';
import { getBlockDefinition } from '@/components/storefront/BlockRegistry';

interface HistoryEntry {
  theme: StorefrontTheme;
  blocks: Block[];
}

interface StorefrontEditorState {
  // Estado atual
  designId: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  theme: StorefrontTheme;
  blocks: Block[];
  selectedBlockId: string | null;
  dirty: boolean;
  saving: boolean;

  // Histórico para undo/redo
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Ações de blocos
  addBlock: (type: BlockType, atIndex?: number) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  updateBlockVisibility: (id: string, visible: boolean) => void;
  selectBlock: (id: string | null) => void;

  // Ações de tema
  updateTheme: (theme: Partial<StorefrontTheme>) => void;

  // Ações globais
  loadDesign: (design: {
    id: string | null;
    status: 'DRAFT' | 'PUBLISHED';
    theme: StorefrontTheme;
    blocks: Block[];
  }) => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
  resetDirty: () => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Getters
  selectedBlock: () => Block | null;
}

const HISTORY_LIMIT = 50;

function pushHistory(state: StorefrontEditorState): HistoryEntry[] {
  const entry: HistoryEntry = {
    theme: state.theme,
    blocks: state.blocks,
  };
  const past = [...state.past, entry];
  if (past.length > HISTORY_LIMIT) past.shift();
  return past;
}

function uuid(): string {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useStorefrontEditor = create<StorefrontEditorState>((set, get) => ({
  designId: null,
  status: 'DRAFT',
  theme: DEFAULT_THEME,
  blocks: [],
  selectedBlockId: null,
  dirty: false,
  saving: false,
  past: [],
  future: [],

  addBlock: (type, atIndex) => {
    const def = getBlockDefinition(type);
    if (!def) return;
    const newBlock: Block = {
      id: uuid(),
      type,
      order: 0,
      visible: true,
      props: { ...def.defaultProps },
    };
    set((state) => {
      const past = pushHistory(state);
      const blocks = [...state.blocks];
      const insertAt = atIndex ?? blocks.length;
      blocks.splice(insertAt, 0, newBlock);
      const reordered = blocks.map((b, i) => ({ ...b, order: i }));
      return {
        past,
        future: [],
        blocks: reordered,
        selectedBlockId: newBlock.id,
        dirty: true,
      };
    });
  },

  removeBlock: (id) => {
    set((state) => {
      const past = pushHistory(state);
      const blocks = state.blocks
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order: i }));
      return {
        past,
        future: [],
        blocks,
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        dirty: true,
      };
    });
  },

  duplicateBlock: (id) => {
    set((state) => {
      const idx = state.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return {};
      const past = pushHistory(state);
      const orig = state.blocks[idx];
      const copy: Block = {
        ...orig,
        id: uuid(),
        props: { ...orig.props },
      };
      const blocks = [...state.blocks];
      blocks.splice(idx + 1, 0, copy);
      return {
        past,
        future: [],
        blocks: blocks.map((b, i) => ({ ...b, order: i })),
        selectedBlockId: copy.id,
        dirty: true,
      };
    });
  },

  reorderBlocks: (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    set((state) => {
      const past = pushHistory(state);
      const blocks = [...state.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return {
        past,
        future: [],
        blocks: blocks.map((b, i) => ({ ...b, order: i })),
        dirty: true,
      };
    });
  },

  updateBlockProps: (id, props) => {
    set((state) => {
      const past = pushHistory(state);
      return {
        past,
        future: [],
        blocks: state.blocks.map((b) =>
          b.id === id ? { ...b, props: { ...b.props, ...props } } : b,
        ),
        dirty: true,
      };
    });
  },

  updateBlockVisibility: (id, visible) => {
    set((state) => {
      const past = pushHistory(state);
      return {
        past,
        future: [],
        blocks: state.blocks.map((b) =>
          b.id === id ? { ...b, visible } : b,
        ),
        dirty: true,
      };
    });
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  updateTheme: (themeUpdate) => {
    set((state) => {
      const past = pushHistory(state);
      return {
        past,
        future: [],
        theme: {
          ...state.theme,
          ...themeUpdate,
          colors: { ...state.theme.colors, ...(themeUpdate.colors || {}) },
          fonts: { ...state.theme.fonts, ...(themeUpdate.fonts || {}) },
        },
        dirty: true,
      };
    });
  },

  loadDesign: (design) => {
    set({
      designId: design.id,
      status: design.status,
      theme: design.theme || DEFAULT_THEME,
      blocks: (design.blocks || []).map((b, i) => ({ ...b, order: i })),
      selectedBlockId: null,
      past: [],
      future: [],
      dirty: false,
    });
  },

  markSaved: () => set({ saving: false, dirty: false }),
  setSaving: (saving) => set({ saving }),
  resetDirty: () => set({ dirty: false }),

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return {};
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const current: HistoryEntry = { theme: state.theme, blocks: state.blocks };
      return {
        past: newPast,
        future: [current, ...state.future].slice(0, HISTORY_LIMIT),
        theme: previous.theme,
        blocks: previous.blocks,
        dirty: true,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return {};
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const current: HistoryEntry = { theme: state.theme, blocks: state.blocks };
      return {
        past: [...state.past, current].slice(-HISTORY_LIMIT),
        future: newFuture,
        theme: next.theme,
        blocks: next.blocks,
        dirty: true,
      };
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  selectedBlock: () => {
    const state = get();
    if (!state.selectedBlockId) return null;
    return state.blocks.find((b) => b.id === state.selectedBlockId) || null;
  },
}));
