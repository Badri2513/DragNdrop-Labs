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
  togglePreviewMode?: () => void;
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
  togglePreviewMode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Calculate position adjustments based on phone model
  const getPhonePositionAdjustment = () => {
    switch(selectedType.name) {
      case 'iPhone 14 Pro':
      case 'iPhone 14':
        return '-mt-0';
      case 'iPhone SE':
        return '-mt-1'; 
      case 'Samsung S23':
        return '-mt-1';
      case 'Google Pixel 7':
        return '-mt-1'; 
      case 'Custom':
        return '-mt-1';
      default:
        return '-mt-3';
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
            frameColor: 'bg-gradient-to-b from-slate-700 to-slate-900',
            bezelColor: 'bg-gradient-to-r from-slate-800 to-slate-900',
            buttonColor: 'bg-slate-500',
            borderRadius: 'rounded-[30px]',
            bezelRadius: 'rounded-[26px]',
            screenRadius: 'rounded-[24px]',
          };
        case 'Google':
          return {
            frameColor: 'bg-gradient-to-b from-zinc-700 to-zinc-800',
            bezelColor: 'bg-gradient-to-r from-zinc-700 to-zinc-800',
            buttonColor: 'bg-zinc-500',
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
          className="absolute blur-xl opacity-30 bg-black rounded-[80px]"
            style={{
            width: selectedType.width * 0.7,
            height: selectedType.height * 0.08,
            transform: `translateY(${selectedType.height * 0.55 * scale}px) scale(${scale}) rotateX(75deg)`,
          }}
        ></div>

        {/* Phone frame */}
        <div
          className={`pointer-events-auto relative ${styles.frameColor} ${styles.borderRadius} overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4),0_20px_40px_-20px_rgba(0,0,0,0.4),inset_0_-2px_6px_0_rgba(255,255,255,0.05)] transition-transform duration-500`}
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
                <div className={`absolute left-0 top-1/3 -translate-y-1/2 h-20 w-1.5 ${styles.buttonColor} rounded-r-sm shadow-sm`}></div>
                <div className={`absolute right-0 top-1/4 -translate-y-1/2 h-14 w-1.5 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
                <div className={`absolute right-0 top-1/3 -translate-y-1/2 h-14 w-1.5 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
              </>
            )}
            
            {selectedType.brand === 'Samsung' && (
              <>
                <div className={`absolute right-0 top-1/4 -translate-y-1/2 h-16 w-1.5 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
                <div className={`absolute left-0 top-1/3 -translate-y-1/2 h-24 w-1.5 ${styles.buttonColor} rounded-r-sm shadow-sm`}></div>
              </>
            )}
            
            {selectedType.brand === 'Google' && (
              <>
                <div className={`absolute right-0 top-1/4 -translate-y-1/2 h-20 w-1.5 ${styles.buttonColor} rounded-l-sm shadow-sm`}></div>
              </>
            )}

            {/* Bottom Bar or Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full opacity-30"></div>
          </div>

          {/* Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white opacity-10 pointer-events-none"></div>
          
          {/* Simulated glass reflections */}
          <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
            <div className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 bg-gradient-radial from-white/20 to-transparent animate-slow-rotate"></div>
        </div>
          
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

  // Group phones by brand
  const phonesByBrand: Record<string, PhoneType[]> = {};
  phoneTypes.forEach(phone => {
    if (!phonesByBrand[phone.brand]) {
      phonesByBrand[phone.brand] = [];
    }
    phonesByBrand[phone.brand].push(phone);
  });

  // Get brand icon
  const getBrandIcon = (brand: string) => {
    switch(brand) {
      case 'Apple':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-80" fill="currentColor">
            <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
          </svg>
        );
      case 'Samsung':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-80" fill="currentColor">
            <path d="M5.4,4H18.6C20.13,4 21.4,5.27 21.4,6.8V17.2C21.4,18.73 20.13,20 18.6,20H5.4C3.87,20 2.6,18.73 2.6,17.2V6.8C2.6,5.27 3.87,4 5.4,4M5.9,5.5C5.07,5.5 4.4,6.17 4.4,7V17C4.4,17.83 5.07,18.5 5.9,18.5H18.1C18.93,18.5 19.6,17.83 19.6,17V7C19.6,6.17 18.93,5.5 18.1,5.5H5.9M6.2,8.1H17.8V9.5H6.2V8.1M6.2,15.6H13.1V17H6.2V15.6M17.6,15.6H17.8V17H17.6V15.6M6.2,12.7H17.8V14.1H6.2V12.7Z" />
          </svg>
        );
      case 'Google':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-80" fill="currentColor">
            <path d="M12,20.9L16.7,5.9H20.8L14,22.7C13.7,23.3 13.2,23.6 12.6,23.6H11.7C11.1,23.6 10.6,23.3 10.3,22.7L3.5,5.9H7.6L12,20.9Z" />
          </svg>
        );
      default:
        return <Smartphone className="w-5 h-5 opacity-80" />;
    }
  };

  const getDropdownItemClass = (phone: PhoneType) => `
    px-4 py-3 flex items-center gap-3 border-b border-gray-100 last:border-0 
    ${selectedType.name === phone.name 
      ? 'bg-blue-50 text-blue-600' 
      : 'hover:bg-gray-50 text-gray-700'
    }
    transition-colors duration-150 cursor-pointer
  `;

  return (
    <div className="flex flex-col items-center w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (togglePreviewMode) {
                  togglePreviewMode();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              title="Return to editor"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" 
                stroke="currentColor" 
                fill="none" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Editor</span>
            </button>
            <div className="h-5 w-px bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-2 text-gray-800">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
              </svg>
              <span className="font-medium">Device Preview</span>
            </div>
          </div>
          
          <div className="relative" ref={dropdownRef}>
          <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all"
            >
              {getBrandIcon(selectedType.brand)}
              <span className="font-medium whitespace-nowrap">{selectedType.name}</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
          </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-150">
                {Object.entries(phonesByBrand).map(([brand, phones]) => (
                  <div key={brand}>
                    <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700 flex items-center gap-2">
                      {getBrandIcon(brand)}
                      {brand}
                    </div>
                    {phones.map(phone => (
                      <div 
                        key={phone.name}
                        className={getDropdownItemClass(phone)}
                        onClick={() => {
                          onSelectType({
                            ...phone,
                            width: phone.name === 'Custom' ? customWidth || 375 : phone.width,
                            height: phone.name === 'Custom' ? customHeight || 812 : phone.height,
                          });
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <div>
                          <div>{phone.name}</div>
                          {phone.name !== 'Custom' && (
                            <div className="text-xs text-gray-500">{phone.width} × {phone.height}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedType.name === 'Custom' && (
        <div className="mt-20 mb-6 z-40 bg-white p-4 rounded-xl shadow-md flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Width (px)</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => onCustomWidthChange(Number(e.target.value))}
              className="w-28 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Height (px)</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => onCustomHeightChange(Number(e.target.value))}
              className="w-28 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={() => onSelectType({
              ...selectedType,
              width: customWidth,
              height: customHeight
            })}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      <div className={`flex items-center justify-center h-[calc(100vh-80px)] ${getPhonePositionAdjustment()} ${selectedType.name === 'Custom' ? 'mt-16' : 'mt-20'}`}>
        {renderPhoneFrame()}
      </div>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm py-1.5 px-4 rounded-full bg-opacity-80 backdrop-blur shadow-lg">
        <div className="flex items-center gap-3">
          <div>{selectedType.width} × {selectedType.height}</div>
          <div className="h-3 w-px bg-gray-500"></div>
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70" fill="currentColor">
              <path d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
            </svg>
            <span className="opacity-90">Preview Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneTypeSelector; 