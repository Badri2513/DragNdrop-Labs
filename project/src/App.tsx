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
  Palette
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
      elements,
      elementStates,
      theme,
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

  const handleShare = () => {
    const designData = {
      elements,
      elementStates,
      theme,
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
    // Clear the canvas for the new project
    setElements([]);
    Object.keys(elementStates).forEach(id => setElementState(id, ''));
  };

  const handleOpenProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      // Load project data from localStorage
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

  // Save project data when elements or states change
  useEffect(() => {
    if (selectedElement) {
      const projectId = selectedElement.split('_')[0];
      localStorage.setItem(`project_${projectId}`, JSON.stringify({
        elements,
        elementStates
      }));
    }
  }, [elements, elementStates, selectedElement]);

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
                      {!isPreviewMode && (
                        <div className="w-64">
                          <div
                            className={`rounded-lg shadow p-4 ${
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
                        </div>
                      )}

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
                                  transform: `translate(${element.properties.layout?.left || "50%"}%, ${element.properties.layout?.top || "50%"}%)`,
                                  width: "fit-content",
                                  transition: draggingElement?.id === element.id ? 'none' : 'all 0.2s ease-out',
                                  zIndex: draggingElement?.id === element.id ? 50 : 1,
                                }}
                              >
                                <div style={{ width: element.properties.layout?.width || "auto" }}>
                                  <PreviewElement
                                    element={element}
                                    value={elementStates[element.id]}
                                    onChange={(value) => setElementState(element.id, value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {!isPreviewMode && (
                        <div className="w-80 flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setActiveTab('elements')}
                              className={`p-2 rounded flex items-center gap-2 ${
                                activeTab === 'elements'
                                  ? theme === 'dark'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-500 text-white'
                                  : theme === 'dark'
                                  ? 'hover:bg-gray-700'
                                  : 'hover:bg-gray-200'
                              }`}
                            >
                              <Layers className="w-4 h-4" />
                              Elements
                            </button>
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
                            {activeTab === 'elements' && (
                              <ComponentTree
                                elements={elements}
                                selectedElement={selectedElement}
                                onSelect={selectElement}
                                theme={theme}
                              />
                            )}
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
                      )}
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
}: {
  element: any;
  value?: string;
  onChange: (value: string) => void;
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
            try {
              // eslint-disable-next-line no-eval
              eval(element.properties.onClick || "");
            } catch (error) {
              console.error("Error executing button action:", error);
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          style={style}
        >
          {element.properties.text}
        </button>
      );
    case "text":
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || "")}
          style={style}
          className="outline-none"
        >
          {element.properties.text}
        </div>
      );
    case "input":
      return (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={element.properties.text}
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