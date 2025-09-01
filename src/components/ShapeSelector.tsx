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
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-2 min-w-[120px] justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedShape.preview}
          <span className="hidden sm:inline">Add Shape</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">
              Choose a shape:
            </div>
            <div className="space-y-1">
              {SHAPE_TYPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handleShapeSelect(shape)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-left ${
                    selectedShape.id === shape.id
                      ? "bg-purple-50 border border-purple-200"
                      : ""
                  }`}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
                    {shape.preview}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {shape.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSelector;
