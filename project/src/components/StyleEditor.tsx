import React, { useState } from "react";
import useStore from "../store/useStore";

interface StyleEditorProps {
  elementId: string;
  onUpdate: (id: string, value: any) => void;
  theme: 'light' | 'dark';
}

interface ElementProperties {
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
  };
  data?: any;
  [key: string]: any;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ elementId, onUpdate, theme }) => {
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

  const handleUpdate = (property: string, value: any) => {
    const updatedProperties: ElementProperties = { ...element.properties };

    if (property === 'style') {
      updatedProperties.style = {
        ...(element.properties.style || {}),
        ...value
      };
    } else if (property === 'layout') {
      updatedProperties.layout = {
        ...(element.properties.layout || {}),
        ...value
      };
    } else {
      updatedProperties[property] = value;
    }

    onUpdate(elementId, updatedProperties);
  };

  const handleTextChange = (value: string) => {
    handleUpdate('text', value);
  };

  const handleLinkChange = (value: string) => {
    handleUpdate('onClick', `window.location.href = '${value || '#'}'`);
  };

  return (
    <div className={`p-4 min-w-[320px] ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="space-y-4">
        <h3 className="font-semibold">Style Properties</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Background Color</label>
          <input
            type="color"
            value={style.backgroundColor || "#ffffff"}
            onChange={(e) => handleUpdate('style', { backgroundColor: e.target.value })}
            className="block w-full mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Text Color</label>
          <input
            type="color"
            value={style.textColor || "#000000"}
            onChange={(e) => handleUpdate('style', { textColor: e.target.value })}
            className="block w-full mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Padding</label>
          <select
            value={style.padding || "1rem"}
            onChange={(e) => handleUpdate('style', { padding: e.target.value })}
            className="block w-full mt-1 rounded border-gray-300"
          >
            <option value="0.5rem">Small</option>
            <option value="1rem">Medium</option>
            <option value="1.5rem">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Border Radius</label>
          <input
            type="text"
            value={style.borderRadius || "0.5rem"}
            onChange={(e) => handleUpdate('style', { borderRadius: e.target.value })}
            className="block w-full mt-1 rounded border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Font Size</label>
          <select
            value={style.fontSize || "1rem"}
            onChange={(e) => handleUpdate('style', { fontSize: e.target.value })}
            className="block w-full mt-1 rounded border-gray-300"
          >
            <option value="0.875rem">Small</option>
            <option value="1rem">Medium</option>
            <option value="1.25rem">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Width</label>
          <input
            type="text"
            value={element.properties.layout?.width || '100%'}
            onChange={(e) => handleUpdate('layout', { width: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Height</label>
          <input
            type="text"
            value={element.properties.layout?.height || 'auto'}
            onChange={(e) => handleUpdate('layout', { height: e.target.value })}
            placeholder="e.g., 200px, 50%, auto"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alignment</label>
          <select
            value={element.properties.layout?.alignment || 'left'}
            onChange={(e) => handleUpdate('layout', { alignment: e.target.value as 'left' | 'center' | 'right' })}
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
};

export default StyleEditor;
