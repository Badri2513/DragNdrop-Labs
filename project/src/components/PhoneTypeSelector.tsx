import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Element } from '../store/useStore';
import PreviewElement from '../App';

type Position = "absolute" | "relative" | "fixed" | "static" | "sticky";

interface PhoneType {
  name: string;
  width: number;
  height: number;
  brand: string;
  notch: boolean;
  dynamicIsland: boolean;
}

interface PhoneTypeSelectorProps {
  selectedType: {
    name: string;
    width: number;
    height: number;
    brand: string;
    notch: boolean;
    dynamicIsland: boolean;
  };
  onSelectType: (type: any) => void;
  customWidth: number;
  customHeight: number;
  onCustomWidthChange: (width: number) => void;
  onCustomHeightChange: (height: number) => void;
  elements: Element[];
  elementStates: Record<string, string>;
  onElementStateChange: (id: string, value: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const phoneTypes: PhoneType[] = [
  { name: 'iPhone 14 Pro', width: 393, height: 852, brand: 'apple', notch: true, dynamicIsland: true },
  { name: 'iPhone 14', width: 390, height: 844, brand: 'apple', notch: true, dynamicIsland: false },
  { name: 'iPhone SE', width: 375, height: 667, brand: 'apple', notch: false, dynamicIsland: false },
  { name: 'Samsung S23', width: 360, height: 780, brand: 'samsung', notch: false, dynamicIsland: false },
  { name: 'Google Pixel 7', width: 412, height: 915, brand: 'google', notch: false, dynamicIsland: false },
  { name: 'Custom', width: 0, height: 0, brand: 'custom', notch: false, dynamicIsland: false },
];

const PhoneTypeSelector: React.FC<PhoneTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  customWidth,
  customHeight,
  onCustomWidthChange,
  onCustomHeightChange,
  elements,
  elementStates,
  onElementStateChange,
  canvasWidth,
  canvasHeight,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const filteredPhones = phoneTypes.filter(type => 
    selectedBrand === 'all' || type.brand === selectedBrand
  );

  const renderElement = (element: Element) => {
    const layout = element.properties.layout || {};
    const style = element.properties.style || {};

    // Convert string values to numbers for calculations
    const left = layout.left ? parseInt(layout.left.replace('px', '')) : 0;
    const top = layout.top ? parseInt(layout.top.replace('px', '')) : 0;
    const width = layout.width ? parseInt(layout.width.replace('px', '')) : 'auto';
    const height = layout.height ? parseInt(layout.height.replace('px', '')) : 'auto';

    const elementStyle = {
      ...style,
      position: layout.position as 'absolute' | 'relative' | 'fixed' | 'static' | 'sticky',
      left: `${left}px`,
      top: `${top}px`,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      transform: layout.transform,
      textAlign: layout.alignment as 'left' | 'center' | 'right' | undefined,
      backgroundColor: style.backgroundColor,
      color: style.textColor,
      padding: style.padding,
      borderRadius: style.borderRadius,
      fontSize: style.fontSize,
    };

    switch (element.type) {
      case 'button':
        return (
          <button
            onClick={() => {
              if (element.properties.href) {
                window.open(element.properties.href, '_blank');
              }
            }}
            type={element.properties.type as 'button' | 'submit' | 'reset' || 'button'}
            disabled={element.properties.disabled || false}
            style={{
              ...style,
              backgroundColor: element.properties.style?.backgroundColor,
              color: element.properties.style?.textColor,
              padding: element.properties.style?.padding,
              borderRadius: element.properties.style?.borderRadius,
              fontSize: element.properties.style?.fontSize,
            }}
          >
            {elementStates[element.id] || element.properties.text || 'Button'}
          </button>
        );
      case 'text':
        return (
          <div
            key={element.id}
            style={elementStyle}
            className="outline-none"
          >
            {element.properties.text}
          </div>
        );
      case 'input':
        return (
          <input
            key={element.id}
            type="text"
            value={elementStates[element.id] || ''}
            onChange={(e) => onElementStateChange(element.id, e.target.value)}
            placeholder={element.properties.text}
            style={elementStyle}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'table':
        return (
          <div key={element.id} className="overflow-x-auto" style={elementStyle}>
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
      case 'image':
        return (
          <div key={element.id} style={elementStyle} className="relative group">
            {elementStates[element.id] ? (
              <img
                src={elementStates[element.id]}
                alt="Selected"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
                <Smartphone className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-500">No image selected</span>
              </div>
            )}
          </div>
        );
      case 'card':
        return (
          <div key={element.id} style={elementStyle} className="border rounded-lg shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">
                {element.properties.text}
              </h3>
              <p className="text-gray-600">Card content goes here</p>
            </div>
          </div>
        );
      case 'container':
        return (
          <div
            key={element.id}
            style={elementStyle}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4"
          >
            <div className="text-center text-gray-500">
              {element.properties.text || "Container"}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPhoneFrame = (type: PhoneType) => {
    const isSelected = selectedType.name === type.name;
    const isCustom = type.name === 'Custom';
    const width = isCustom ? customWidth : type.width;
    const height = isCustom ? customHeight : type.height;

    return (
      <div
        key={type.name}
        className={`relative mx-auto mb-4 cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => onSelectType(type)}
      >
        <div className="relative">
          {/* Phone Frame */}
          <div
            className={`rounded-[40px] p-4 shadow-xl ${
              type.brand === 'apple' ? 'bg-gray-900' : 
              type.brand === 'samsung' ? 'bg-black' : 
              type.brand === 'google' ? 'bg-gray-800' : 'bg-gray-900'
            }`}
            style={{
              width: `${width + 32}px`,
              height: `${height + 32}px`,
            }}
          >
            {/* Notch or Dynamic Island */}
            {type.notch && !type.dynamicIsland && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl" />
            )}
            {type.dynamicIsland && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gray-900 rounded-full" />
            )}
            
            {/* Side Buttons */}
            {type.brand === 'apple' && (
              <>
                <div className="absolute left-0 top-1/4 w-1 h-16 bg-gray-800 rounded-r" />
                <div className="absolute right-0 top-1/4 w-1 h-16 bg-gray-800 rounded-l" />
                <div className="absolute right-0 top-1/3 w-1 h-8 bg-gray-800 rounded-l" />
              </>
            )}
            
            {/* Screen */}
            <div
              className="bg-white rounded-[32px] overflow-hidden"
              style={{
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              {/* Screen Content */}
              <div
                className="relative w-full h-full"
                style={{
                  backgroundColor: '#f8f9fa',
                }}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    id={element.id}
                    className="inline-block"
                    style={{
                      position: (element.properties.layout?.position as Position) || "absolute",
                      left: "0",
                      top: "0",
                      transform: element.properties.layout?.transform || `translate(${element.properties.layout?.left || "50%"}, ${element.properties.layout?.top || "50%"})`,
                      width: element.properties.layout?.width || "fit-content",
                      height: element.properties.layout?.height || "auto",
                      transition: 'all 0.2s ease-out',
                      backgroundColor: element.properties.style?.backgroundColor,
                      color: element.properties.style?.textColor,
                      padding: element.properties.style?.padding,
                      borderRadius: element.properties.style?.borderRadius,
                      fontSize: element.properties.style?.fontSize,
                    }}
                  >
                    <div style={{ width: element.properties.layout?.width || "auto" }}>
                      {element.type === 'button' && (
                        <button
                          onClick={() => {
                            if (element.properties.href) {
                              window.open(element.properties.href, '_blank');
                            }
                          }}
                          type={(element.properties.type as 'button' | 'submit' | 'reset') || 'button'}
                          disabled={element.properties.disabled || false}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: element.properties.disabled ? 'not-allowed' : 'pointer',
                            opacity: element.properties.disabled ? 0.5 : 1,
                          }}
                        >
                          {elementStates[element.id] || element.properties.text || 'Button'}
                        </button>
                      )}
                      {element.type === 'text' && (
                        <div
                          style={{
                            color: element.properties.style?.textColor,
                            padding: element.properties.style?.padding,
                            fontSize: element.properties.style?.fontSize,
                          }}
                        >
                          {elementStates[element.id] || element.properties.text}
                        </div>
                      )}
                      {element.type === 'input' && (
                        <input
                          type="text"
                          value={elementStates[element.id] || ''}
                          onChange={(e) => onElementStateChange(element.id, e.target.value)}
                          placeholder={element.properties.text}
                          style={{
                            backgroundColor: element.properties.style?.backgroundColor,
                            color: element.properties.style?.textColor,
                            padding: element.properties.style?.padding,
                            borderRadius: element.properties.style?.borderRadius,
                            fontSize: element.properties.style?.fontSize,
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Bar */}
            {type.brand === 'apple' && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-800 rounded-full" />
            )}
          </div>
        </div>
        <div className="text-center mt-2 text-sm font-medium">
          {type.name}
          {isCustom && (
            <div className="text-xs text-gray-500">
              {width} × {height}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-4">
        {phoneTypes.map((type) => (
          <button
            key={type.name}
            onClick={() => onSelectType(type)}
            className={`p-2 rounded ${
              selectedType.name === type.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {selectedType.name === 'Custom' && (
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => onCustomWidthChange(Number(e.target.value))}
              className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => onCustomHeightChange(Number(e.target.value))}
              className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
      )}

      <div
        className="relative border-4 border-gray-800 dark:border-gray-200 rounded-[40px] overflow-hidden bg-white dark:bg-gray-900"
        style={{
          width: selectedType.width,
          height: selectedType.height,
          padding: selectedType.notch ? '40px 0' : '0',
        }}
      >
        {/* Notch */}
        {selectedType.notch && (
          <div className="absolute top-0 left-0 w-full h-10 flex justify-center items-center">
            <div className="w-32 h-6 bg-gray-800 dark:bg-gray-200 rounded-t-full" />
          </div>
        )}

        {/* Dynamic Island */}
        {selectedType.dynamicIsland && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gray-800 dark:bg-gray-200 rounded-full" />
        )}

        {/* Screen Content */}
        <div
          className="w-full h-full overflow-auto"
          style={{
            padding: selectedType.notch ? '0 20px' : '20px',
          }}
        >
          {elements.map((element) => (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: element.properties.layout?.left || '50%',
                top: element.properties.layout?.top || '50%',
                transform: `translate(${element.properties.layout?.left ? '0' : '-50%'}, ${
                  element.properties.layout?.top ? '0' : '-50%'
                })`,
                width: element.properties.layout?.width || 'auto',
                height: element.properties.layout?.height || 'auto',
                backgroundColor: element.properties.style?.backgroundColor,
                color: element.properties.style?.textColor,
                padding: element.properties.style?.padding,
                borderRadius: element.properties.style?.borderRadius,
                fontSize: element.properties.style?.fontSize,
                zIndex: 1,
              }}
            >
              {element.type === 'button' && (
                <button
                  onClick={() => {
                    if (element.properties.href) {
                      window.open(element.properties.href, '_blank');
                    }
                  }}
                  type={(element.properties.type as 'button' | 'submit' | 'reset') || 'button'}
                  disabled={element.properties.disabled || false}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: element.properties.disabled ? 'not-allowed' : 'pointer',
                    opacity: element.properties.disabled ? 0.5 : 1,
                  }}
                >
                  {elementStates[element.id] || element.properties.text || 'Button'}
                </button>
              )}
              {element.type === 'text' && (
                <div>{elementStates[element.id] || element.properties.text || 'Text'}</div>
              )}
              {element.type === 'input' && (
                <input
                  type="text"
                  value={elementStates[element.id] || ''}
                  onChange={(e) => onElementStateChange(element.id, e.target.value)}
                  placeholder={element.properties.text || 'Input'}
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              )}
              {element.type === 'image' && (
                <img
                  src={elementStates[element.id] || ''}
                  alt="Image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
              {element.type === 'card' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                  }}
                >
                  <h3>{element.properties.text || 'Card Title'}</h3>
                  <p>{elementStates[element.id] || 'Card content'}</p>
                </div>
              )}
              {element.type === 'container' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                  }}
                >
                  {elementStates[element.id] || element.properties.text || 'Container'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhoneTypeSelector; 