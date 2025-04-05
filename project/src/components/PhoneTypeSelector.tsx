import React from 'react';
import { Smartphone, ImageIcon } from 'lucide-react';
import { Element } from '../store/useStore';

// Temporary inline implementation of PreviewElement until the module is created
const PreviewElement = ({
  element,
  value,
  onChange,
  isPreviewMode,
}: {
  element: any;
  value?: string;
  onChange: (value: string) => void;
  isPreviewMode: boolean;
}) => {
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
            if (isPreviewMode && element.properties.href) {
              window.open(element.properties.href, '_blank');
            }
          }}
          type="button"
          disabled={element.properties.disabled || false}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          style={{
            ...style,
            cursor: isPreviewMode && element.properties.href ? 'pointer' : undefined
          }}
          title={isPreviewMode && element.properties.href ? element.properties.href : undefined}
        >
          {value || element.properties.text}
          {isPreviewMode && element.properties.href && (
            <span className="ml-1 text-xs opacity-70">↗</span>
          )}
        </button>
      );
    case "text":
      return (
        <div
          contentEditable={!isPreviewMode}
          suppressContentEditableWarning
          onBlur={(e) => !isPreviewMode && onChange(e.currentTarget.textContent || "")}
          style={style}
          className="outline-none min-w-[50px] min-h-[24px]"
        >
          {value || element.properties.text}
        </div>
      );
    case "input":
      return (
        <input
          type="text"
          value={value !== undefined ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={element.properties.text}
          readOnly={isPreviewMode}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={style}
        />
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
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-500">Image</span>
            </div>
          )}
        </div>
      );
    case "card":
      return (
        <div className="border rounded-lg shadow-sm" style={style}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {element.properties.text}
            </h3>
            <p className="text-gray-600">Card content</p>
          </div>
        </div>
      );
    case "container":
      return (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative group"
          style={style}
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
  selectedType: PhoneType;
  onSelectType: (type: PhoneType) => void;
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
  { name: 'iPhone 14 Pro', width: 393, height: 852, brand: 'Apple', notch: true, dynamicIsland: true },
  { name: 'iPhone 14', width: 390, height: 844, brand: 'Apple', notch: true, dynamicIsland: false },
  { name: 'iPhone SE', width: 375, height: 667, brand: 'Apple', notch: false, dynamicIsland: false },
  { name: 'Samsung S23', width: 360, height: 780, brand: 'Samsung', notch: false, dynamicIsland: false },
  { name: 'Google Pixel 7', width: 412, height: 915, brand: 'Google', notch: false, dynamicIsland: false },
  { name: 'Custom', width: 0, height: 0, brand: 'Custom', notch: false, dynamicIsland: false },
];

export const PhoneTypeSelector: React.FC<PhoneTypeSelectorProps> = ({
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
  // Calculate position adjustments based on phone model
  const getPhonePositionAdjustment = () => {
    switch(selectedType.name) {
      case 'iPhone 14 Pro':
      case 'iPhone 14':
        return '-mt-10';
      case 'iPhone SE':
        return '-mt-10'; 
      case 'Samsung S23':
        return '-mt-10';
      case 'Google Pixel 7':
        return '-mt-10'; 
      case 'Custom':
        return '-mt-10';
      default:
        return '-mt-10';
    }
  };

  const renderPhoneFrame = () => {
    // Calculate a proper scale based on viewport size and device dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Adjust scale calculation to create a more proportional phone size
    let scale;
    if (viewportHeight < 900) {
      // For smaller screens, make phone bigger
      scale = Math.min(
        (viewportHeight * 0.9) / selectedType.height,
        (viewportWidth * 0.6) / selectedType.width
      );
    } else {
      // For larger screens, allow phone to be even bigger
      scale = Math.min(
        (viewportHeight * 0.95) / selectedType.height,
        (viewportWidth * 0.7) / selectedType.width
      );
    }

    const frameStyle = {
      transform: `scale(${scale}) rotateY(-5deg) rotateX(2deg)`,
      transformOrigin: 'center',
      width: selectedType.width,
      height: selectedType.height,
      margin: 'auto',
    };

    // Brand-specific styling
    const getBrandSpecificStyles = () => {
      switch(selectedType.brand) {
        case 'Apple':
          return {
            frameColor: 'bg-gradient-to-b from-gray-800 to-gray-900',
            bezelColor: 'bg-gradient-to-br from-gray-700 to-gray-800',
            buttonColor: 'bg-gray-600',
            borderRadius: 'rounded-[45px]',
            bezelRadius: 'rounded-[40px]',
            screenRadius: 'rounded-[38px]',
          };
        case 'Samsung':
          return {
            frameColor: 'bg-gradient-to-b from-gray-700 to-black',
            bezelColor: 'bg-gradient-to-r from-gray-800 to-gray-900',
            buttonColor: 'bg-gray-500',
            borderRadius: 'rounded-[30px]',
            bezelRadius: 'rounded-[26px]',
            screenRadius: 'rounded-[24px]',
          };
        case 'Google':
          return {
            frameColor: 'bg-gradient-to-b from-gray-700 to-gray-800',
            bezelColor: 'bg-gradient-to-r from-gray-700 to-gray-800',
            buttonColor: 'bg-gray-500',
            borderRadius: 'rounded-[25px]',
            bezelRadius: 'rounded-[22px]',
            screenRadius: 'rounded-[20px]',
          };
        default:
          return {
            frameColor: 'bg-gradient-to-b from-gray-800 to-gray-900',
            bezelColor: 'bg-black',
            buttonColor: 'bg-gray-600',
            borderRadius: 'rounded-[35px]',
            bezelRadius: 'rounded-[30px]',
            screenRadius: 'rounded-[28px]',
          };
      }
    };

    const styles = getBrandSpecificStyles();

    return (
      <div className="pointer-events-none relative flex items-center justify-center">
        {/* Device shadow */}
        <div 
          className="absolute blur-xl opacity-20 bg-black rounded-[80px]"
          style={{
            width: selectedType.width * 0.7,
            height: selectedType.height * 0.08,
            transform: `translateY(${selectedType.height * 0.55 * scale}px) scale(${scale}) rotateX(75deg)`,
          }}
        ></div>

        {/* Phone frame */}
        <div
          className={`pointer-events-auto relative ${styles.frameColor} ${styles.borderRadius} overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4),0_20px_40px_-20px_rgba(0,0,0,0.4),inset_0_-2px_6px_0_rgba(255,255,255,0.05)]`}
          style={frameStyle}
        >
          {/* Highlight edge */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none"></div>
          
          {/* Screen Bezel */}
          <div className={`absolute inset-[2px] ${styles.bezelColor} ${styles.bezelRadius} overflow-hidden`}>
            {/* Notch or Dynamic Island */}
            {selectedType.notch && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] flex items-center justify-center z-10">
                {selectedType.dynamicIsland ? (
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-3 h-3 bg-[#222] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    </div>
                    <div className="w-10 h-3 bg-[#222] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#222] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#222] rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-2 bg-[#222] rounded-full"></div>
                  </div>
                )}
              </div>
            )}

              {/* Screen Content */}
            <div className={`absolute inset-[2px] ${styles.screenRadius} overflow-hidden bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]`}>
              <div
                className="w-full h-full relative"
                style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  transform: `scale(${Math.min(
                    (selectedType.width - 16) / canvasWidth,
                    (selectedType.height - 16) / canvasHeight
                  )})`,
                  transformOrigin: 'top left',
                }}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    id={element.id}
                    className="absolute"
                    style={{
                      left: element.properties.layout?.left || "50%",
                      top: element.properties.layout?.top || "50%",
                      transform: element.properties.layout?.transform || `translate(-50%, -50%)`,
                      width: element.properties.layout?.width || "fit-content",
                      height: element.properties.layout?.height || "auto",
                    }}
                  >
                    <PreviewElement
                      element={element}
                      value={elementStates[element.id]}
                      onChange={(value: string) => onElementStateChange(element.id, value)}
                      isPreviewMode={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Side Buttons */}
            {selectedType.brand === 'Apple' && (
              <>
                <div className={`absolute left-0 top-1/3 -translate-y-1/2 h-16 w-1 ${styles.buttonColor} rounded-r-sm shadow-sm`}></div>
                <div className={`absolute right-0 top-1/4 -translate-y-1/2 h-12 w-1 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
                <div className={`absolute right-0 top-1/3 -translate-y-1/2 h-12 w-1 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
              </>
            )}
            
            {selectedType.brand === 'Samsung' && (
              <>
                <div className={`absolute right-0 top-1/4 -translate-y-1/2 h-14 w-1 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
                <div className={`absolute left-0 top-1/3 -translate-y-1/2 h-20 w-1 ${styles.buttonColor} rounded-r-sm shadow-sm`}></div>
              </>
            )}
            
            {selectedType.brand === 'Google' && (
              <>
                <div className={`absolute right-0 top-1/4 -translate-y-1/2 h-16 w-1 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
              </>
            )}

            {/* Bottom Bar or Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full opacity-30"></div>
          </div>

          {/* Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white opacity-5 pointer-events-none"></div>
          
          {/* Device Brand - only show for custom */}
          {selectedType.brand === 'Custom' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
              Custom
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full pt-2">
      <div className="flex flex-wrap gap-2 mb-2 justify-center z-50 relative">
        <button
          onClick={() => onSelectType({
            name: 'iPhone 14 Pro',
            width: 393,
            height: 852,
            brand: 'Apple',
            notch: true,
            dynamicIsland: true
          })}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedType.name === 'iPhone 14 Pro'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          iPhone 14 Pro
        </button>
        
        <button
          onClick={() => onSelectType({
            name: 'iPhone 14',
            width: 390,
            height: 844,
            brand: 'Apple',
            notch: true,
            dynamicIsland: false
          })}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedType.name === 'iPhone 14'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          iPhone 14
        </button>
        
        <button
          onClick={() => onSelectType({
            name: 'iPhone SE',
            width: 375,
            height: 667,
            brand: 'Apple',
            notch: false,
            dynamicIsland: false
          })}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedType.name === 'iPhone SE'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          iPhone SE
        </button>
        
        <button
          onClick={() => onSelectType({
            name: 'Samsung S23',
            width: 360,
            height: 780,
            brand: 'Samsung',
            notch: false,
            dynamicIsland: false
          })}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedType.name === 'Samsung S23'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Samsung S23
        </button>
        
        <button
          onClick={() => onSelectType({
            name: 'Google Pixel 7',
            width: 412,
            height: 915,
            brand: 'Google',
            notch: false,
            dynamicIsland: false
          })}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedType.name === 'Google Pixel 7'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Google Pixel 7
        </button>
        
          <button
          onClick={() => onSelectType({
            name: 'Custom',
            width: customWidth || 375,
            height: customHeight || 812,
            brand: 'Custom',
            notch: false,
            dynamicIsland: false
          })}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedType.name === 'Custom'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Custom
          </button>
      </div>

      {selectedType.name === 'Custom' && (
        <div className="flex gap-4 mb-2 z-50 relative">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Width</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => onCustomWidthChange(Number(e.target.value))}
              className="w-28 px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Height</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => onCustomHeightChange(Number(e.target.value))}
              className="w-28 px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div className={`flex items-center justify-center h-[calc(100vh-120px)] ${getPhonePositionAdjustment()}`}>
        {renderPhoneFrame()}
      </div>
    </div>
  );
};

export default PhoneTypeSelector; 