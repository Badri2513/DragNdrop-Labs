import React from 'react';
import useStore from '../store/useStore';

interface StyleEditorProps {
  elementId: string;
}

export default function StyleEditor({ elementId }: StyleEditorProps) {
  const element = useStore((state) => 
    state.elements.find((el) => el.id === elementId)
  );
  const updateElement = useStore((state) => state.updateElement);

  if (!element) return null;

  const { style = {}, layout = {} } = element.properties;

  const handleStyleChange = (property: string, value: string) => {
    updateElement(elementId, {
      style: { ...style, [property]: value },
    });
  };

  const handleLayoutChange = (property: string, value: string) => {
    updateElement(elementId, {
      layout: { ...layout, [property]: value },
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-4">
      <h3 className="font-semibold text-gray-700">Style Properties</h3>
      
      <div className="space-y-2">
        <label className="block text-sm text-gray-600">
          Background Color
          <input
            type="color"
            value={style.backgroundColor || '#ffffff'}
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            className="block w-full mt-1"
          />
        </label>

        <label className="block text-sm text-gray-600">
          Text Color
          <input
            type="color"
            value={style.textColor || '#000000'}
            onChange={(e) => handleStyleChange('textColor', e.target.value)}
            className="block w-full mt-1"
          />
        </label>

        <label className="block text-sm text-gray-600">
          Padding
          <select
            value={style.padding || '1rem'}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
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
            value={style.borderRadius || '0.5rem'}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
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
            value={style.fontSize || '1rem'}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
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
        <label className="block text-sm text-gray-600">
          Width
          <select
            value={layout.width || '100%'}
            onChange={(e) => handleLayoutChange('width', e.target.value)}
            className="block w-full mt-1 rounded border-gray-300"
          >
            <option value="25%">25%</option>
            <option value="50%">50%</option>
            <option value="75%">75%</option>
            <option value="100%">100%</option>
          </select>
        </label>

        <label className="block text-sm text-gray-600">
          Alignment
          <select
            value={layout.alignment || 'left'}
            onChange={(e) => handleLayoutChange('alignment', e.target.value as 'left' | 'center' | 'right')}
            className="block w-full mt-1 rounded border-gray-300"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
    </div>
  );
}