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
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'content' | 'advanced'>('style');

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

  const isDarkMode = theme === 'dark';
  const baseBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const baseText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const sectionBg = isDarkMode ? 'bg-gray-750' : 'bg-gray-50';
  
    return (
    <div className={`${baseBg} ${baseText} rounded-lg overflow-hidden`}>
      {/* Tabs */}
      <div className="flex border-b ${borderColor} bg-opacity-50">
        <button
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'style' 
              ? isDarkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-white border-b-2 border-blue-500'
              : 'hover:bg-opacity-10 hover:bg-gray-500'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'layout'
              ? isDarkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-white border-b-2 border-blue-500'
              : 'hover:bg-opacity-10 hover:bg-gray-500'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'content'
              ? isDarkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-white border-b-2 border-blue-500'
              : 'hover:bg-opacity-10 hover:bg-gray-500'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'advanced'
              ? isDarkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-white border-b-2 border-blue-500'
              : 'hover:bg-opacity-10 hover:bg-gray-500'
          }`}
        >
          Advanced
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Style Tab */}
        {activeTab === 'style' && (
            <div className="space-y-4">
            <div className={`p-3 ${sectionBg} rounded-lg`}>
              <h3 className="text-sm font-semibold mb-2">Colors</h3>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm">Background</label>
                  <div 
                    className="w-6 h-6 rounded border shadow" 
                    style={{ backgroundColor: localState.style?.backgroundColor || '#ffffff' }}
                  />
                </div>
                <input
                  type="color"
                  value={localState.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleChange('style', { ...localState.style, backgroundColor: e.target.value })}
                  className="w-full h-8 p-0 rounded"
                />
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm">Text Color</label>
                  <div 
                    className="w-6 h-6 rounded border shadow" 
                    style={{ backgroundColor: localState.style?.textColor || '#000000' }}
                  />
                </div>
                <input
                  type="color"
                  value={localState.style?.textColor || '#000000'}
                  onChange={(e) => handleChange('style', { ...localState.style, textColor: e.target.value })}
                  className="w-full h-8 p-0 rounded"
                />
              </div>
            </div>

            <div className={`p-3 ${sectionBg} rounded-lg`}>
              <h3 className="text-sm font-semibold mb-2">Dimensions</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Text Properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Font Size</label>
                      <input
                        type="number"
                        value={localState.style?.fontSize || '16px'}
                        onChange={(e) => handleChange('style', { ...localState.style, fontSize: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Font Weight</label>
                      <select
                        value={localState.style?.fontWeight || 'normal'}
                        onChange={(e) => handleChange('style', { ...localState.style, fontWeight: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
            </div>
          </div>
        </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Layout Properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Width</label>
                      <input
                        type="text"
                        value={localState.layout?.width || 'auto'}
                        onChange={(e) => handleChange('layout', { ...localState.layout, width: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Height</label>
                      <input
                        type="text"
                        value={localState.layout?.height || 'auto'}
                        onChange={(e) => handleChange('layout', { ...localState.layout, height: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {element.type === 'button' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Button Styling</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Border Style</label>
                  <select
                    value={localState.style?.borderStyle || 'solid'}
                    onChange={(e) => handleChange('style', { ...localState.style, borderStyle: e.target.value })}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1">Border Width</label>
                  <input
                    type="text"
                    value={localState.style?.borderWidth || '1px'}
                    onChange={(e) => handleChange('style', { ...localState.style, borderWidth: e.target.value })}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    placeholder="e.g. 1px"
                  />
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm">Border Color</label>
                    <div 
                      className="w-6 h-6 rounded border shadow" 
                      style={{ backgroundColor: localState.style?.borderColor || '#000000' }}
                    />
                  </div>
          <input
            type="color"
                    value={localState.style?.borderColor || '#000000'}
                    onChange={(e) => handleChange('style', { ...localState.style, borderColor: e.target.value })}
                    className="w-full h-8 p-0 rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className={`p-3 ${sectionBg} rounded-lg`}>
              <h3 className="text-sm font-semibold mb-2">Position</h3>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Position</label>
                <select
                  value={localState.layout?.position || 'absolute'}
                  onChange={(e) => handleChange('layout', { ...localState.layout, position: e.target.value })}
                  className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                >
                  <option value="absolute">Absolute</option>
                  <option value="relative">Relative</option>
                  <option value="fixed">Fixed</option>
                  <option value="static">Static</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-sm mb-1">Left</label>
                  <input
                    type="text"
                    value={localState.layout?.left || '0px'}
                    onChange={(e) => onLayoutChange('left', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    placeholder="e.g. 10px or 50%"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1">Top</label>
                  <input
                    type="text"
                    value={localState.layout?.top || '0px'}
                    onChange={(e) => onLayoutChange('top', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    placeholder="e.g. 10px or 50%"
                  />
                </div>
              </div>
            </div>

            <div className={`p-3 ${sectionBg} rounded-lg`}>
              <h3 className="text-sm font-semibold mb-2">Placement</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-sm mb-1">Z-Index</label>
                  <input
                    type="number"
                    value={localState.layout?.zIndex || 1}
                    onChange={(e) => handleChange('layout', { ...localState.layout, zIndex: parseInt(e.target.value) })}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {element.type === 'text' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Text Content</h3>
                
                <div className="mb-3">
                  <textarea
                    value={elementStates[elementId] || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder} min-h-[100px]`}
                    placeholder="Enter text content"
          />
        </div>
              </div>
            )}

            {element.type === 'button' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Button Properties</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Button Text</label>
          <input
                    type="text"
                    value={elementStates[elementId] || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    placeholder="Button Text"
          />
        </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1">Button Type</label>
          <select
                    value={localState.type || 'button'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                  >
                    <option value="button">Button</option>
                    <option value="submit">Submit</option>
                    <option value="reset">Reset</option>
          </select>
        </div>

                <div className="mb-3">
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
              </div>
            )}

            {element.type === 'input' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Input Properties</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Input Type</label>
                  <select
                    value={localState.type || 'text'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                  >
                    <option value="text">Text</option>
                    <option value="password">Password</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="tel">Telephone</option>
                    <option value="url">URL</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1">Placeholder</label>
                  <input
                    type="text"
                    value={localState.placeholder || ''}
                    onChange={(e) => handleChange('placeholder', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                  />
                </div>

                <div className="mb-3">

                  <label className="block text-sm mb-1">Destination Table</label>
                  <select
                    value={localState.destinationTableId || ''}
                    onChange={(e) => handleChange('destinationTableId', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                  >
                    <option value="">Select a table...</option>
                    {elements
                      .filter((el) => el.type === 'table')
                      .map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.properties.text || `Table ${table.id.slice(0, 4)}`}
                        </option>
                      ))}
                  </select>

                </div>
              </div>
            )}

            {element.type === 'button' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Button Message</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Message Text (shown on click)</label>
                  <input
                    type="text"
                    value={localState.message || ''}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    placeholder="Enter message to show when clicked..."
                  />
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm">Message Background</label>
                    <div 
                      className="w-6 h-6 rounded border shadow" 
                      style={{ backgroundColor: localState.style?.messageBackgroundColor || '#333333' }}
                    />
                  </div>
                  <input
                    type="color"
                    value={localState.style?.messageBackgroundColor || '#333333'}
                    onChange={(e) => handleChange('style', { ...localState.style, messageBackgroundColor: e.target.value })}
                    className="w-full h-8 p-0 rounded"
                  />
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm">Message Text Color</label>
                    <div 
                      className="w-6 h-6 rounded border shadow" 
                      style={{ backgroundColor: localState.style?.messageTextColor || '#ffffff' }}
                    />
                  </div>
                  <input
                    type="color"
                    value={localState.style?.messageTextColor || '#ffffff'}
                    onChange={(e) => handleChange('style', { ...localState.style, messageTextColor: e.target.value })}
                    className="w-full h-8 p-0 rounded"
                  />
                </div>
              </div>
            )}

            {element.type === 'button' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">URL Link</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">URL</label>
                  <input
                    type="text"
                    value={localState.href || ''}
                    onChange={(e) => handleChange('href', e.target.value)}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    placeholder="e.g. https://example.com"
                  />
                </div>
              </div>
            )}

            {element.type === 'button' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Button Text</label>
          <input
            type="text"
                    value={localState.text || ''}
                    onChange={(e) => handleChange('text', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">URL Link</label>
                  <input
                    type="text"
                    value={localState.href || ''}
                    onChange={(e) => handleChange('href', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Message when clicked</label>
              <input
                type="text"
                    value={localState.message || ''}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Button clicked!"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Submit Input</label>
                  <select
                    value={localState.submitTarget || ''}
                    onChange={(e) => handleChange('submitTarget', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not a submit button</option>
                    {elements
                      .filter(el => el.type === 'input')
                      .map(input => (
                        <option key={input.id} value={input.id}>
                          {input.properties.placeholder || input.properties.text || `Input ${input.id.slice(0, 4)}`}
                        </option>
                      ))}
                  </select>
                </div>
                
                {localState.submitTarget && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">After Submit Action</label>
              <select
                      value={localState.submitAction || 'clear'}
                      onChange={(e) => handleChange('submitAction', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="clear">Clear input after submit</option>
                      <option value="alert">Show message</option>
                      <option value="both">Clear and show message</option>
                      <option value="none">Do nothing</option>
              </select>
            </div>
                )}

                {localState.submitTarget && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="storeSubmissions"
                        checked={localState.storeSubmissions || false}
                        onChange={(e) => handleChange('storeSubmissions', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="storeSubmissions" className="text-sm font-medium">
                        Store submissions in table
                      </label>
                    </div>
                    
                    {localState.storeSubmissions && (
                      <select
                        value={localState.targetTable || ''}
                        onChange={(e) => handleChange('targetTable', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a table</option>
                        {elements
                          .filter(el => el.type === 'table')
                          .map(table => (
                            <option key={table.id} value={table.id}>
                              {`Table ${table.id.slice(0, 6)}`}
                            </option>
                          ))}
                      </select>
                    )}
                    
                    {localState.storeSubmissions && !elements.some(el => el.type === 'table') && (
                      <div className="mt-2 text-xs text-orange-500">
                        No tables found. Please add a table to store data.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className={`p-3 ${sectionBg} rounded-lg`}>
              <h3 className="text-sm font-semibold mb-2">Visibility</h3>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Opacity</label>
                <div className="flex items-center gap-2">
              <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localState.style?.opacity || 1}
                    onChange={(e) => handleChange('style', { ...localState.style, opacity: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm">{localState.style?.opacity || 1}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Visibility</label>
              <select
                  value={localState.style?.visibility || 'visible'}
                  onChange={(e) => handleChange('style', { ...localState.style, visibility: e.target.value })}
                  className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

            {element.type === 'text' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Text Formatting</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Text Align</label>
            <select
                    value={localState.style?.textAlign || 'left'}
                    onChange={(e) => handleChange('style', { ...localState.style, textAlign: e.target.value })}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
                    <option value="justify">Justify</option>
            </select>
          </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1">Text Decoration</label>
          <select
                    value={localState.style?.textDecoration || 'none'}
                    onChange={(e) => handleChange('style', { ...localState.style, textDecoration: e.target.value })}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                  >
                    <option value="none">None</option>
                    <option value="underline">Underline</option>
                    <option value="line-through">Line Through</option>
                    <option value="overline">Overline</option>
          </select>
        </div>
              </div>
            )}

            {element.type === 'input' && (
              <div className={`p-3 ${sectionBg} rounded-lg`}>
                <h3 className="text-sm font-semibold mb-2">Input Constraints</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Max Length</label>
                  <input
                    type="number"
                    value={localState.maxLength || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : '';
                      handleChange('maxLength', value);
                    }}
                    className={`w-full p-2 rounded border ${inputBg} ${inputBorder}`}
                    min="0"
                  />
                </div>
              </div>
            )}

            <div className={`p-3 ${sectionBg} rounded-lg`}>
              <h3 className="text-sm font-semibold mb-2">Element Info</h3>
              <div className="text-sm mb-1">Type: <span className="font-mono">{element.type}</span></div>
              <div className="text-sm mb-1">ID: <span className="font-mono text-xs">{element.id}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleEditor;
