import React from 'react';

interface PhoneType {
  name: string;
  width: number;
  height: number;
}

const phoneTypes: PhoneType[] = [
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Samsung Galaxy S23', width: 393, height: 852 },
  { name: 'Google Pixel 7', width: 412, height: 915 },
  { name: 'Custom', width: 0, height: 0 }
];

interface PhoneTypeSelectorProps {
  selectedType: PhoneType;
  onSelectType: (type: PhoneType) => void;
  customWidth: number;
  customHeight: number;
  onCustomWidthChange: (width: number) => void;
  onCustomHeightChange: (height: number) => void;
  children: React.ReactNode;
}

const PhoneTypeSelector: React.FC<PhoneTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  customWidth,
  customHeight,
  onCustomWidthChange,
  onCustomHeightChange,
  children
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-4 p-4 w-full max-w-md">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Device Type:</label>
          <select
            className="flex-1 p-2 border rounded"
            value={selectedType.name}
            onChange={(e) => {
              const type = phoneTypes.find(t => t.name === e.target.value);
              if (type) onSelectType(type);
            }}
          >
            {phoneTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {selectedType.name === 'Custom' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Width (px):</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={customWidth}
                onChange={(e) => onCustomWidthChange(Number(e.target.value))}
                min="100"
                max="2000"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Height (px):</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={customHeight}
                onChange={(e) => onCustomHeightChange(Number(e.target.value))}
                min="100"
                max="2000"
              />
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Phone Frame */}
        <div className="relative bg-gray-800 rounded-[40px] p-4 shadow-xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10" />
          
          {/* Screen */}
          <div className="bg-gray-900 rounded-[32px] overflow-hidden">
            <div className="relative">
              {children}
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PhoneTypeSelector; 