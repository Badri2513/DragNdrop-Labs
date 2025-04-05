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
<<<<<<< HEAD
  FileCode,
  Settings
=======
  FileCode
>>>>>>> main
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
  const [selectedPhoneType, setSelectedPhoneType] = useState({
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    brand: 'Apple',
    notch: true,
    dynamicIsland: true
  });
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
    const newTable = {
      id: `table-${Date.now()}`,
      type: 'table' as ElementType,
      properties: {
        layout: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px'
        },
        data: {
          headers: ['Name', 'Age', 'Email'],
          rows: [
            ['John Doe', '30', 'john@example.com'],
            ['Jane Smith', '25', 'jane@example.com']
          ]
        }
      }
    };
    setElements([...elements, newTable]);
  };

  const toolboxItems = [
    { type: "button", icon: ButtonIcon, label: "Button" },
    { type: "text", icon: Type, label: "Text" },
    { type: "input", icon: Type, label: "Input" },
    { type: "table", icon: Table2, label: "Table", onClick: handleAddTable },
    { type: "image", icon: Image, label: "Image" },
    { type: "card", icon: CreditCard, label: "Card" },
    { type: "container", icon: Group, label: "Container" },
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
        updateElementPosition(draggingElement.id, snappedX, snappedY);
      }
    }

    setDraggingElement(null);
  }, [draggingElement, updateElementPosition]);

  useEffect(() => {
    if (draggingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingElement, handleMouseMove, handleMouseUp]);

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

  const handleUpdateElement = (elementId: string, value: any) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Handle different types of updates
    if (typeof value === 'object') {
      // If value is an object, update the properties directly
      const updatedElements = elements.map(el => {
        if (el.id === elementId) {
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
      setElements(updatedElements);
    } else {
      // If value is a string, update the element state
      setElementState(elementId, value);
    }
  };

  const handleLayoutChange = (elementId: string, property: string, value: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

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
    setElements(updatedElements);
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
                  <div className="container mx-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6" />
                        DragNdrop Labs
                      </h1>
                      <div className="flex gap-2">
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
<<<<<<< HEAD
=======
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
                                  key={item.type}
                                  onClick={() => addElement(item.type as ElementType)}
                                  className={`flex items-center gap-2 p-3 rounded cursor-pointer
                                    ${
                                      theme === "dark"
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-50 hover:bg-gray-100"
                                    }`}
                                >
                                  <item.icon className="w-4 h-4" />
                                  {item.label}
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
                          <PhoneTypeSelector
                            selectedType={selectedPhoneType}
                            onSelectType={(type) => {
                              setSelectedPhoneType(type);
                              if (type.name !== 'Custom') {
                                setCanvasDimensions(type.width, type.height);
                              }
                            }}
                            customWidth={canvasWidth}
                            customHeight={canvasHeight}
                            onCustomWidthChange={(width) => setCanvasDimensions(width, canvasHeight)}
                            onCustomHeightChange={(height) => setCanvasDimensions(canvasWidth, height)}
                            elements={elements}
                            elementStates={elementStates}
                            onElementStateChange={setElementState}
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
                          />
                        ) : (
                          <div
                            id="canvas"
                            className={`rounded-lg shadow p-4 relative overflow-hidden ${
                              theme === "dark" ? "bg-gray-800" : "bg-white"
                            }`}
                            style={{
                              width: `${canvasWidth}px`,
                              height: `${canvasHeight}px`,
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
                                  <PreviewElement
                                    element={element}
                                    value={elementStates[element.id]}
                                    onChange={(value) => setElementState(element.id, value)}
                                    isPreviewMode={isPreviewMode}
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
>>>>>>> main
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
<<<<<<< HEAD

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
                                  key={item.type}
                                  onClick={() => addElement(item.type as ElementType)}
                                  className={`flex items-center gap-2 p-3 rounded cursor-pointer
                                    ${
                                      theme === "dark"
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-50 hover:bg-gray-100"
                                    }`}
                                >
                                  <item.icon className="w-4 h-4" />
                                  {item.label}
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
                                  if (type.name !== 'Custom') {
                                    setCanvasDimensions(type.width, type.height);
                                  }
                                }}
                                customWidth={canvasWidth}
                                customHeight={canvasHeight}
                                onCustomWidthChange={(width) => setCanvasDimensions(width, canvasHeight)}
                                onCustomHeightChange={(height) => setCanvasDimensions(canvasWidth, height)}
                                elements={elements}
                                elementStates={elementStates}
                                onElementStateChange={setElementState}
                                canvasWidth={canvasWidth}
                                canvasHeight={canvasHeight}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            id="canvas"
                            className={`rounded-lg shadow p-4 relative overflow-hidden ${
                              theme === "dark" ? "bg-gray-800" : "bg-white"
                            }`}
                            style={{
                              width: `${canvasWidth}px`,
                              height: `${canvasHeight}px`,
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
                                  <PreviewElement
                                    element={element}
                                    value={elementStates[element.id]}
                                    onChange={(value) => setElementState(element.id, value)}
                                    isPreviewMode={isPreviewMode}
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
=======
>>>>>>> main
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
}: {
  element: any;
  value?: string;
  onChange: (value: string) => void;
  isPreviewMode: boolean;
}) {
  const style = {
    backgroundColor: element.properties.style?.backgroundColor,
    color: element.properties.style?.textColor,
    padding: element.properties.style?.padding,
    borderRadius: element.properties.style?.borderRadius,
    fontSize: element.properties.style?.fontSize,
  };

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

  switch (element.type) {
    case "button":
      return (
        <button
          onClick={() => {
            if (isPreviewMode && element.properties.href) {
              window.open(element.properties.href, '_blank');
            }
          }}
          type={element.properties.type || 'button'}
          disabled={element.properties.disabled || false}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          style={{
            ...style,
            cursor: isPreviewMode && element.properties.href ? 'pointer' : undefined
          }}
          title={isPreviewMode && element.properties.href ? element.properties.href : undefined}
        >
          {value || element.properties.text}
<<<<<<< HEAD
          {isPreviewMode && element.properties.href && (
            <span className="ml-1 text-xs opacity-70">↗</span>
          )}
=======
>>>>>>> main
        </button>
      );
    case "text":
      return (
        <div
          contentEditable={!isPreviewMode}
          suppressContentEditableWarning
          onBlur={(e) => !isPreviewMode && onChange(e.currentTarget.textContent || "")}
          style={style}
          className="outline-none min-w-[50px] min-h-[24px]"
        >
          {value || element.properties.text}
        </div>
      );
    case "input":
      return (
        <input
          type="text"
          value={value !== undefined ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={element.properties.text}
          readOnly={isPreviewMode}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={style}
        />
      );
    case "table":
      return (
        <div className="overflow-x-auto" style={style}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {element.properties.data?.headers.map((header: string, index: number) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {element.properties.data?.rows.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, cellIndex: number) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
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
        <div style={style} className="relative group">
          {value ? (
            <img
              src={value}
              alt="Selected"
              className="w-full h-auto rounded"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
              <Image className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-500">Click to select an image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      );
    case "card":
      return (
        <div className="border rounded-lg shadow-sm" style={style}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {element.properties.text}
            </h3>
            <p className="text-gray-600">Card content goes here</p>
          </div>
        </div>
      );
    case "container":
      return (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative group"
          style={style}
        >
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
          <div className="text-center text-gray-500">
            {element.properties.text || "Container (Drag elements here)"}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default App;