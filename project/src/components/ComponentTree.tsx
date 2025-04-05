import React from 'react';
import { ChevronDown, ChevronRight, Folder, File } from 'lucide-react';

interface Element {
  id: string;
  type: string;
  properties: {
    text?: string;
    layout?: {
      width?: string;
      height?: string;
    };
  };
  children?: Element[];
}

interface ComponentTreeProps {
  elements: Element[];
  selectedElement: string | null;
  onSelect: (id: string) => void;
  theme: 'light' | 'dark';
}

const ComponentTree: React.FC<ComponentTreeProps> = ({
  elements,
  selectedElement,
  onSelect,
  theme
}) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderElement = (element: Element, level: number = 0, isLastChild: boolean = false) => {
    const isExpanded = expandedNodes.has(element.id);
    const isSelected = selectedElement === element.id;
    const hasChildren = element.children && element.children.length > 0;

    return (
      <div key={element.id} className="relative">
        {/* Vertical line */}
        {level > 0 && (
          <div
            className={`absolute left-[15px] top-0 bottom-0 w-[1px] ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            style={{ height: '100%' }}
          />
        )}

        {/* Horizontal line */}
        {level > 0 && (
          <div
            className={`absolute left-[15px] top-[50%] w-[8px] h-[1px] ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          />
        )}

        <div
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-100 text-gray-800'
          } ${
            isSelected
              ? theme === 'dark'
                ? 'bg-blue-900 text-white'
                : 'bg-blue-100 text-blue-900'
              : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelect(element.id)}
        >
          {hasChildren && (
            <button
              className={`p-1 rounded ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(element.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {hasChildren ? (
            <Folder className={`w-4 h-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
          ) : (
            <File className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
          )}
          <span className="text-sm">
            {element.type} {element.properties.text ? `- ${element.properties.text}` : ''}
          </span>
        </div>

        {/* Child elements container */}
        {isExpanded && hasChildren && (
          <div className="relative">
            {element.children?.map((child, index) => 
              renderElement(
                child, 
                level + 1, 
                index === (element.children?.length || 0) - 1
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-lg shadow p-2 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className={`font-medium text-sm mb-2 px-2 ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        Component Tree
      </div>
      <div className={`max-h-[300px] overflow-y-auto ${
        theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
      }`}>
        {elements.map((element, index) => 
          renderElement(element, 0, index === elements.length - 1)
        )}
      </div>
    </div>
  );
};

export default ComponentTree; 