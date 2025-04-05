import React, { useState } from "react";
import useStore from "../store/useStore";

interface StyleEditorProps {
  elementId: string | null;
  position?: "sidebar" | "floating";
}

export default function StyleEditor({
  elementId,
  position = "floating",
}: StyleEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { elements, updateElement, canvasWidth, canvasHeight, setCanvasDimensions } = useStore();
  const element = elementId ? elements.find((el) => el.id === elementId) : null;

  if (!element && !elementId) {
    // Show canvas controls when no element is selected
    return (
      <>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed right-80 top-4 bg-white p-2 rounded-l shadow-lg border border-r-0 border-gray-200"
        >
          {isOpen ? "→" : "←"}
        </button>
        <div
          className={`fixed right-0 top-0 h-screen bg-white shadow-lg border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
            isOpen ? "w-80" : "w-0"
          }`}
        >
          <div className="p-4 min-w-[320px]">
            <h3 className="font-semibold text-gray-700 mb-4">Canvas Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Canvas Width (px)</label>
                <input
                  type="number"
                  value={canvasWidth || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    setCanvasDimensions(value, canvasHeight);
                  }}
                  min="100"
                  max="2000"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Canvas Height (px)</label>
                <input
                  type="number"
                  value={canvasHeight || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    setCanvasDimensions(canvasWidth, value);
                  }}
                  min="100"
                  max="2000"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!element) return null;

  const { style = {}, layout = {} } = element.properties;

  const handleStyleChange = (property: string, value: string) => {
    if (!elementId) return;
    updateElement(elementId, {
      style: { ...style, [property]: value },
    });
  };

  const handleLayoutChange = (property: string, value: string) => {
    if (!elementId) return;
    updateElement(elementId, {
      layout: { ...layout, [property]: value },
    });
  };

  const handleTextChange = (value: string) => {
    if (!elementId) return;
    updateElement(elementId, {
      text: value,
    });
  };

  const handleLinkChange = (value: string) => {
    if (!elementId) return;
    updateElement(elementId, {
      onClick: `window.location.href = '${value || '#'}'`,
    });
  };

  if (position === "sidebar") {
    return (
      <div className="p-4 min-w-[320px]">
        <h3 className="font-semibold text-gray-700">Style Properties</h3>

        <div className="space-y-2">
          <label className="block text-sm text-gray-600">
            Text
            <input
              type="text"
              value={element.properties.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              className="block w-full mt-1"
            />
          </label>

          {element.type === 'button' && (
            <div>
              <label className="block text-sm text-gray-600">
                Link URL
                <input
                  type="text"
                  value={element.properties.onClick?.replace("window.location.href = '", "").replace("'", "") || ''}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="Enter URL"
                  className="block w-full mt-1"
                />
              </label>
            </div>
          )}

          <label className="block text-sm text-gray-600">
            Background Color
            <input
              type="color"
              value={style.backgroundColor || "#ffffff"}
              onChange={(e) =>
                handleStyleChange("backgroundColor", e.target.value)
              }
              className="block w-full mt-1"
            />
          </label>

          <label className="block text-sm text-gray-600">
            Text Color
            <input
              type="color"
              value={style.textColor || "#000000"}
              onChange={(e) => handleStyleChange("textColor", e.target.value)}
              className="block w-full mt-1"
            />
          </label>

          <label className="block text-sm text-gray-600">
            Padding
            <select
              value={style.padding || "1rem"}
              onChange={(e) => handleStyleChange("padding", e.target.value)}
              className="block w-full mt-1 rounded border-gray-300"
            >
              <option value="0.5rem">Small</option>
              <option value="1rem">Medium</option>
              <option value="2rem">Large</option>
            </select>
          </label>

          <label className="block text-sm text-gray-600">
            Border Radius
            <select
              value={style.borderRadius || "0.5rem"}
              onChange={(e) =>
                handleStyleChange("borderRadius", e.target.value)
              }
              className="block w-full mt-1 rounded border-gray-300"
            >
              <option value="0">None</option>
              <option value="0.5rem">Small</option>
              <option value="1rem">Medium</option>
              <option value="9999px">Full</option>
            </select>
          </label>

          <label className="block text-sm text-gray-600">
            Font Size
            <select
              value={style.fontSize || "1rem"}
              onChange={(e) => handleStyleChange("fontSize", e.target.value)}
              className="block w-full mt-1 rounded border-gray-300"
            >
              <option value="0.875rem">Small</option>
              <option value="1rem">Medium</option>
              <option value="1.25rem">Large</option>
              <option value="1.5rem">Extra Large</option>
            </select>
          </label>
        </div>

        <h3 className="font-semibold text-gray-700 mt-6">Layout Properties</h3>

        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="text"
              value={element.properties.layout?.width || '100%'}
              onChange={(e) => handleLayoutChange('width', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {element.type === 'container' && (
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="text"
                value={element.properties.layout?.height || 'auto'}
                onChange={(e) => handleLayoutChange('height', e.target.value)}
                placeholder="e.g., 200px, 50%, auto"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <select
              value={element.properties.layout?.alignment || 'left'}
              onChange={(e) => handleLayoutChange('alignment', e.target.value as 'left' | 'center' | 'right')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-80 top-4 bg-white p-2 rounded-l shadow-lg border border-r-0 border-gray-200"
      >
        {isOpen ? "→" : "←"}
      </button>
      <div
        className={`fixed right-0 top-0 h-screen bg-white shadow-lg border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
          isOpen ? "w-80" : "w-0"
        }`}
      >
        <div className="p-4 min-w-[320px]">
          <h3 className="font-semibold text-gray-700">Style Properties</h3>

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">
              Text
              <input
                type="text"
                value={element.properties.text || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                className="block w-full mt-1"
              />
            </label>

            {element.type === 'button' && (
              <div>
                <label className="block text-sm text-gray-600">
                  Link URL
                  <input
                    type="text"
                    value={element.properties.onClick?.replace("window.location.href = '", "").replace("'", "") || ''}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    placeholder="Enter URL"
                    className="block w-full mt-1"
                  />
                </label>
              </div>
            )}

            <label className="block text-sm text-gray-600">
              Background Color
              <input
                type="color"
                value={style.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleStyleChange("backgroundColor", e.target.value)
                }
                className="block w-full mt-1"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Text Color
              <input
                type="color"
                value={style.textColor || "#000000"}
                onChange={(e) => handleStyleChange("textColor", e.target.value)}
                className="block w-full mt-1"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Padding
              <select
                value={style.padding || "1rem"}
                onChange={(e) => handleStyleChange("padding", e.target.value)}
                className="block w-full mt-1 rounded border-gray-300"
              >
                <option value="0.5rem">Small</option>
                <option value="1rem">Medium</option>
                <option value="2rem">Large</option>
              </select>
            </label>

            <label className="block text-sm text-gray-600">
              Border Radius
              <select
                value={style.borderRadius || "0.5rem"}
                onChange={(e) =>
                  handleStyleChange("borderRadius", e.target.value)
                }
                className="block w-full mt-1 rounded border-gray-300"
              >
                <option value="0">None</option>
                <option value="0.5rem">Small</option>
                <option value="1rem">Medium</option>
                <option value="9999px">Full</option>
              </select>
            </label>

            <label className="block text-sm text-gray-600">
              Font Size
              <select
                value={style.fontSize || "1rem"}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                className="block w-full mt-1 rounded border-gray-300"
              >
                <option value="0.875rem">Small</option>
                <option value="1rem">Medium</option>
                <option value="1.25rem">Large</option>
                <option value="1.5rem">Extra Large</option>
              </select>
            </label>
          </div>

          <h3 className="font-semibold text-gray-700 mt-6">
            Layout Properties
          </h3>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input
                type="text"
                value={element.properties.layout?.width || '100%'}
                onChange={(e) => handleLayoutChange('width', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {element.type === 'container' && (
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="text"
                  value={element.properties.layout?.height || 'auto'}
                  onChange={(e) => handleLayoutChange('height', e.target.value)}
                  placeholder="e.g., 200px, 50%, auto"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={element.properties.layout?.alignment || 'left'}
                onChange={(e) => handleLayoutChange('alignment', e.target.value as 'left' | 'center' | 'right')}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
