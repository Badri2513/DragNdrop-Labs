import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import {
  Layers,
  Type,
  Donut as ButtonIcon,
  Table2,
  Play,
  Download,
  Undo2,
  Redo2,
  Sun,
  Moon,
  Image,
  CreditCard,
  Group,
  Ungroup,
  Trash2,
  Eye,
  Share2,
  Palette,
  FileJson,
  FileCode,
  Settings,
  Square,
  Table,
  SquareStack,
  Pencil
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import StyleEditor from './components/StyleEditor';
import PhoneTypeSelector from './components/PhoneTypeSelector';
import ComponentTree from './components/ComponentTree';
import CanvasGuides from './components/CanvasGuides';
import useStore from './store/useStore';
import DataTab from './components/DataTab';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import { nanoid } from 'nanoid';

// Local storage keys
const STORAGE_KEYS = {
  PROJECTS: 'dragndrop_projects',
  THEME: 'dragndrop_theme',
  CANVAS_DIMENSIONS: 'dragndrop_canvas_dimensions',
  ELEMENTS: 'dragndrop_elements',
  ELEMENT_STATES: 'dragndrop_element_states'
};

type ElementType = "button" | "text" | "input" | "table" | "container" | "image" | "card";
type Position = "absolute" | "relative" | "fixed" | "static" | "sticky";

// Add phone presets near the top where other constants and types are defined
const phonePresets = [
  { name: 'iPhone 14 Pro', width: 393, height: 852, brand: 'Apple', notch: true, dynamicIsland: true },
  { name: 'iPhone 14', width: 390, height: 844, brand: 'Apple', notch: true, dynamicIsland: false },
  { name: 'iPhone SE', width: 375, height: 667, brand: 'Apple', notch: false, dynamicIsland: false },
  { name: 'Samsung S23', width: 360, height: 780, brand: 'Samsung', notch: false, dynamicIsland: false },
  { name: 'Google Pixel 7', width: 412, height: 915, brand: 'Google', notch: false, dynamicIsland: false },
  { name: 'Custom', width: 375, height: 667, brand: 'Custom', notch: false, dynamicIsland: false },
];

function App() {
  const {
    elements,
    elementStates,
    selectedElement,
    theme,
    isPreviewMode,
    canvasWidth,
    canvasHeight,
    addElement,
    updateElementPosition,
    setElementState,
    undo,
    redo,
    toggleTheme,
    selectElement,
    removeElement,
    groupElements,
    ungroupElements,
    togglePreviewMode,
    loadDesign,
    setCanvasDimensions,
    setElements
  } = useStore();

  const [draggingElement, setDraggingElement] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [selectedPhoneType, setSelectedPhoneType] = useState(phonePresets[2]);
  const [activeTab, setActiveTab] = useState<'elements' | 'style' | 'data'>('elements');
  const [projects, setProjects] = useState<Array<{
    id: string;
    name: string;
    lastModified: string;
  }>>(() => {
    // Load projects from localStorage on initial render
    const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return savedProjects ? JSON.parse(savedProjects) : [];
  });
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Add a state for tracking element position changes to force re-render in preview
  const [positionUpdateCounter, setPositionUpdateCounter] = useState(0);
  
  const [customWidth, setCustomWidth] = useState(375);
  const [customHeight, setCustomHeight] = useState(667);

  // Update canvas dimensions when phone size changes
  useEffect(() => {
    if (selectedPhoneType.name === 'Custom') {
      setCanvasDimensions(customWidth, customHeight);
    } else {
      setCanvasDimensions(selectedPhoneType.width, selectedPhoneType.height);
    }
  }, [selectedPhoneType, customWidth, customHeight, setCanvasDimensions]);
  
  // Update position counter whenever elements change to force re-renders
  useEffect(() => {
    setPositionUpdateCounter(prev => prev + 1);
  }, [elements]);
  
  // When updateElementPosition is called, force a PhoneTypeSelector re-render
  const originalUpdateElementPosition = updateElementPosition;
  const wrappedUpdateElementPosition = useCallback((id: string, x: number, y: number) => {
    originalUpdateElementPosition(id, x, y);
    // Wait a frame to ensure store updates are processed
    requestAnimationFrame(() => {
      setPositionUpdateCounter(prev => prev + 1);
    });
  }, [originalUpdateElementPosition]);
  
  // Replace the original with our wrapped version
  const handleMouseUp = useCallback(() => {
    if (!draggingElement) return;
  
    const element = document.getElementById(draggingElement.id);
    if (element) {
      // Get current position
      const rect = element.getBoundingClientRect();
      const canvas = document.getElementById('canvas');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const x = rect.left - canvasRect.left;
        const y = rect.top - canvasRect.top;
        
        // Snap to grid
        const gridSize = 10;
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;
        
        // Update element position with smooth transition
        element.style.transition = 'transform 0.2s ease-out';
        element.style.transform = `translate(${snappedX}px, ${snappedY}px)`;
        
        // Update the element's position in the store
        wrappedUpdateElementPosition(draggingElement.id, snappedX, snappedY);
      }
    }
  
    setDraggingElement(null);
  }, [draggingElement, wrappedUpdateElementPosition]);

  // Load saved data from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const savedCanvasDimensions = localStorage.getItem(STORAGE_KEYS.CANVAS_DIMENSIONS);
    const savedElements = localStorage.getItem(STORAGE_KEYS.ELEMENTS);
    const savedElementStates = localStorage.getItem(STORAGE_KEYS.ELEMENT_STATES);

    if (savedTheme && savedTheme !== theme) {
      toggleTheme(); // Just toggle if the saved theme is different
    }
    if (savedCanvasDimensions) {
      const { width, height } = JSON.parse(savedCanvasDimensions);
      setCanvasDimensions(width, height);
    }
    if (savedElements) {
      setElements(JSON.parse(savedElements));
    }
    if (savedElementStates) {
      Object.entries(JSON.parse(savedElementStates)).forEach(([id, state]) => {
        setElementState(id, state as string);
      });
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANVAS_DIMENSIONS, JSON.stringify({ width: canvasWidth, height: canvasHeight }));
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
  }, [elements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ELEMENT_STATES, JSON.stringify(elementStates));
  }, [elementStates]);

  // Save project data to localStorage whenever it changes
  useEffect(() => {
    const projectData = {
      elements,
      elementStates,
      theme,
      canvasWidth,
      canvasHeight,
      selectedElement,
      isPreviewMode,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('dragndrop-project', JSON.stringify(projectData));
  }, [elements, elementStates, theme, canvasWidth, canvasHeight, selectedElement, isPreviewMode]);

  // Load project data from localStorage on initial load
  useEffect(() => {
    const savedProject = localStorage.getItem('dragndrop-project');
    if (savedProject) {
      try {
        const projectData = JSON.parse(savedProject);
        loadDesign(projectData);
        // Restore editor state
        if (projectData.selectedElement) {
          selectElement(projectData.selectedElement);
        }
        if (projectData.isPreviewMode) {
          togglePreviewMode();
        }
      } catch (error) {
        console.error('Error loading saved project:', error);
      }
    }
  }, [loadDesign, selectElement, togglePreviewMode]);

  const handleAddTable = () => {
    const newId = nanoid();
    
    const newElement: any = {
      id: newId,
      type: 'table',
      properties: {
        text: 'Form Submissions',
        data: {
          headers: ['Timestamp', 'Submitted Value'],
          rows: []
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderRadius: '8px',
          padding: '8px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#e5e7eb',
        },
        layout: {
          position: 'absolute',
          left: '50%',
          top: '70%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: 'auto',
        }
      }
    };
    
    setElements([...elements, newElement]);
    
    // Select the newly created element after a brief delay
    setTimeout(() => {
      handleElementSelect(newId);
    }, 100);
  };

  const handleAddButton = () => {
    const newId = nanoid();
    
    const newElement: any = {
      id: newId,
      type: 'button',
      properties: {
        text: 'Click Me',
        message: 'Button clicked!',
        submitTarget: '',  // This will be empty by default until user selects an input
        submitAction: 'both',  // Clear and show message by default
        style: {
          backgroundColor: '#3B82F6',
          textColor: '#ffffff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '16px',
          messageBackgroundColor: '#2563EB',
          messageTextColor: '#ffffff',
        },
        layout: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          height: 'auto',
        }
      }
    };
    
    setElements([...elements, newElement]);
    
    // Select the newly created element after a brief delay
    setTimeout(() => {
      handleElementSelect(newId);
    }, 100);
  };

  const toolboxItems = [
    {
      id: 'button',
      name: 'Button',
      icon: <Square className="w-5 h-5" />,
      onClick: handleAddButton,
    },
    {
      id: 'submit-button',
      name: 'Submit Button',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>,
      onClick: () => {
        const newId = nanoid();
        
        // Find any existing input elements
        const existingInputs = elements.filter(el => el.type === 'input');
        const firstInputId = existingInputs.length > 0 ? existingInputs[0].id : '';
        
        // Find any existing table elements
        const existingTables = elements.filter(el => el.type === 'table');
        const firstTableId = existingTables.length > 0 ? existingTables[0].id : '';
        
        const newElement: any = {
          id: newId,
          type: 'button',
          properties: {
            text: 'Submit',
            message: 'Form submitted!',
            submitTarget: firstInputId,
            submitAction: 'both',
            storeSubmissions: Boolean(firstTableId),
            targetTable: firstTableId,
            style: {
              backgroundColor: '#10b981',
              textColor: '#ffffff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '16px',
              messageBackgroundColor: '#059669',
              messageTextColor: '#ffffff',
            },
            layout: {
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'auto',
              height: 'auto',
            }
          }
        };
        
        setElements([...elements, newElement]);
        
        // Select the newly created element after a brief delay
        setTimeout(() => {
          handleElementSelect(newId);
        }, 100);
      },
    },
    {
      id: 'text',
      name: 'Text',
      icon: <Type className="w-5 h-5" />,
      onClick: () => addElement("text" as ElementType)
    },
    {
      id: 'input',
      name: 'Input',
      icon: <Pencil className="w-5 h-5" />,
      onClick: () => {
        // Find if there's an existing table to link to
        const existingTables = elements.filter(el => el.type === 'table');
        const firstTableId = existingTables.length > 0 ? existingTables[0].id : '';
        
        const newId = nanoid();
        const newElement: any = {
          id: newId,
          type: 'input',
          properties: {
            text: 'Enter text here',
            placeholder: 'Type something...',
            // If there's a table, automatically link to it
            destinationTable: firstTableId,
            style: {
              backgroundColor: '#ffffff',
              textColor: '#000000',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '16px',
            },
            layout: {
              position: 'absolute',
              left: '50%',
              top: '40%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: 'auto',
            }
          }
        };
        
        setElements([...elements, newElement]);
        
        // Select the newly created element after a brief delay
        setTimeout(() => {
          handleElementSelect(newId);
          
          // If a table exists, automatically create a submit button
          if (firstTableId) {
            setTimeout(() => {
              handleAddSubmitButtonForInput(newId, firstTableId);
            }, 200);
          }
        }, 100);
      }
    },
    {
      id: 'table',
      name: 'Table',
      icon: <Table className="w-5 h-5" />,
      onClick: handleAddTable
    },
    {
      id: 'image',
      name: 'Image',
      icon: <Image className="w-5 h-5" />,
      onClick: () => addElement("image" as ElementType)
    },
    {
      id: 'card',
      name: 'Card',
      icon: <SquareStack className="w-5 h-5" />,
      onClick: () => addElement("card" as ElementType)
    },
    {
      id: 'container',
      name: 'Container',
      icon: <Layers className="w-5 h-5" />,
      onClick: () => addElement("container" as ElementType)
    },
    {
      id: 'form-button',
      name: 'Form Button',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
      </svg>,
      onClick: () => {
        const newId = nanoid();
        
        const newElement: any = {
          id: newId,
          type: 'button',
          properties: {
            text: 'Save to Table',
            message: 'Data saved!',
            submitAction: 'both',
            storeSubmissions: true,
            style: {
              backgroundColor: '#3b82f6',
              textColor: '#ffffff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '16px',
              messageBackgroundColor: '#2563eb',
              messageTextColor: '#ffffff',
            },
            layout: {
              position: 'absolute',
              left: '50%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              width: 'auto',
              height: 'auto',
            }
          }
        };
        
        setElements([...elements, newElement]);
        
        // Select the newly created element after a brief delay
        setTimeout(() => {
          handleElementSelect(newId);
        }, 100);
      },
    },
  ];

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();

    const element = document.getElementById(id);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    // Get the current position relative to canvas
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;
    
    setDraggingElement({
      id,
      x,
      y,
      width: rect.width,
      height: rect.height
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingElement) return;

    const element = document.getElementById(draggingElement.id);
    if (!element) return;

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate new position based on mouse movement
    const newX = e.clientX - canvasRect.left - (draggingElement.width / 2);
    const newY = e.clientY - canvasRect.top - (draggingElement.height / 2);

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvasRect.width - draggingElement.width));
    const constrainedY = Math.max(0, Math.min(newY, canvasRect.height - draggingElement.height));

    // Update element position
    element.style.transition = 'none';
    element.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
  }, [draggingElement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!draggingElement || e.key !== 'Enter') return;
    
    // Simulate a mouse up event to drop the element
    handleMouseUp();
  }, [draggingElement, handleMouseUp]);

  useEffect(() => {
    if (draggingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [draggingElement, handleMouseMove, handleMouseUp, handleKeyDown]);

  const handleSnap = (x: number, y: number) => {
    if (!draggingElement) return;
    setDraggingElement({
      ...draggingElement,
      x,
      y,
    });
  };

  const handleElementSelect = (id: string) => {
    selectElement(selectedElement === id ? null : id);
  };

  const handleGroupSelected = () => {
    const selectedElements = elements.filter(
      (el) => el.groupId === selectedElement || el.id === selectedElement
    );
    if (selectedElements.length > 1) {
      groupElements(selectedElements.map((el) => el.id));
    }
  };

  const handleUngroup = () => {
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element?.groupId) {
        ungroupElements(element.groupId);
      }
    }
  };

  const handleExportJSON = () => {
    const designData = {
      elements: elements.map(element => ({
        ...element,
        properties: {
          ...element.properties,
          // Ensure button properties are included
          href: element.properties.href,
          type: element.properties.type,
          disabled: element.properties.disabled,
        }
      })),
      elementStates,
      theme,
      canvasWidth,
      canvasHeight,
      selectedElement,
      isPreviewMode,
      timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(designData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dragndrop-design-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    // Helper function to convert camelCase to kebab-case
    const toKebabCase = (str: string) => {
      return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    };

    // Helper function to convert style object to CSS string
    const styleToCSS = (style: Record<string, any>) => {
      return Object.entries(style)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case
          const cssKey = toKebabCase(key);
          // Handle special cases
          if (key === 'backgroundColor') return `background-color: ${value}`;
          if (key === 'textColor') return `color: ${value}`;
          if (key === 'borderRadius') return `border-radius: ${value}`;
          if (key === 'fontSize') return `font-size: ${value}`;
          return `${cssKey}: ${value}`;
        })
        .join('; ');
    };

    // Generate HTML for the canvas content
    const canvasContent = elements.map(element => {
      const style = {
        ...element.properties.layout,
        ...element.properties.style,
        position: 'absolute',
        left: element.properties.layout?.left || '0',
        top: element.properties.layout?.top || '0',
        transform: `translate(${element.properties.layout?.left || '0'}, ${element.properties.layout?.top || '0'})`,
        width: element.properties.layout?.width || 'auto',
        height: element.properties.layout?.height || 'auto',
        'background-color': element.properties.style?.backgroundColor || 'transparent',
        color: element.properties.style?.textColor || 'inherit',
        padding: element.properties.style?.padding || '0',
        'border-radius': element.properties.style?.borderRadius || '0',
        'font-size': element.properties.style?.fontSize || 'inherit',
      };

      let content = '';
      switch (element.type) {
        case 'button':
          content = `<button 
            style="${styleToCSS(style)}" 
            onclick="window.open('${element.properties.href || ''}', '_blank')"
            type="${element.properties.type || 'button'}"
            ${element.properties.disabled ? 'disabled' : ''}
          >${elementStates[element.id] || element.properties.text || 'Button'}</button>`;
          break;
        case 'text':
          content = `<div style="${styleToCSS(style)}" contenteditable="true" onblur="updateText('${element.id}', this.textContent)">${elementStates[element.id] || element.properties.text || 'Text'}</div>`;
          break;
        case 'input':
          content = `<input type="text" style="${styleToCSS(style)}" value="${elementStates[element.id] || ''}" placeholder="${element.properties.text || 'Input'}" onchange="updateInput('${element.id}', this.value)">`;
          break;
        case 'image':
          content = `<div style="${styleToCSS(style)}" class="image-container">
            <img src="${elementStates[element.id] || ''}" alt="Image" style="width: 100%; height: 100%; object-fit: cover;">
            <input type="file" accept="image/*" onchange="handleImageUpload('${element.id}', this)" style="display: none;">
            <button onclick="document.querySelector('.image-container input[type=file]').click()">Change Image</button>
          </div>`;
          break;
        case 'card':
          content = `
            <div style="${styleToCSS(style)}" class="card">
              <h3 contenteditable="true" onblur="updateCardTitle('${element.id}', this.textContent)">${element.properties.text || 'Card Title'}</h3>
              <p contenteditable="true" onblur="updateCardContent('${element.id}', this.textContent)">${elementStates[element.id] || 'Card content'}</p>
            </div>
          `;
          break;
        case 'container':
          content = `<div style="${styleToCSS(style)}" class="container">
            <div contenteditable="true" onblur="updateContainerContent('${element.id}', this.textContent)">${elementStates[element.id] || element.properties.text || 'Container'}</div>
          </div>`;
          break;
        default:
          content = '';
      }
      return content;
    }).join('\n');

    // Create the complete HTML file with all necessary scripts and styles
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DragNdrop Design</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
      color: ${theme === 'dark' ? '#ffffff' : '#000000'};
    }
    .canvas {
      position: relative;
      width: ${canvasWidth}px;
      height: ${canvasHeight}px;
      margin: 0 auto;
      background-color: ${theme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
      border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
      overflow: hidden;
    }
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .image-container button {
      position: absolute;
      bottom: 10px;
      left: 10px;
      padding: 5px 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .card {
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .container {
      padding: 20px;
      border: 2px dashed ${theme === 'dark' ? '#404040' : '#e0e0e0'};
      border-radius: 8px;
    }
    [contenteditable="true"] {
      outline: none;
    }
    [contenteditable="true"]:focus {
      background-color: rgba(0, 0, 0, 0.05);
    }
  </style>
</head>
<body>
  <div class="canvas">
    ${canvasContent}
  </div>

  <script>
    // Element state management
    const elementStates = ${JSON.stringify(elementStates)};

    // Update functions for different element types
    function updateText(id, content) {
      elementStates[id] = content;
      console.log('Text updated:', id, content);
    }

    function updateInput(id, value) {
      elementStates[id] = value;
      console.log('Input updated:', id, value);
    }

    function updateCardTitle(id, title) {
      elementStates[id] = { ...elementStates[id], title };
      console.log('Card title updated:', id, title);
    }

    function updateCardContent(id, content) {
      elementStates[id] = { ...elementStates[id], content };
      console.log('Card content updated:', id, content);
    }

    function updateContainerContent(id, content) {
      elementStates[id] = content;
      console.log('Container content updated:', id, content);
    }

    function handleImageUpload(id, input) {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.querySelector(\`#\${id} img\`);
          if (img) {
            img.src = e.target.result;
            elementStates[id] = e.target.result;
            console.log('Image updated:', id);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Save state to localStorage
    function saveState() {
      localStorage.setItem('dragndrop_states', JSON.stringify(elementStates));
    }

    // Load state from localStorage
    function loadState() {
      const savedStates = localStorage.getItem('dragndrop_states');
      if (savedStates) {
        Object.assign(elementStates, JSON.parse(savedStates));
      }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      loadState();
      // Add auto-save
      setInterval(saveState, 5000);
    });
  </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dragndrop-design-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const designData = {
      elements,
      elementStates,
      theme,
      canvasWidth,
      canvasHeight,
      selectedElement,
      isPreviewMode,
      timestamp: new Date().toISOString()
    };
    
    const encodedData = btoa(JSON.stringify(designData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?design=${encodedData}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My DragNdrop Design',
        text: 'Check out my design created with DragNdrop Labs!',
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(console.error);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas (not on an element)
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  const handleAddSubmitButtonForInput = (inputId: string, destinationTableId: string) => {
    // Find the input element
    const inputElement = elements.find(el => el.id === inputId);
    if (!inputElement) return;
    
    // Check if input already has a submit button
    if (inputElement.properties.submitButtonId) {
      // If it does, just update the existing button's target table
      const existingButtonId = inputElement.properties.submitButtonId;
      const existingButton = elements.find(el => el.id === existingButtonId);
      
      if (existingButton) {
        // Update the existing submit button to point to the new table
        const updatedElements = elements.map(el => {
          if (el.id === existingButtonId) {
            return {
              ...el,
              properties: {
                ...el.properties,
                targetTable: destinationTableId,
                storeSubmissions: true,
              }
            };
          }
          return el;
        });
        
        setElements(updatedElements);
        return;
      }
    }
    
    // Create a new submit button
    const newButtonId = nanoid();
    const buttonY = parseInt(inputElement.properties.layout?.top || "0") + 60; // Position below the input
    
    const newButton: any = {
      id: newButtonId,
      type: 'button',
      properties: {
        text: 'Submit',
        message: 'Data saved!',
        submitTarget: inputId,
        submitAction: 'both',
        storeSubmissions: true,
        targetTable: destinationTableId,
        style: {
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          messageBackgroundColor: '#2563eb',
          messageTextColor: '#ffffff',
        },
        layout: {
          position: 'absolute',
          left: inputElement.properties.layout?.left,
          top: `${buttonY}px`,
          transform: `translate(0, 0)`,
          width: 'auto',
          height: 'auto',
        }
      }
    };
    
    // Update the input to reference its submit button
    const updatedElements = elements.map(el => {
      if (el.id === inputId) {
        return {
          ...el,
          properties: {
            ...el.properties,
            submitButtonId: newButtonId,
          }
        };
      }
      return el;
    });
    
    // Add the new button to elements
    setElements([...updatedElements, newButton]);
    
    // Show a notification
    console.log(`Created submit button for input ${inputId} storing to table ${destinationTableId}`);
  };

  const handleUpdateElement = (elementId: string, value: any) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Check if this is an input element with a destinationTable being set
    const oldDestinationTable = element.properties.destinationTable;
    const newDestinationTable = value.destinationTable;
    
    // If the destination table has changed and is not empty, add a submit button
    if (newDestinationTable && newDestinationTable !== oldDestinationTable) {
      // We need to wait for the element update to complete first
      setTimeout(() => {
        handleAddSubmitButtonForInput(elementId, newDestinationTable);
      }, 100);
    }

    // Handle different types of updates
    if (typeof value === 'object') {
      // If value is an object, update the properties directly
      const updatedElements = elements.map(el => {
        if (el.id === elementId) {
          // Special handling for table data updates
          if (value.data && el.type === 'table') {
            console.log('Updating table data in handleUpdateElement:', value.data);
            
            // Create a new object to ensure React detects the change
            const updatedElement = {
              ...el,
              properties: {
                ...el.properties,
                data: {
                  headers: [...value.data.headers],
                  rows: [...value.data.rows]
                }
              }
            };
            
            // Force a UI refresh by setting the element state
            setTimeout(() => {
              setElementState(elementId, JSON.stringify(updatedElement.properties.data));
            }, 0);
            
            return updatedElement;
          }
          
          return {
            ...el,
            properties: {
              ...el.properties,
              ...value
            }
          };
        }
        return el;
      });
      
      // Call the function to update all elements
      setElements(updatedElements);
      
      // Ensure the preview is updated by saving to localStorage
      localStorage.setItem('dragndrop-project', JSON.stringify({
        ...JSON.parse(localStorage.getItem('dragndrop-project') || '{}'),
        elements: updatedElements
      }));
    } else {
      // If value is a string, update the element state
      setElementState(elementId, value);
    }

    // If this is a table element, automatically update the data
    if (element && element.type === 'table' && value.data) {
      console.log('Updating table data in handleUpdateElement:', value.data);
    }
  };

  const handleLayoutChange = (elementId: string, property: string, value: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Special handling for position-related properties to ensure preview updates
    if (['left', 'top'].includes(property)) {
      // Extract numeric value
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        // If it's a position property, use wrappedUpdateElementPosition
        if (property === 'left') {
          wrappedUpdateElementPosition(elementId, numericValue, parseFloat(element.properties.layout?.top as string) || 0);
          return;
        } else if (property === 'top') {
          wrappedUpdateElementPosition(elementId, parseFloat(element.properties.layout?.left as string) || 0, numericValue);
          return;
        }
      }
    }

    // For other properties, use standard update logic
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          properties: {
            ...el.properties,
            layout: {
              ...el.properties.layout,
              ...{ [property]: value }
            }
          }
        };
      }
      return el;
    });
    
    // Update elements and force preview refresh
    setElements(updatedElements);
    setPositionUpdateCounter(prev => prev + 1);
  };

  const handleNewProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: 'New Project',
      lastModified: new Date().toLocaleString()
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
    
    // Clear the canvas and reset states
    setElements([]);
    Object.keys(elementStates).forEach(id => setElementState(id, ''));
    
    // Save the cleared state with project-specific key
    localStorage.setItem(`project_${newProject.id}`, JSON.stringify({
      elements: [],
      elementStates: {},
      theme: theme,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      isPreviewMode: false
    }));
  };

  const handleOpenProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProjectId(id);
      // Load project data from project-specific storage
      const projectData = localStorage.getItem(`project_${id}`);
      if (projectData) {
        const { elements: savedElements, elementStates: savedStates } = JSON.parse(projectData);
        setElements(savedElements);
        Object.entries(savedStates).forEach(([id, state]) => {
          setElementState(id, state as string);
        });
      }
    }
  };

  const handleEditProject = (id: string, newName: string) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { ...project, name: newName, lastModified: new Date().toLocaleString() }
        : project
    ));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
    // Remove project data from localStorage
    localStorage.removeItem(`project_${id}`);
  };

  // Update the save effect to use current project ID
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem(`project_${currentProjectId}`, JSON.stringify({
        elements,
        elementStates,
        theme,
        canvasWidth,
        canvasHeight,
        isPreviewMode
      }));
    }
  }, [elements, elementStates, theme, canvasWidth, canvasHeight, isPreviewMode, currentProjectId]);

  // Load initial project if exists
  useEffect(() => {
    const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      if (parsedProjects.length > 0) {
        setCurrentProjectId(parsedProjects[0].id);
        handleOpenProject(parsedProjects[0].id);
      }
    }
  }, []);

  console.log("Canvas dimensions:", canvasWidth, canvasHeight);
  console.log("Canvas dimensions for centering:", canvasWidth, "x", canvasHeight);

  return (
    <Router>
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
        <Routes>
          <Route path="/" element={<HomePage theme={theme} />} />
          
          {/* Protected Routes */}
          <Route
            path="/projects"
            element={
              <>
                <SignedIn>
                  <LandingPage 
                    theme={theme}
                    projects={projects}
                    onNewProject={handleNewProject}
                    onOpenProject={handleOpenProject}
                    onEditProject={handleEditProject}
                    onDeleteProject={handleDeleteProject}
                  />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/editor"
            element={
              <>
                <SignedIn>
                  <div className="container mx-auto p-4 pt-20">
                    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
                      <div className="flex items-center justify-between px-4 py-2">
                        {/* Left side - Logo and name */}
                        <div className="flex items-center gap-4">
                          <h1 className="text-xl font-semibold text-gray-800">DragNdrop Labs</h1>
                        </div>
                        
                        {/* Center - Phone size selector */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Canvas Size:</span>
                          <div className="relative">
                            <select
                              value={selectedPhoneType.name}
                              onChange={(e) => {
                                const selected = phonePresets.find(preset => preset.name === e.target.value);
                                if (selected) {
                                  setSelectedPhoneType(selected);
                                }
                              }}
                              className="bg-white border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {phonePresets.map(preset => (
                                <option key={preset.name} value={preset.name}>
                                  {preset.name} ({preset.width}×{preset.height})
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          
                          {selectedPhoneType.name === 'Custom' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(Number(e.target.value))}
                                className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Width"
                              />
                              <span className="text-gray-500">×</span>
                              <input
                                type="number"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(Number(e.target.value))}
                                className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Height"
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2">
                        <div className="relative group">
                          <button
                            onClick={() => setShowDownloadOptions(true)}
                            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Download Design"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {showDownloadOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                              <div className="p-2">
                                <button
                                  onClick={() => {
                                    handleExportJSON();
                                    setShowDownloadOptions(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                  <FileJson className="w-4 h-4" />
                                  Download as JSON
                                </button>
                                <button
                                  onClick={() => {
                                    handleExportHTML();
                                    setShowDownloadOptions(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                  <FileCode className="w-4 h-4" />
                                  Download as HTML
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleShare}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Share Design"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={togglePreviewMode}
                          className={`p-2 rounded ${
                            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
                          }`}
                          title={isPreviewMode ? "Exit Preview" : "Preview"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={undo}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Undo"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={redo}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Redo"
                        >
                          <Redo2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={toggleTheme}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Toggle Theme"
                        >
                          {theme === "light" ? (
                            <Moon className="w-4 h-4" />
                          ) : (
                            <Sun className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={handleGroupSelected}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Group Elements"
                        >
                          <Group className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleUngroup}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Ungroup Elements"
                        >
                          <Ungroup className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => selectedElement && removeElement(selectedElement)}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Delete Selected"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-64">
                        <div
                          className={`rounded-lg shadow p-4 ${
                            theme === "dark" ? "bg-gray-800" : "bg-white"
                          }`}
                        >
                          <h2 className="font-semibold mb-4">Component Tree</h2>
                          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                            <ComponentTree
                              elements={elements}
                              selectedElement={selectedElement}
                              onSelect={selectElement}
                              theme={theme}
                            />
                          </div>
                        </div>

                        {!isPreviewMode && (
                          <div
                            className={`rounded-lg shadow p-4 mt-4 ${
                              theme === "dark" ? "bg-gray-800" : "bg-white"
                            }`}
                          >
                            <h2 className="font-semibold mb-4">Toolbox</h2>
                            <div className="space-y-2">
                              {toolboxItems.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={item.onClick}
                                  className={`flex items-center gap-2 p-3 rounded cursor-pointer
                                    ${
                                      theme === "dark"
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-50 hover:bg-gray-100"
                                    }`}
                                >
                                  {item.icon}
                                  {item.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex-1 relative flex justify-center items-center ${
                          isPreviewMode ? "pt-8" : ""
                        }`}
                      >
                        {isPreviewMode ? (
                          <div className="fixed inset-0 bg-gray-50 flex flex-col">
                            {/* Exit Button */}
                            <button
                              onClick={togglePreviewMode}
                              className="fixed top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-100 text-gray-700 transition-all"
                              title="Exit Preview"
                            >
                              <Eye className="w-4 h-4" />
                              Exit Preview
                            </button>
                            
                            {/* Preview Area */}
                            <div className="flex-1 flex flex-col items-center">
                          <PhoneTypeSelector
                            selectedType={selectedPhoneType}
                            onSelectType={(type) => {
                              setSelectedPhoneType(type);
                                }}
                                customWidth={customWidth}
                                customHeight={customHeight}
                                onCustomWidthChange={setCustomWidth}
                                onCustomHeightChange={setCustomHeight}
                            elements={elements}
                            elementStates={elementStates}
                            onElementStateChange={setElementState}
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
                                togglePreviewMode={togglePreviewMode}
                          />
                            </div>
                          </div>
                        ) : (
                          <div
                            id="canvas"
                            className={`rounded-lg shadow p-4 relative overflow-hidden mx-auto ${
                              theme === "dark" ? "bg-gray-800" : "bg-white"
                            }`}
                            style={{
                              width: `${canvasWidth}px`,
                              height: `${canvasHeight}px`,
                              marginTop: "20px",
                              transform: "none" // Ensure no transform is applied to the canvas
                            }}
                            onClick={handleCanvasClick}
                          >
                            <CanvasGuides
                              width={canvasWidth}
                              height={canvasHeight}
                              theme={theme}
                              elements={elements}
                              draggingElement={draggingElement || undefined}
                              onSnap={handleSnap}
                            />
                            {elements.map((element) => (
                              <div
                                key={element.id}
                                id={element.id}
                                onMouseDown={(e) => handleMouseDown(e, element.id)}
                                className={`inline-block ${
                                  !isPreviewMode && selectedElement === element.id
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                } ${draggingElement?.id === element.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                                style={{
                                  position: (element.properties.layout?.position as Position) || "absolute",
                                  left: "0",
                                  top: "0",
                                  transform: element.properties.layout?.transform || `translate(${element.properties.layout?.left || "50%"}, ${element.properties.layout?.top || "50%"})`,
                                  width: element.properties.layout?.width || "fit-content",
                                  height: element.properties.layout?.height || "auto",
                                  transition: draggingElement?.id === element.id ? 'none' : 'all 0.2s ease-out',
                                  zIndex: draggingElement?.id === element.id ? 50 : 1,
                                }}
                              >
                                <div style={{ width: element.properties.layout?.width || "auto" }}>
                                  <MemoizedPreviewElement
                                    element={element}
                                    value={elementStates[element.id]}
                                    onChange={(value) => setElementState(element.id, value)}
                                    isPreviewMode={isPreviewMode}
                                    elements={elements}
                                    elementStates={elementStates}
                                    setElementState={setElementState}
                                    updateElements={setElements}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-80 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setActiveTab('style')}
                            className={`p-2 rounded flex items-center gap-2 ${
                              activeTab === 'style'
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : theme === 'dark'
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            <Palette className="w-4 h-4" />
                            Style
                          </button>
                          <button
                            onClick={() => setActiveTab('data')}
                            className={`p-2 rounded flex items-center gap-2 ${
                              activeTab === 'data'
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : theme === 'dark'
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            <Table2 className="w-4 h-4" />
                            Data
                          </button>
                        </div>

                        <div className={`flex-1 rounded-lg shadow p-4 overflow-auto ${
                          theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
                          {activeTab === 'style' && selectedElement && (
                            <StyleEditor
                              elementId={selectedElement}
                              onUpdate={handleUpdateElement}
                              theme={theme}
                              onLayoutChange={(property, value) => handleLayoutChange(selectedElement, property, value)}
                            />
                          )}
                          {activeTab === 'data' && (
                            <DataTab
                              elements={elements}
                              onUpdateElementData={handleUpdateElement}
                              theme={theme}
                            />
                          )}
                          {activeTab === 'style' && !selectedElement && (
                            <div className="text-center text-gray-500">
                              Select an element to edit its style
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function PreviewElement({
  element,
  value,
  onChange,
  isPreviewMode,
  elements = [],
  elementStates = {},
  setElementState = () => {},
  updateElements = () => {},
}: {
  element: any;
  value?: string;
  onChange: (value: string) => void;
  isPreviewMode: boolean;
  elements?: Array<any>;
  elementStates?: Record<string, string>;
  setElementState?: (id: string, value: string) => void;
  updateElements?: (elements: Array<any>) => void;
}) {
  const style = {
    backgroundColor: element.properties.style?.backgroundColor,
    color: element.properties.style?.textColor,
    padding: element.properties.style?.padding,
    borderRadius: element.properties.style?.borderRadius,
    fontSize: element.properties.style?.fontSize,
    opacity: element.properties.style?.opacity,
    visibility: element.properties.style?.visibility,
    borderStyle: element.properties.style?.borderStyle,
    borderWidth: element.properties.style?.borderWidth,
    borderColor: element.properties.style?.borderColor,
  };

  // Use React.useEffect to ensure the preview updates when element properties change
  React.useEffect(() => {
    if (element.type === 'table' && isPreviewMode) {
      console.log('Table element updated in preview:', element.id);
    }
  }, [element, isPreviewMode]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Common style classes for interactive elements
  const getInteractiveClasses = () => {
    return isPreviewMode 
      ? "transition-all duration-200 hover:shadow-md active:scale-[0.98] active:shadow-inner"
      : "";
  };

  switch (element.type) {
    case "button":
      // Add a console log for debugging
      const [showMessage, setShowMessage] = React.useState(false);
      const [submitMessage, setSubmitMessage] = React.useState("");
      
      // Auto-hide message after 3 seconds
      React.useEffect(() => {
        if (showMessage || submitMessage) {
          const timer = setTimeout(() => {
            setShowMessage(false);
            setSubmitMessage("");
          }, 3000);
          return () => clearTimeout(timer);
        }
      }, [showMessage, submitMessage]);

      // Find target input if this is a submit button
      const targetInput = element.properties.submitTarget 
        ? elements.find(el => el.id === element.properties.submitTarget)
        : null;
      
      // Determine button type/role
      const isNavLink = Boolean(element.properties.href);
      const isSubmitButton = Boolean(element.properties.submitTarget);
      
      // Add this to the onClick handler right after handling the input submission
      // Check if this is a direct submit from an input with a destination table
      const inputElement = element.properties.submitTarget 
        ? elements.find(el => el.id === element.properties.submitTarget)
        : null;

      if (inputElement && inputElement.properties.destinationTable) {
        const destinationTableId = inputElement.properties.destinationTable;
        const targetTable = elements.find(el => el.id === destinationTableId);
        
        // This input has a direct destination table - store data there
        if (targetTable && targetTable.type === 'table') {
          // Get current table data or initialize if empty
          let tableData = targetTable.properties.data || { headers: ['Timestamp', 'Input Value'], rows: [] };
          
          // Add new row with timestamp and input value
          const timestamp = new Date().toLocaleString();
          const inputValue = elementStates[element.properties.submitTarget] || "";
          const newRow = [timestamp, inputValue];
          
          // Update the table data
          const updatedData = {
            headers: tableData.headers,
            rows: [...tableData.rows, newRow]
          };
          
          // Update the table element with the new data
          const updatedTableElement = {
            ...targetTable,
            properties: {
              ...targetTable.properties,
              data: updatedData
            }
          };
          
          // Find the index of the target table in the elements array
          const tableIndex = elements.findIndex(el => el.id === destinationTableId);
          
          // Create a new elements array with the updated table
          if (tableIndex !== -1) {
            const newElements = [...elements];
            newElements[tableIndex] = updatedTableElement;
            
            // Call the function to update all elements
            updateElements(newElements);
            
            // Also update the element state for the table
            setElementState(destinationTableId, JSON.stringify(updatedData));
            
            console.log(`Auto-stored submission in table ${destinationTableId}:`, newRow);
            
            // Show a success message specifically for auto-store
            setSubmitMessage(`Saved to table!`);
          }
        }
      }
      
      return (
        <div className="relative group">
          {!isPreviewMode && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isNavLink && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                  Link: {element.properties.href?.substring(0, 15)}{element.properties.href?.length > 15 ? '...' : ''}
                </div>
              )}
              {isSubmitButton && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                  Submits: {targetInput?.properties.placeholder || targetInput?.id?.slice(0, 8) || 'Unknown input'}
                </div>
              )}
              {!isNavLink && !isSubmitButton && (
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                  Basic Button
                </div>
              )}
            </div>
          )}
        <button
          onClick={() => {
              if (isPreviewMode) {
                // Handle URL links
                if (element.properties.href) {
              window.open(element.properties.href, '_blank');
                }
                
                // Handle standard click messages
                if (element.properties.message) {
                  setShowMessage(true);
                }
                
                // Handle form submission
                if (element.properties.submitTarget) {
                  const targetState = elementStates[element.properties.submitTarget] || "";
                  console.log(`Submitting input ${element.properties.submitTarget} with value:`, targetState);
                  
                  // Handle different submit actions
                  if (element.properties.submitAction === 'alert' || element.properties.submitAction === 'both') {
                    setSubmitMessage(`Submitted: ${targetState}`);
                  }
                  
                  // Store in table if enabled
                  if (element.properties.storeSubmissions && element.properties.targetTable) {
                    const targetTableId = element.properties.targetTable;
                    const targetTable = elements.find(el => el.id === targetTableId);
                    
                    if (targetTable && targetTable.type === 'table') {
                      // Get current table data or initialize if empty
                      let tableData = targetTable.properties.data || { headers: ['Timestamp', 'Input Value'], rows: [] };
                      
                      // Add new row with timestamp and input value
                      const timestamp = new Date().toLocaleString();
                      const newRow = [timestamp, targetState];
                      
                      // Update the table data
                      const updatedData = {
                        headers: tableData.headers,
                        rows: [...tableData.rows, newRow]
                      };
                      
                      // Update the table element with the new data
                      const updatedTableElement = {
                        ...targetTable,
                        properties: {
                          ...targetTable.properties,
                          data: updatedData
                        }
                      };
                      
                      // Find the index of the target table in the elements array
                      const tableIndex = elements.findIndex(el => el.id === targetTableId);
                      
                      // Create a new elements array with the updated table
                      if (tableIndex !== -1) {
                        const newElements = [...elements];
                        newElements[tableIndex] = updatedTableElement;
                        
                        // Call the function to update all elements
                        updateElements(newElements);
                        
                        // Also update the element state for the table
                        setElementState(targetTableId, JSON.stringify(updatedData));
                        
                        console.log(`Stored submission in table ${targetTableId}:`, updatedData);
                      }
                    }
                  }
                  
                  // Clear the input if specified
                  if (element.properties.submitAction === 'clear' || element.properties.submitAction === 'both') {
                    setElementState(element.properties.submitTarget, "");
                  }
                }
              }
            }}
            type="button"
          disabled={element.properties.disabled || false}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition-all"
            style={{
              ...style,
              backgroundColor: style.backgroundColor || '#3B82F6',
              color: style.color || 'white',
              borderRadius: style.borderRadius || '0.25rem',
              padding: style.padding || '0.5rem 1rem',
              cursor: isPreviewMode && (element.properties.href || element.properties.message || element.properties.submitTarget) ? 'pointer' : undefined,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            title={
              isPreviewMode 
                ? element.properties.href 
                  ? element.properties.href 
                  : element.properties.submitTarget 
                    ? `Submit ${targetInput?.properties.placeholder || 'form'}`
                    : undefined
                : undefined
            }
          >
            <span className="relative flex items-center justify-center gap-1">
          {value || element.properties.text}
              {isPreviewMode && element.properties.href && (
                <svg className="w-3 h-3 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
              {isPreviewMode && element.properties.submitTarget && (
                <svg className="w-3 h-3 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
        </button>
          
          {/* Message tooltip */}
          {showMessage && element.properties.message && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 -top-12 px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap"
              style={{
                backgroundColor: element.properties.style?.messageBackgroundColor || '#333',
                color: element.properties.style?.messageTextColor || '#fff',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              {element.properties.message}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]" 
                style={{ borderTopColor: element.properties.style?.messageBackgroundColor || '#333' }}>
              </div>
            </div>
          )}
          
          {/* Submit message tooltip */}
          {submitMessage && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 -top-12 px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap"
              style={{
                backgroundColor: element.properties.style?.messageBackgroundColor || '#22c55e',
                color: element.properties.style?.messageTextColor || '#fff',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              {submitMessage}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]" 
                style={{ borderTopColor: element.properties.style?.messageBackgroundColor || '#22c55e' }}>
              </div>
            </div>
          )}
        </div>
      );
    case "text":
      return (
        <div
          contentEditable={!isPreviewMode}
          suppressContentEditableWarning
          onBlur={(e) => !isPreviewMode && onChange(e.currentTarget.textContent || "")}
          style={{
            ...style,
            lineHeight: '1.5',
            wordBreak: 'break-word',
            textShadow: isPreviewMode && style.color === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
          className={`outline-none min-w-[50px] min-h-[24px] ${
            !isPreviewMode ? 'focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded' : ''
          }`}
        >
          {value || element.properties.text}
        </div>
      );
    case "input":
      // Convert undefined values to empty string for consistency
      const inputValue = value !== undefined ? value : "";
      const [hasInteracted, setHasInteracted] = React.useState(false);
      
      // Create a controlled component that uses the state value
      return (
        <div className="relative">
        <input
            type={element.properties.type || "text"}
            value={hasInteracted ? inputValue : (isPreviewMode ? "" : inputValue)}
            onChange={(e) => {
              setHasInteracted(true);
              onChange(e.target.value);
            }}
            onFocus={() => setHasInteracted(true)}
            placeholder={hasInteracted ? "" : (element.properties.placeholder || element.properties.text || "")}
            maxLength={element.properties.maxLength}
            required={element.properties.required}
            disabled={element.properties.disabled}
            // Only set readonly in preview mode if disabled is true
            readOnly={isPreviewMode && element.properties.disabled}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              ...style,
              backgroundColor: style.backgroundColor || '#ffffff',
              boxShadow: isPreviewMode ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'none',
            }}
            // Add a data attribute to make it easier to identify inputs
            data-input-id={element.id}
            name={element.id}
            id={`input-${element.id}`}
          />
          {isPreviewMode && element.properties.disabled && (
            <div className="absolute inset-0 cursor-not-allowed rounded bg-gray-100 opacity-20 pointer-events-none" />
          )}
          {!isPreviewMode && (
            <div className="absolute -top-5 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-md opacity-70">
              ID: {element.id.slice(0, 8)}
            </div>
          )}
        </div>
      );
    case "table":
      // Log the element for debugging
      console.log('Rendering table element:', element);
      console.log('Table properties:', element.properties);
      console.log('Table data:', element.properties.data);
      
      // Try to parse the value if it's a string (it might be a JSON string of table data)
      let tableData = element.properties.data;
      
      if (value && typeof value === 'string') {
        try {
          const parsedData = JSON.parse(value);
          if (parsedData && parsedData.headers && parsedData.rows) {
            console.log('Using parsed table data from value:', parsedData);
            tableData = parsedData;
          }
        } catch (e) {
          console.error('Error parsing table data from value:', e);
        }
      }
      
      // Default headers and rows if no data is available
      const defaultHeaders = ['Header 1', 'Header 2', 'Header 3'];
      const defaultRows = [
        ['Data 1', 'Data 2', 'Data 3'],
        ['Data 4', 'Data A', 'Data 5']
      ];
      
      // Use existing data or defaults
      const headers = tableData?.headers || defaultHeaders;
      const rows = tableData?.rows || defaultRows;
      
      console.log('Using headers:', headers);
      console.log('Using rows:', rows);
      
      return (
        <div 
          className="overflow-hidden rounded-lg shadow-sm border border-gray-200" 
          style={{
            ...style,
            backgroundColor: style.backgroundColor || '#ffffff',
            width: element.properties.layout?.width || '400px'
          }}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header: string, index: number) => (
                  <th key={`header-${index}-${header}`} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row: string[], rowIndex: number) => (
                <tr key={`row-${rowIndex}`} className={isPreviewMode ? 'hover:bg-gray-50 transition-colors' : ''}>
                  {row.map((cell: string, cellIndex: number) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} className="px-6 py-4 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "image":
      return (
        <div 
          style={style} 
          className={`relative group overflow-hidden rounded-lg ${
            isPreviewMode ? 'shadow-sm hover:shadow-md transition-shadow duration-300' : ''
          }`}
        >
          {value ? (
            <div className="relative">
            <img
              src={value}
              alt="Selected"
                className="w-full h-auto"
              />
              {isPreviewMode && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[120px] bg-gray-50">
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500 text-sm font-medium">Image placeholder</span>
            </div>
          )}
          {!isPreviewMode && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          )}
        </div>
      );
    case "card":
      return (
        <div 
          className={`border rounded-lg ${
            isPreviewMode ? 'shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5' : 'shadow-sm'
          }`} 
          style={style}
        >
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-2">
              {element.properties.text}
            </h3>
            <p className="text-gray-600 text-sm">
              {value || "Card content goes here"}
            </p>
            {isPreviewMode && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Card footer</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    case "container":
      return (
        <div
          className={`border border-gray-200 rounded-lg p-4 relative group ${
            isPreviewMode ? 'bg-gray-50/50 shadow-sm' : 'border-dashed border-gray-300'
          }`}
          style={style}
        >
          {!isPreviewMode && (
          <div className="absolute top-0 right-0 flex space-x-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = element.properties.layout?.width || '100%';
                const startHeight = element.properties.layout?.height || 'auto';

                const handleMouseMove = (e: MouseEvent) => {
                  const deltaX = e.clientX - startX;
                  const deltaY = e.clientY - startY;
                  const newWidth = `calc(${startWidth} + ${deltaX}px)`;
                  const newHeight = `calc(${startHeight} + ${deltaY}px)`;
                  onChange(JSON.stringify({
                    ...element.properties,
                    layout: {
                      ...element.properties.layout,
                      width: newWidth,
                      height: newHeight
                    }
                  }));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
          )}
          <div className={`text-center ${isPreviewMode ? 'text-gray-400 text-sm' : 'text-gray-500'}`}>
            {element.properties.text || (isPreviewMode ? "Container" : "Container (Drag elements here)")}
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Use React.memo with a custom comparison function to ensure proper re-rendering
const MemoizedPreviewElement = React.memo(PreviewElement, (prevProps, nextProps) => {
  // Always log preview element updates in debug mode
  console.log('Comparing PreviewElement props:', {
    elementId: nextProps.element.id,
    type: nextProps.element.type,
    prevValue: prevProps.value,
    nextValue: nextProps.value,
    isPreviewMode: nextProps.isPreviewMode
  });
  
  // Always re-render input elements when value changes
  if (nextProps.element.type === 'input') {
    if (prevProps.value !== nextProps.value) {
      console.log('Input value changed, forcing re-render');
      return false; // Not equal, force re-render
    }
  }
  
  // Deep comparison for table data
  if (prevProps.element.type === 'table' && nextProps.element.type === 'table') {
    try {
      const prevData = typeof prevProps.value === 'string' 
        ? JSON.parse(prevProps.value || '{"headers":[],"rows":[]}')
        : (prevProps.element.properties.data || {"headers":[],"rows":[]});
      
      const nextData = typeof nextProps.value === 'string'
        ? JSON.parse(nextProps.value || '{"headers":[],"rows":[]}')
        : (nextProps.element.properties.data || {"headers":[],"rows":[]});
      
      // Compare headers and rows
      const headersEqual = JSON.stringify(prevData.headers) === JSON.stringify(nextData.headers);
      const rowsEqual = JSON.stringify(prevData.rows) === JSON.stringify(nextData.rows);
      
      if (!headersEqual || !rowsEqual) {
        return false;
      }
    } catch (e) {
      // If JSON parsing fails, consider them different
      return false;
    }
  }
  
  // Special handling for buttons
  if (prevProps.element.type === 'button' && nextProps.element.type === 'button') {
    // Check if message or message styling has changed
    if (
      prevProps.element.properties.message !== nextProps.element.properties.message ||
      prevProps.element.properties.style?.messageBackgroundColor !== nextProps.element.properties.style?.messageBackgroundColor ||
      prevProps.element.properties.style?.messageTextColor !== nextProps.element.properties.style?.messageTextColor
    ) {
      return false;
    }
  }

  // Ensure element position or layout hasn't changed
  if (
    prevProps.element.properties.layout?.left !== nextProps.element.properties.layout?.left ||
    prevProps.element.properties.layout?.top !== nextProps.element.properties.layout?.top ||
    prevProps.element.properties.layout?.transform !== nextProps.element.properties.layout?.transform ||
    prevProps.element.properties.layout?.width !== nextProps.element.properties.layout?.width ||
    prevProps.element.properties.layout?.height !== nextProps.element.properties.layout?.height ||
    prevProps.element.properties.layout?.zIndex !== nextProps.element.properties.layout?.zIndex
  ) {
    return false;
  }
  
  // Default shallow comparison for other props
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.value === nextProps.value &&
    prevProps.isPreviewMode === nextProps.isPreviewMode
  );
});

export default App;