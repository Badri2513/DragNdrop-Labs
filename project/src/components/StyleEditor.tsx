import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Element } from '../store/useStore';

interface StyleEditorProps {
  elementId: string;
  onUpdate: (elementId: string, value: any) => void;
  theme: 'light' | 'dark';
  onLayoutChange: (property: string, value: string) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ elementId, onUpdate, theme, onLayoutChange }) => {
  const { elements, elementStates, setElementState } = useStore();
  const element = elements.find(el => el.id === elementId);
  const [localState, setLocalState] = useState(element?.properties || {});

  useEffect(() => {
    setLocalState(element?.properties || {});
  }, [elementId, element]);

  const handleChange = (property: string, value: any) => {
    setLocalState(prev => {
      const newState = { ...prev, [property]: value };
      onUpdate(elementId, newState);
      return newState;
    });
  };

  const handleTextChange = (value: string) => {
    setElementState(elementId, value);
  };

  if (!element) return null;

  const renderCommonProperties = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Position</label>
        <select
          value={localState.layout?.position || 'absolute'}
          onChange={(e) => handleChange('layout', { ...localState.layout, position: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="absolute">Absolute</option>
          <option value="relative">Relative</option>
          <option value="fixed">Fixed</option>
          <option value="static">Static</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Z-Index</label>
        <input
          type="number"
          value={localState.layout?.zIndex || 1}
          onChange={(e) => handleChange('layout', { ...localState.layout, zIndex: parseInt(e.target.value) })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={localState.style?.opacity || 1}
          onChange={(e) => handleChange('style', { ...localState.style, opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Visibility</label>
        <select
          value={localState.style?.visibility || 'visible'}
          onChange={(e) => handleChange('style', { ...localState.style, visibility: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
    </>
  );

  const renderButtonProperties = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Button Type</label>
        <select
          value={localState.type || 'button'}
          onChange={(e) => handleChange('type', e.target.value)}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="button">Button</option>
          <option value="submit">Submit</option>
          <option value="reset">Reset</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Link URL</label>
        <input
          type="text"
          value={localState.href || ''}
          onChange={(e) => handleChange('href', e.target.value)}
          placeholder="https://example.com"
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localState.disabled || false}
            onChange={(e) => handleChange('disabled', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Disabled</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Button Text</label>
        <input
          type="text"
          value={elementStates[elementId] || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Button Text"
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Border Style</label>
        <select
          value={localState.style?.borderStyle || 'solid'}
          onChange={(e) => handleChange('style', { ...localState.style, borderStyle: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Border Width</label>
        <input
          type="text"
          value={localState.style?.borderWidth || '1px'}
          onChange={(e) => handleChange('style', { ...localState.style, borderWidth: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Border Color</label>
        <input
          type="color"
          value={localState.style?.borderColor || '#000000'}
          onChange={(e) => handleChange('style', { ...localState.style, borderColor: e.target.value })}
          className="w-full h-10 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Hover Background Color</label>
        <input
          type="color"
          value={localState.style?.hoverBackgroundColor || '#000000'}
          onChange={(e) => handleChange('style', { ...localState.style, hoverBackgroundColor: e.target.value })}
          className="w-full h-10 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Hover Text Color</label>
        <input
          type="color"
          value={localState.style?.hoverTextColor || '#000000'}
          onChange={(e) => handleChange('style', { ...localState.style, hoverTextColor: e.target.value })}
          className="w-full h-10 rounded"
        />
      </div>
    </>
  );

  const renderInputProperties = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Input Type</label>
        <select
          value={localState.type || 'text'}
          onChange={(e) => handleChange('type', e.target.value)}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="text">Text</option>
          <option value="password">Password</option>
          <option value="email">Email</option>
          <option value="number">Number</option>
          <option value="tel">Telephone</option>
          <option value="url">URL</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Placeholder</label>
        <input
          type="text"
          value={localState.placeholder || ''}
          onChange={(e) => handleChange('placeholder', e.target.value)}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localState.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Required</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localState.disabled || false}
            onChange={(e) => handleChange('disabled', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Disabled</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Max Length</label>
        <input
          type="number"
          value={localState.maxLength || ''}
          onChange={(e) => handleChange('maxLength', e.target.value ? parseInt(e.target.value) : '')}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>
    </>
  );

  const renderTextProperties = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Text Content</label>
        <textarea
          value={elementStates[elementId] || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Font Family</label>
        <select
          value={localState.style?.fontFamily || 'Arial'}
          onChange={(e) => handleChange('style', { ...localState.style, fontFamily: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Font Weight</label>
        <select
          value={localState.style?.fontWeight || 'normal'}
          onChange={(e) => handleChange('style', { ...localState.style, fontWeight: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
          <option value="bolder">Bolder</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Text Align</label>
        <select
          value={localState.style?.textAlign || 'left'}
          onChange={(e) => handleChange('style', { ...localState.style, textAlign: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Text Decoration</label>
        <select
          value={localState.style?.textDecoration || 'none'}
          onChange={(e) => handleChange('style', { ...localState.style, textDecoration: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="none">None</option>
          <option value="underline">Underline</option>
          <option value="line-through">Line Through</option>
          <option value="overline">Overline</option>
        </select>
      </div>
    </>
  );

  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      
      {renderCommonProperties()}

      {element.type === 'button' && renderButtonProperties()}
      {element.type === 'input' && renderInputProperties()}
      {element.type === 'text' && renderTextProperties()}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Background Color</label>
        <input
          type="color"
          value={localState.style?.backgroundColor || '#ffffff'}
          onChange={(e) => handleChange('style', { ...localState.style, backgroundColor: e.target.value })}
          className="w-full h-10 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Text Color</label>
        <input
          type="color"
          value={localState.style?.textColor || '#000000'}
          onChange={(e) => handleChange('style', { ...localState.style, textColor: e.target.value })}
          className="w-full h-10 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Font Size</label>
        <input
          type="text"
          value={localState.style?.fontSize || '16px'}
          onChange={(e) => handleChange('style', { ...localState.style, fontSize: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Padding</label>
        <input
          type="text"
          value={localState.style?.padding || '10px'}
          onChange={(e) => handleChange('style', { ...localState.style, padding: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Border Radius</label>
        <input
          type="text"
          value={localState.style?.borderRadius || '4px'}
          onChange={(e) => handleChange('style', { ...localState.style, borderRadius: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Width</label>
        <input
          type="text"
          value={localState.layout?.width || 'auto'}
          onChange={(e) => handleChange('layout', { ...localState.layout, width: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Height</label>
        <input
          type="text"
          value={localState.layout?.height || 'auto'}
          onChange={(e) => handleChange('layout', { ...localState.layout, height: e.target.value })}
          className={`w-full p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}
        />
      </div>
    </div>
  );
};

export default StyleEditor;
