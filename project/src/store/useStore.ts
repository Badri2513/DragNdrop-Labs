import { create } from 'zustand';
import { nanoid } from 'nanoid';

export interface Element {
  id: string;
  type: 'button' | 'text' | 'input' | 'table' | 'container' | 'image' | 'card';
  properties: {
    text?: string;
    onClick?: string;
    value?: string;
    style?: {
      backgroundColor?: string;
      textColor?: string;
      padding?: string;
      borderRadius?: string;
      fontSize?: string;
    };
    layout?: {
      width?: string;
      alignment?: 'left' | 'center' | 'right';
    };
  };
  groupId?: string;
}

interface HistoryState {
  past: Element[][];
  present: Element[];
  future: Element[][];
}

interface State {
  elements: Element[];
  elementStates: Record<string, string>;
  history: HistoryState;
  selectedElement: string | null;
  theme: 'light' | 'dark';
  addElement: (type: Element['type'], properties?: Partial<Element['properties']>) => void;
  updateElement: (id: string, properties: Partial<Element['properties']>) => void;
  removeElement: (id: string) => void;
  setElementState: (id: string, value: string) => void;
  moveElement: (sourceIndex: number, destinationIndex: number) => void;
  undo: () => void;
  redo: () => void;
  selectElement: (id: string | null) => void;
  toggleTheme: () => void;
  groupElements: (elementIds: string[]) => void;
  ungroupElements: (groupId: string) => void;
}

const useStore = create<State>((set) => ({
  elements: [],
  elementStates: {},
  history: {
    past: [],
    present: [],
    future: [],
  },
  selectedElement: null,
  theme: 'light',

  addElement: (type, properties = {}) => {
    set((state) => {
      const newElement: Element = {
        id: nanoid(),
        type,
        properties: {
          text: `New ${type}`,
          ...properties,
          style: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '1rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            ...properties.style,
          },
          layout: {
            width: '100%',
            alignment: 'left',
            ...properties.layout,
          },
        },
      };

      const newElements = [...state.elements, newElement];
      return {
        elements: newElements,
        history: {
          past: [...state.history.past, state.elements],
          present: newElements,
          future: [],
        },
      };
    });
  },

  updateElement: (id, properties) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id
          ? { ...el, properties: { ...el.properties, ...properties } }
          : el
      );
      return {
        elements: newElements,
        history: {
          past: [...state.history.past, state.elements],
          present: newElements,
          future: [],
        },
      };
    });
  },

  removeElement: (id) => {
    set((state) => {
      const newElements = state.elements.filter((el) => el.id !== id);
      return {
        elements: newElements,
        history: {
          past: [...state.history.past, state.elements],
          present: newElements,
          future: [],
        },
      };
    });
  },

  setElementState: (id, value) => {
    set((state) => ({
      elementStates: { ...state.elementStates, [id]: value },
    }));
  },

  moveElement: (sourceIndex, destinationIndex) => {
    set((state) => {
      const newElements = Array.from(state.elements);
      const [removed] = newElements.splice(sourceIndex, 1);
      newElements.splice(destinationIndex, 0, removed);
      return {
        elements: newElements,
        history: {
          past: [...state.history.past, state.elements],
          present: newElements,
          future: [],
        },
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        elements: previous,
        history: {
          past: newPast,
          present: previous,
          future: [state.elements, ...state.history.future],
        },
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        elements: next,
        history: {
          past: [...state.history.past, state.elements],
          present: next,
          future: newFuture,
        },
      };
    });
  },

  selectElement: (id) => {
    set({ selectedElement: id });
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
  },

  groupElements: (elementIds) => {
    set((state) => {
      const groupId = nanoid();
      const newElements = state.elements.map((el) =>
        elementIds.includes(el.id) ? { ...el, groupId } : el
      );
      return {
        elements: newElements,
        history: {
          past: [...state.history.past, state.elements],
          present: newElements,
          future: [],
        },
      };
    });
  },

  ungroupElements: (groupId) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.groupId === groupId ? { ...el, groupId: undefined } : el
      );
      return {
        elements: newElements,
        history: {
          past: [...state.history.past, state.elements],
          present: newElements,
          future: [],
        },
      };
    });
  },
}));

export default useStore;