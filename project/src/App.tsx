import React, { useCallback, useState } from "react";
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
  EyeOff,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import StyleEditor from "./components/StyleEditor";
import useStore from "./store/useStore";
import { PhoneMockup } from "./components/PhoneMockup";

function App() {
  const {
    elements,
    elementStates,
    selectedElement,
    theme,
    addElement,
    moveElement,
    setElementState,
    undo,
    redo,
    toggleTheme,
    selectElement,
    removeElement,
    groupElements,
    ungroupElements,
  } = useStore();

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const toolboxItems = [
    { type: "button", icon: ButtonIcon, label: "Button" },
    { type: "text", icon: Type, label: "Text" },
    { type: "input", icon: Type, label: "Input" },
    { type: "table", icon: Table2, label: "Table" },
    { type: "image", icon: Image, label: "Image" },
    { type: "card", icon: CreditCard, label: "Card" },
    { type: "container", icon: Group, label: "Container" },
  ];

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      if (result.source.droppableId === "toolbox") {
        const type = result.draggableId as any;
        addElement(type);
      } else {
        moveElement(result.source.index, result.destination.index);
      }
    },
    [addElement, moveElement]
  );

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
            No-Code Builder
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title={isPreviewMode ? "Exit Preview" : "Preview"}
            >
              {isPreviewMode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {!isPreviewMode && (
              <div className="w-64">
                <div
                  className={`rounded-lg shadow p-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h2 className="font-semibold mb-4">Toolbox</h2>
                  <Droppable droppableId="toolbox" isDropDisabled={true}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {toolboxItems.map((item, index) => (
                          <Draggable
                            key={item.type}
                            draggableId={item.type}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-2 p-3 rounded cursor-move
                                  ${
                                    theme === "dark"
                                      ? "bg-gray-700 hover:bg-gray-600"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }`}
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* {selectedElement && (
                  <div className={`mt-4 rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <StyleEditor elementId={selectedElement} />
                  </div>
                )} */}
              </div>
            )}

            <div
              className={`flex-1 ${
                isPreviewMode ? "flex justify-center items-start pt-8" : ""
              }`}
            >
              <Droppable droppableId="canvas" isDropDisabled={isPreviewMode}>
                {(provided) => (
                  <>
                    {isPreviewMode ? (
                      <PhoneMockup>
                        <div className="p-4">
                          {elements.map((element, index) => (
                            <div
                              key={element.id}
                              className="mb-4"
                              style={{
                                width:
                                  element.properties.layout?.width || "100%",
                                textAlign:
                                  element.properties.layout?.alignment ||
                                  "left",
                              }}
                            >
                              <PreviewElement
                                element={element}
                                value={elementStates[element.id]}
                                onChange={(value) =>
                                  setElementState(element.id, value)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </PhoneMockup>
                    ) : (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[600px] rounded-lg shadow p-4 ${
                          theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        {elements.map((element, index) => (
                          <Draggable
                            key={element.id}
                            draggableId={element.id}
                            index={index}
                            isDragDisabled={isPreviewMode}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-4 ${
                                  !isPreviewMode &&
                                  selectedElement === element.id
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                }`}
                                onClick={() =>
                                  !isPreviewMode &&
                                  handleElementSelect(element.id)
                                }
                                style={{
                                  width:
                                    element.properties.layout?.width || "100%",
                                  textAlign:
                                    element.properties.layout?.alignment ||
                                    "left",
                                }}
                              >
                                <PreviewElement
                                  element={element}
                                  value={elementStates[element.id]}
                                  onChange={(value) =>
                                    setElementState(element.id, value)
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )}
                    {!isPreviewMode && provided.placeholder}
                  </>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>

      {!isPreviewMode && selectedElement && (
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
      return <p style={style}>{element.properties.text}</p>;
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
        <div style={style}>
          <img
            src="https://source.unsplash.com/random/800x400"
            alt="Random"
            className="w-full h-auto rounded"
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
          className="border-2 border-dashed border-gray-300 rounded-lg p-4"
          style={style}
        >
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
