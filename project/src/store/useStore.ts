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
      height?: string;
      alignment?: 'left' | 'center' | 'right';
      position?: string;
      left?: string;
      top?: string;
      transform?: string;
    };
    data?: {
      headers: string[];
      rows: string[][];
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
  isPreviewMode: boolean;
  canvasWidth: number;
  canvasHeight: number;
  addElement: (type: Element['type'], properties?: Partial<Element['properties']>) => void;
  updateElement: (id: string, properties: Partial<Element['properties']>) => void;
  removeElement: (id: string) => void;
  setElementState: (id: string, value: string) => void;
  moveElement: (sourceIndex: number, destinationIndex: number) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  setCanvasDimensions: (width: number, height: number) => void;
  undo: () => void;
  redo: () => void;
  selectElement: (id: string | null) => void;
  toggleTheme: () => void;
  groupElements: (elementIds: string[]) => void;
  ungroupElements: (groupId: string) => void;
  togglePreviewMode: () => void;
  loadDesign: (designData: { elements: Element[]; elementStates: Record<string, string>; theme: 'light' | 'dark'; canvasWidth: number; canvasHeight: number }) => void;
  setElements: (elements: any[]) => void;
  setSelectedElement: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const STORAGE_KEY = 'dragndrop-design';

const saveState = (state: Partial<State>) => {
  const currentState = useStore.getState();
  const newState = {
    elements: state.elements || currentState.elements,
    elementStates: state.elementStates || currentState.elementStates,
    theme: state.theme || currentState.theme,
    canvasWidth: state.canvasWidth || currentState.canvasWidth,
    canvasHeight: state.canvasHeight || currentState.canvasHeight,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
};

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
  isPreviewMode: false,
  canvasWidth: 800,
  canvasHeight: 600,

  setCanvasDimensions: (width, height) => {
    set((state) => ({
      canvasWidth: width,
      canvasHeight: height,
      history: {
        past: [...state.history.past, state.elements],
        present: state.elements,
        future: [],
      },
    }));
    saveState({ canvasWidth: width, canvasHeight: height });
  },

  addElement: (type, properties = {}) => {
    set((state) => {
      const defaultTexts = {
        button: 'Click me',
        text: '  ',
        input: 'Enter text here',
        table: 'Table',
        image: 'Image',
        card: 'Card',
        container: 'Container'
      };

      const defaultSizes = {
        button: { width: 'fit-content', height: 'auto' },
        text: { width: 'fit-content', height: 'auto' },
        input: { width: '200px', height: 'auto' },
        table: { width: '100%', height: 'auto' },
        image: { width: '200px', height: '200px' },
        card: { width: '300px', height: 'auto' },
        container: { width: '400px', height: '300px' }
      };

      const newElement: Element = {
        id: nanoid(),
        type,
        properties: {
          text: defaultTexts[type] || `New ${type}`,
          ...properties,
          style: {
            backgroundColor: type === "button" ? "#3B82F6" : type === "card" ? "#FFFFFF" : type === "container" ? "#F3F4F6" : "transparent",
            textColor: type === "button" ? "#FFFFFF" : type === "card" ? "#000000" : type === "container" ? "#000000" : "#000000",
            padding: type === "button" ? "0.5rem 1rem" : type === "card" ? "1rem" : type === "container" ? "1rem" : "0",
            borderRadius: type === "button" ? "0.25rem" : type === "card" ? "0.5rem" : type === "container" ? "0.5rem" : "0",
            fontSize: type === "button" ? "1rem" : type === "card" ? "1rem" : type === "container" ? "1rem" : "1rem",
            ...properties.style,
          },
          layout: {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: defaultSizes[type].width,
            height: defaultSizes[type].height,
            alignment: "left",
            ...properties.layout,
          },
        },
      };

      const newElements = [...state.elements, newElement];
      saveState({ elements: newElements });
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
      saveState({ elements: newElements });
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
      saveState({ elements: newElements });
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
    set((state) => {
      const element = state.elements.find(el => el.id === id);
      if (element?.type === 'container') {
        try {
          const newProperties = JSON.parse(value);
          const newElements = state.elements.map(el => 
            el.id === id 
              ? { ...el, properties: { ...el.properties, ...newProperties } }
              : el
          );
          saveState({ 
            elements: newElements,
            elementStates: { ...state.elementStates, [id]: value } 
          });
          return {
            elements: newElements,
            elementStates: { ...state.elementStates, [id]: value }
          };
        } catch (e) {
          saveState({ elementStates: { ...state.elementStates, [id]: value } });
          return { elementStates: { ...state.elementStates, [id]: value } };
        }
      } else if (element?.type === 'table') {
        try {
          const newData = JSON.parse(value);
          const newElements = state.elements.map(el => 
            el.id === id 
              ? { ...el, properties: { ...el.properties, data: newData } }
              : el
          );
          saveState({ 
            elements: newElements,
            elementStates: { ...state.elementStates, [id]: value } 
          });
          return {
            elements: newElements,
            elementStates: { ...state.elementStates, [id]: value }
          };
        } catch (e) {
          saveState({ elementStates: { ...state.elementStates, [id]: value } });
          return { elementStates: { ...state.elementStates, [id]: value } };
        }
      } else {
        // For other element types, update the properties directly
        const newElements = state.elements.map(el => 
          el.id === id 
            ? { ...el, properties: { ...el.properties, ...JSON.parse(value) } }
            : el
        );
        saveState({ 
          elements: newElements,
          elementStates: { ...state.elementStates, [id]: value } 
        });
        return {
          elements: newElements,
          elementStates: { ...state.elementStates, [id]: value }
        };
      }
    });
  },

  moveElement: (sourceIndex, destinationIndex) => {
    set((state) => {
      const newElements = Array.from(state.elements);
      const [removed] = newElements.splice(sourceIndex, 1);
      newElements.splice(destinationIndex, 0, removed);
      saveState({ elements: newElements });
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

  updateElementPosition: (id, x, y) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              properties: {
                ...el.properties,
                layout: {
                  ...el.properties.layout,
                  left: `${x}px`,
                  top: `${y}px`,
                },
              },
            }
          : el
      );
      saveState({ elements: newElements });
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
      saveState({ elements: previous });
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
      saveState({ elements: next });
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
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      saveState({ theme: newTheme });
      return { theme: newTheme };
    });
  },

  groupElements: (elementIds) => {
    set((state) => {
      const groupId = nanoid();
      const newElements = state.elements.map((el) =>
        elementIds.includes(el.id) ? { ...el, groupId } : el
      );
      saveState({ elements: newElements });
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
      saveState({ elements: newElements });
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

  togglePreviewMode: () => {
    set((state) => {
      const newPreviewMode = !state.isPreviewMode;
      saveState({ isPreviewMode: newPreviewMode });
      return { isPreviewMode: newPreviewMode };
    });
  },

  loadDesign: (designData) => {
    set({
      elements: designData.elements,
      elementStates: designData.elementStates,
      theme: designData.theme,
      canvasWidth: designData.canvasWidth || 800,
      canvasHeight: designData.canvasHeight || 600,
      history: {
        past: [],
        present: designData.elements,
        future: [],
      },
      selectedElement: null,
    });
    saveState({ elements: designData.elements, elementStates: designData.elementStates, theme: designData.theme, canvasWidth: designData.canvasWidth || 800, canvasHeight: designData.canvasHeight || 600 });
  },

  setElements: (elements) => {
    set({ elements });
    saveState({ elements });
  },

  setSelectedElement: (id) => {
    set({ selectedElement: id });
  },

  setTheme: (theme) => {
    set({ theme });
    saveState({ theme });
  },
}));

// Load saved state from local storage on initialization
const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) {
  try {
    const parsedState = JSON.parse(savedState);
    useStore.getState().loadDesign(parsedState);
  } catch (error) {
    console.error('Error loading saved state:', error);
  }
}

export default useStore;