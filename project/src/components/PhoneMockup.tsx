import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ children }) => {
  return (
    <div className="relative w-[375px] h-[812px] bg-gray-900 rounded-[40px] p-4 shadow-xl">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
      <div className="w-full h-full bg-white rounded-[32px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default PhoneMockup;
