import React, { useCallback, useEffect, useState } from 'react';
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
  Share2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import StyleEditor from './components/StyleEditor';
import PhoneTypeSelector from './components/PhoneTypeSelector';
import ComponentTree from './components/ComponentTree';
import useStore from './store/useStore';

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
    setCanvasDimensions
  } = useStore();

  const [draggingElement, setDraggingElement] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [selectedPhoneType, setSelectedPhoneType] = useState({
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const designParam = params.get('design');
    
    if (designParam) {
      try {
        const decodedData = JSON.parse(atob(designParam));
        loadDesign(decodedData);
      } catch (error) {
        console.error('Error loading design from URL:', error);
        alert('Invalid design data in URL');
      }
    }
  }, [loadDesign]);

  const toolboxItems = [
    { type: "button", icon: ButtonIcon, label: "Button" },
    { type: "text", icon: Type, label: "Text" },
    { type: "input", icon: Type, label: "Input" },
    { type: "table", icon: Table2, label: "Table" },
    { type: "image", icon: Image, label: "Image" },
    { type: "card", icon: CreditCard, label: "Card" },
    { type: "container", icon: Group, label: "Container" },
  ];

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (isPreviewMode) return;
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setDraggingElement({
      id,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
    });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!draggingElement) return;
    const element = document.getElementById(draggingElement.id);
    if (!element) return;

    const canvas = element.parentElement;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate new position
    let x = e.clientX - canvasRect.left - draggingElement.startX;
    let y = e.clientY - canvasRect.top - draggingElement.startY;

    // Constrain to canvas bounds
    x = Math.max(0, Math.min(x, canvasRect.width - elementRect.width));
    y = Math.max(0, Math.min(y, canvasRect.height - elementRect.height));

    updateElementPosition(draggingElement.id, x, y);
  }, [draggingElement, updateElementPosition]);

  const handleDragEnd = useCallback(() => {
    setDraggingElement(null);
  }, []);

  useEffect(() => {
    if (draggingElement) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggingElement, handleDragMove, handleDragEnd]);

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

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"
      }`}
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6" />
            DragNdrop Labs
          </h1>
          <div className="flex gap-2">
            <button
              onClick={togglePreviewMode}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
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
            <div className="w-64 flex flex-col gap-4">
              <ComponentTree
                elements={elements}
                selectedElement={selectedElement}
                onSelect={selectElement}
                theme={theme}
              />
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

              <div className={`mt-4 rounded-lg shadow p-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}>
                <h2 className="font-semibold mb-4">Export & Share</h2>
                <div className="space-y-2">
                  <button
                    onClick={handleExportJSON}
                    className={`w-full flex items-center gap-2 p-3 rounded transition-colors
                      ${theme === "dark" 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                  >
                    <Download className="w-4 h-4" />
                    Export to JSON
                  </button>
                  <button
                    onClick={handleShare}
                    className={`w-full flex items-center gap-2 p-3 rounded transition-colors
                      ${theme === "dark" 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-green-500 hover:bg-green-600 text-white"}`}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Design
                  </button>
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
              >
                <div
                  className={`rounded-lg shadow p-4 relative overflow-hidden ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                  style={{
                    width: `${canvasWidth}px`,
                    height: `${canvasHeight}px`,
                  }}
                >
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className="mb-4"
                      style={{
                        width: element.properties.layout?.width || "100%",
                        textAlign: element.properties.layout?.alignment || "left",
                      }}
                    >
                      <PreviewElement
                        element={element}
                        value={elementStates[element.id]}
                        onChange={(value) => setElementState(element.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </PhoneTypeSelector>
            ) : (
              <div
                className={`rounded-lg shadow p-4 relative overflow-hidden ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                }}
                onClick={handleCanvasClick}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    id={element.id}
                    onMouseDown={(e) => handleDragStart(e, element.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      !draggingElement && handleElementSelect(element.id);
                    }}
                    className={`inline-block ${
                      !isPreviewMode && selectedElement === element.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    style={{
                      position: (element.properties.layout?.position as Position) || "absolute",
                      left: element.properties.layout?.left || "50%",
                      top: element.properties.layout?.top || "50%",
                      transform: element.properties.layout?.transform || "translate(-50%, -50%)",
                      width: "fit-content",
                      cursor: draggingElement?.id === element.id ? "grabbing" : "grab",
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
        </div>
      </div>

      {!isPreviewMode && (
        <StyleEditor elementId={selectedElement} position="floating" />
      )}
    </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Header 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Header 2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Data 1</td>
                <td className="px-6 py-4 whitespace-nowrap">Data 2</td>
              </tr>
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
