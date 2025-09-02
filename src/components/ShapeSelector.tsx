"use client";

import React, { useState, useRef, useEffect } from "react";

export interface ShapeType {
  id: string;
  name: string;
  type:
    | "rect"
    | "circle"
    | "ellipse"
    | "triangle"
    | "pentagon"
    | "hexagon"
    | "star";
  preview: React.ReactNode;
}

const SHAPE_TYPES: ShapeType[] = [
  {
    id: "rect",
    name: "Rectangle",
    type: "rect",
    preview: <div className="w-6 h-4 bg-purple-500 rounded-sm"></div>,
  },
  {
    id: "circle",
    name: "Circle",
    type: "circle",
    preview: <div className="w-5 h-5 bg-purple-500 rounded-full"></div>,
  },
  {
    id: "ellipse",
    name: "Ellipse",
    type: "ellipse",
    preview: <div className="w-7 h-4 bg-purple-500 rounded-full"></div>,
  },
  {
    id: "triangle",
    name: "Triangle",
    type: "triangle",
    preview: (
      <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-purple-500"></div>
    ),
  },
  {
    id: "pentagon",
    name: "Pentagon",
    type: "pentagon",
    preview: (
      <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
        <path d="M10 0L19 7L15.5 18H4.5L1 7L10 0Z" fill="#8b5cf6" />
      </svg>
    ),
  },
  {
    id: "hexagon",
    name: "Hexagon",
    type: "hexagon",
    preview: (
      <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
        <path d="M5 0H15L20 9L15 18H5L0 9L5 0Z" fill="#8b5cf6" />
      </svg>
    ),
  },
  {
    id: "star",
    name: "Star",
    type: "star",
    preview: (
      <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
        <path
          d="M10 0L12.9389 6.90983H20L14.5306 11.1803L17.4694 18.0902L10 13.8197L2.53056 18.0902L5.46944 11.1803L0 6.90983H7.06107L10 0Z"
          fill="#8b5cf6"
        />
      </svg>
    ),
  },
];

interface ShapeSelectorProps {
  onShapeSelect: (shapeType: ShapeType["type"]) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ onShapeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ShapeType>(SHAPE_TYPES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShapeSelect = (shape: ShapeType) => {
    setSelectedShape(shape);
    setIsOpen(false);
    onShapeSelect(shape.type);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Figma-style Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
        title="Add Shape (S)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Add Shape (S)
        </div>
        {/* Small dropdown arrow */}
        <svg
          className={`w-2 h-2 absolute -bottom-0.5 -right-0.5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4H2z" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {SHAPE_TYPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleShapeSelect(shape)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left ${
                  selectedShape.id === shape.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                  {shape.preview}
                </div>
                <span className="text-sm font-medium">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSelector;
