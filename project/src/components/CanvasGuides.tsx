import React, { useEffect, useState } from 'react';

interface Element {
  id: string;
  properties: {
    layout?: {
      left?: string;
      top?: string;
      width?: string;
      height?: string;
    };
  };
}

interface CanvasGuidesProps {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  elements: Element[];
  draggingElement?: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onSnap?: (x: number, y: number) => void;
}

interface GuideLines {
  vertical: number[];
  horizontal: number[];
}

const SNAP_THRESHOLD = 5; // pixels (reduced for smoother snapping)
const GUIDE_VISIBILITY_THRESHOLD = 15; // pixels (reduced for earlier guide visibility)
const FREE_MOVEMENT_THRESHOLD = 20; // pixels (reduced for more responsive movement)

const CanvasGuides: React.FC<CanvasGuidesProps> = ({ 
  width, 
  height, 
  theme, 
  elements,
  draggingElement,
  onSnap 
}) => {
  const [guides, setGuides] = useState<GuideLines>({ vertical: [], horizontal: [] });
  const [activeGuides, setActiveGuides] = useState<{
    vertical: number | null;
    horizontal: number | null;
  }>({ vertical: null, horizontal: null });

  useEffect(() => {
    // Calculate center lines
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate element edges
    const elementEdges = elements.reduce<GuideLines>((acc, element) => {
      const layout = element.properties.layout;
      if (!layout) return acc;

      const left = parseInt(layout.left?.replace('px', '') || '0');
      const top = parseInt(layout.top?.replace('px', '') || '0');
      const elementWidth = parseInt(layout.width?.replace('px', '') || '0');
      const elementHeight = parseInt(layout.height?.replace('px', '') || '0');

      return {
        vertical: [...acc.vertical, left, left + elementWidth],
        horizontal: [...acc.horizontal, top, top + elementHeight],
      };
    }, { vertical: [], horizontal: [] });

    // Combine center lines with element edges
    setGuides({
      vertical: [...new Set([centerX, ...elementEdges.vertical])].sort((a, b) => a - b),
      horizontal: [...new Set([centerY, ...elementEdges.horizontal])].sort((a, b) => a - b),
    });
  }, [width, height, elements]);

  useEffect(() => {
    if (!draggingElement) {
      setActiveGuides({ vertical: null, horizontal: null });
      return;
    }

    let snapX = draggingElement.x;
    let snapY = draggingElement.y;
    let activeVertical: number | null = null;
    let activeHorizontal: number | null = null;

    // Check vertical guides
    for (const guideX of guides.vertical) {
      const distance = Math.abs(draggingElement.x - guideX);
      if (distance < SNAP_THRESHOLD) {
        // Smooth transition to guide
        const progress = 1 - (distance / SNAP_THRESHOLD);
        snapX = draggingElement.x + (guideX - draggingElement.x) * progress;
        activeVertical = guideX;
        break;
      }
    }

    // Check horizontal guides
    for (const guideY of guides.horizontal) {
      const distance = Math.abs(draggingElement.y - guideY);
      if (distance < SNAP_THRESHOLD) {
        // Smooth transition to guide
        const progress = 1 - (distance / SNAP_THRESHOLD);
        snapY = draggingElement.y + (guideY - draggingElement.y) * progress;
        activeHorizontal = guideY;
        break;
      }
    }

    setActiveGuides({
      vertical: activeVertical,
      horizontal: activeHorizontal
    });

    if ((activeVertical !== null || activeHorizontal !== null) && onSnap) {
      onSnap(snapX, snapY);
    }
  }, [draggingElement, guides, onSnap]);

  const isGuideVisible = (guide: number, draggingPos: number | undefined) => {
    if (!draggingPos) return false;
    const distance = Math.abs(guide - draggingPos);
    if (distance > GUIDE_VISIBILITY_THRESHOLD) return false;
    
    // Fade in/out based on distance
    const opacity = 1 - (distance / GUIDE_VISIBILITY_THRESHOLD);
    return opacity > 0.1;
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Vertical guides */}
      {guides.vertical.map((x) => {
        const isVisible = isGuideVisible(x, draggingElement?.x);
        const isActive = activeGuides.vertical === x;
        if (!isVisible && !isActive) return null;

        const distance = Math.abs(x - (draggingElement?.x || 0));
        const opacity = isActive ? 1 : 1 - (distance / GUIDE_VISIBILITY_THRESHOLD);

        return (
          <div
            key={`v-${x}`}
            className={`absolute top-0 bottom-0 w-[1px] transition-opacity duration-100 ${
              isActive
                ? theme === 'dark'
                  ? 'bg-blue-400'
                  : 'bg-blue-500'
                : theme === 'dark'
                ? 'bg-blue-400/30'
                : 'bg-blue-500/30'
            }`}
            style={{ 
              left: `${x}px`,
              opacity: opacity
            }}
          />
        );
      })}

      {/* Horizontal guides */}
      {guides.horizontal.map((y) => {
        const isVisible = isGuideVisible(y, draggingElement?.y);
        const isActive = activeGuides.horizontal === y;
        if (!isVisible && !isActive) return null;

        const distance = Math.abs(y - (draggingElement?.y || 0));
        const opacity = isActive ? 1 : 1 - (distance / GUIDE_VISIBILITY_THRESHOLD);

        return (
          <div
            key={`h-${y}`}
            className={`absolute left-0 right-0 h-[1px] transition-opacity duration-100 ${
              isActive
                ? theme === 'dark'
                  ? 'bg-blue-400'
                  : 'bg-blue-500'
                : theme === 'dark'
                ? 'bg-blue-400/30'
                : 'bg-blue-500/30'
            }`}
            style={{ 
              top: `${y}px`,
              opacity: opacity
            }}
          />
        );
      })}

      {/* Center point indicator */}
      <div
        className={`absolute w-2 h-2 rounded-full transition-opacity duration-100 ${
          theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
        }`}
        style={{
          left: `${width / 2 - 4}px`,
          top: `${height / 2 - 4}px`,
        }}
      />
    </div>
  );
};

export default CanvasGuides; 