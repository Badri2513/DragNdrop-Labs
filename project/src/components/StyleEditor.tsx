import React, { useState } from "react";
import useStore from "../store/useStore";

interface StyleEditorProps {
  elementId: string;
  onUpdate: (id: string, value: any) => void;
  theme: 'light' | 'dark';
  onLayoutChange: (property: string, value: string) => void;
}

interface ElementProperties {
  text?: string;
  onClick?: string;
  href?: string;
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

const StyleEditor: React.FC<StyleEditorProps> = ({ elementId, onUpdate, theme, onLayoutChange }) => {
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
    handleUpdate('href', value);
  };

  return (
    <div className={`p-4 min-w-[320px] ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="space-y-4">
        <h3 className="font-semibold">Style Properties</h3>
        {['button', 'text', 'input'].includes(element.type) && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Text</label>
            <input
              type="text"
              value={element.properties.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              className="block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {element.type === 'button' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">URL Link</label>
            <input
              type="url"
              value={element.properties.href || ''}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://example.com"
              className="block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter URL to make button a link</p>
          </div>
        )}
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

        <h3 className="font-semibold text-gray-700 mt-6">Layout Properties</h3>

        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={element.properties.layout?.width?.replace(/[^0-9.]/g, '') || '100'}
                onChange={(e) => {
                  const value = e.target.value;
                  const unit = element.properties.layout?.width?.match(/[a-zA-Z%]+/)?.[0] || 'px';
                  onLayoutChange('width', `${value}${unit}`);
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={element.properties.layout?.width?.match(/[a-zA-Z%]+/)?.[0] || 'px'}
                onChange={(e) => {
                  const value = element.properties.layout?.width?.replace(/[^0-9.]/g, '') || '100';
                  onLayoutChange('width', `${value}${e.target.value}`);
                }}
                className="w-20 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="px">px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={element.properties.layout?.height?.replace(/[^0-9.]/g, '') || 'auto'}
                onChange={(e) => {
                  const value = e.target.value;
                  const unit = element.properties.layout?.height?.match(/[a-zA-Z%]+/)?.[0] || 'px';
                  onLayoutChange('height', `${value}${unit}`);
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={element.properties.layout?.height?.match(/[a-zA-Z%]+/)?.[0] || 'px'}
                onChange={(e) => {
                  const value = element.properties.layout?.height?.replace(/[^0-9.]/g, '') || 'auto';
                  onLayoutChange('height', `${value}${e.target.value}`);
                }}
                className="w-20 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="px">px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <select
              value={element.properties.layout?.alignment || 'left'}
              onChange={(e) => onLayoutChange('alignment', e.target.value as 'left' | 'center' | 'right')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
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
      </div>
    </div>
  );
};

export default StyleEditor;
