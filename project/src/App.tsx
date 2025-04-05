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
  Group,
  Ungroup,
  Trash2,
  Eye,
  Share2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import StyleEditor from './components/StyleEditor';
import PhoneMockup from './components/PhoneMockup';
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
    loadDesign
  } = useStore();

  const [draggingElement, setDraggingElement] = useState<{ id: string; startX: number; startY: number } | null>(null);

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
    { type: "container", icon: Group, label: "Container" },
  ];

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (isPreviewMode) return;
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    // Calculate the exact cursor position relative to the element
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggingElement({
      id,
      startX: offsetX,
      startY: offsetY,
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
    
    // Calculate new position based on exact cursor position
    let x = e.clientX - canvasRect.left - draggingElement.startX;
    let y = e.clientY - canvasRect.top - draggingElement.startY;

    // Strict boundary constraints
    const minX = 0;
    const minY = 0;
    const maxX = canvasRect.width - elementRect.width;
    const maxY = canvasRect.height - elementRect.height;

    // Ensure element stays within canvas bounds
    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    // Additional checks to prevent any part of the element from leaving the canvas
    if (x < minX) x = minX;
    if (y < minY) y = minY;
    if (x + elementRect.width > canvasRect.width) x = maxX;
    if (y + elementRect.height > canvasRect.height) y = maxY;

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
              <PhoneMockup>
                <div className="p-4">
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className="mb-4"
                      style={{
                        width: element.properties.layout?.width || "100%",
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
              </PhoneMockup>
            ) : (
              <div
                className={`rounded-lg shadow p-4 relative overflow-hidden border-2 border-gray-300 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                  position: 'relative',
                  overflow: 'hidden'
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
                      width: element.properties.layout?.width || "fit-content",
                      height: element.properties.layout?.height || "auto",
                      cursor: draggingElement?.id === element.id ? "grabbing" : "grab",
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      maxWidth: `${canvasWidth}px`,
                      maxHeight: `${canvasHeight}px`
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
  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const baseStyle: React.CSSProperties = {
    backgroundColor: element.properties.style?.backgroundColor || 'transparent',
    color: element.properties.style?.textColor || '#6B7280',
    padding: element.properties.style?.padding || '8px',
    borderRadius: element.properties.style?.borderRadius || '0px',
    fontSize: element.properties.style?.fontSize || '16px',
    position: 'relative' as const,
    width: element.properties.layout?.width || 'fit-content',
    height: element.properties.layout?.height || 'auto'
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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
    
    const currentWidth = parseInt(element.properties.layout?.width?.replace('px', '') || '200');
    const currentHeight = parseInt(element.properties.layout?.height?.replace('px', '') || '200');
    
    setStartSize({
      width: currentWidth,
      height: currentHeight
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startPosition.x;
      const deltaY = e.clientY - startPosition.y;

      const newWidth = Math.max(50, startSize.width + deltaX);
      const newHeight = Math.max(50, startSize.height + deltaY);

      const updatedElement = {
        ...element,
        properties: {
          ...element.properties,
          layout: {
            ...element.properties.layout,
            width: `${newWidth}px`,
            height: `${newHeight}px`
          }
        }
      };

      onChange(JSON.stringify(updatedElement));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const ResizeHandle = () => (
    <div 
      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl-full cursor-nw-resize"
      onMouseDown={handleResizeStart}
      style={{ zIndex: 1000 }}
    />
  );

  const wrapWithResizable = (component: React.ReactNode) => (
    <div 
      className="relative group" 
      style={{ 
        width: element.properties.layout?.width || 'fit-content',
        height: element.properties.layout?.height || 'auto',
        position: 'relative'
      }}
    >
      {component}
      <ResizeHandle />
    </div>
  );

  switch (element.type) {
    case "button":
      return wrapWithResizable(
        <button
          onClick={() => {
            try {
              eval(element.properties.onClick || "");
            } catch (error) {
              console.error("Error executing button action:", error);
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          style={baseStyle}
        >
          {element.properties.text}
        </button>
      );
    case "text":
      return wrapWithResizable(
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const updatedElement = {
              ...element,
              properties: {
                ...element.properties,
                text: e.currentTarget.textContent || ""
              }
            };
            onChange(JSON.stringify(updatedElement));
          }}
          style={baseStyle}
          className="outline-none min-w-[100px] min-h-[24px]"
          dangerouslySetInnerHTML={{ __html: element.properties.text || "Double click to edit" }}
        />
      );
    case "input":
      return wrapWithResizable(
        <div className="flex items-center gap-2" style={baseStyle}>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={element.properties.text}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ ...baseStyle, width: '100%' }}
          />
          <button
            onClick={() => {
              try {
                eval(element.properties.onSubmit || "");
              } catch (error) {
                console.error("Error executing input submit action:", error);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      );
    case "table":
      return wrapWithResizable(
        <div className="overflow-x-auto" style={baseStyle}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 3 }).map((_, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedElement = {
                        ...element,
                        properties: {
                          ...element.properties,
                          headers: {
                            ...element.properties.headers,
                            [i]: e.currentTarget.textContent || `Header ${i + 1}`
                          }
                        }
                      };
                      onChange(JSON.stringify(updatedElement));
                    }}
                  >
                    {element.properties.headers?.[i] || `Header ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 3 }).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedElement = {
                          ...element,
                          properties: {
                            ...element.properties,
                            data: {
                              ...element.properties.data,
                              [`${rowIndex}-${colIndex}`]: e.currentTarget.textContent || `Data ${rowIndex + 1}-${colIndex + 1}`
                            }
                          }
                        };
                        onChange(JSON.stringify(updatedElement));
                      }}
                    >
                      {element.properties.data?.[`${rowIndex}-${colIndex}`] || `Data ${rowIndex + 1}-${colIndex + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "image":
      return wrapWithResizable(
        <div style={baseStyle} className="relative group">
          {value ? (
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover rounded"
              style={{ height: element.properties.layout?.height || "auto" }}
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
      return wrapWithResizable(
        <div className="border rounded-lg shadow-sm" style={baseStyle}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {element.properties.text}
            </h3>
            <p className="text-gray-600">Card content goes here</p>
          </div>
        </div>
      );
    case "container":
      return wrapWithResizable(
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative group"
          style={baseStyle}
        >
          <div>
            {element.properties.text || "Container (Drag elements here)"}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default App;
