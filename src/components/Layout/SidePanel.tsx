"use client";

import React, { useState, useRef, useEffect } from "react";
import ArtboardSizeSelector from "./ArtboardSizeSelector";
import { ArtboardSize, ShapeContainer } from "@/types/Shape";

interface SidePanelProps {
  selectedArtboardSize: ArtboardSize;
  onArtboardSizeChange: (size: ArtboardSize) => void;
  onUploadImages?: () => void;
  onAddText?: () => void;
  onAddShapeContainer?: (shapeType: ShapeContainer["type"]) => void;
  onReviewJSON?: () => void;
  onPreview?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  selectedArtboardSize,
  onArtboardSizeChange,
  onUploadImages,
  onAddText,
  onAddShapeContainer,
  onReviewJSON,
  onPreview,
}) => {
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shapes = [
    { type: "rect" as const, label: "Rectangle", icon: "⬜" },
    { type: "circle" as const, label: "Circle", icon: "⭕" },
    { type: "ellipse" as const, label: "Ellipse", icon: "🔵" },
    { type: "triangle" as const, label: "Triangle", icon: "🔺" },
  ];

  const handleShapeSelect = (shapeType: ShapeContainer["type"]) => {
    onAddShapeContainer?.(shapeType);
    setIsShapeDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsShapeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Panel Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Design Panel</h3>
        <p className="text-sm text-gray-500 mt-1">Manage your artboard</p>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Artboard Size Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Canvas Size
          </h4>
          <ArtboardSizeSelector
            selectedSize={selectedArtboardSize}
            onSizeChange={onArtboardSizeChange}
          />
        </div>

        {/* Tools Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Add Elements
          </h4>
          <div className="space-y-3">
            <button
              onClick={onUploadImages}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center group hover:shadow-sm"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                <span className="text-blue-600">📷</span>
              </div>
              <span>Upload Images</span>
            </button>

            <button
              onClick={onAddText}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center group hover:shadow-sm"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                <span className="text-purple-600">✏️</span>
              </div>
              <span>Add Text</span>
            </button>
          </div>
        </div>

        {/* Shape Frames Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Shape Frames
          </h4>
          <p className="text-xs text-gray-500 mb-3">
            Add shapes that can contain images
          </p>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsShapeDropdownOpen(!isShapeDropdownOpen)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group hover:shadow-sm"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600">🔳</span>
                </div>
                <span>Add Shape Frame</span>
              </div>
              <span
                className={`transform transition-transform ${
                  isShapeDropdownOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {isShapeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {shapes.map((shape) => (
                  <button
                    key={shape.type}
                    onClick={() => handleShapeSelect(shape.type)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="text-lg mr-3">{shape.icon}</span>
                    <span className="text-sm text-gray-700">{shape.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 Double-click shape to add image
          </div>
        </div>

        {/* Export Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Export & Preview
          </h4>
          <div className="space-y-3">
            <button
              onClick={onPreview}
              className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center group hover:shadow-lg"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-opacity-30 transition-colors">
                <span>👁️</span>
              </div>
              <span>Preview Design</span>
            </button>

            <button
              onClick={onReviewJSON}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center group hover:shadow-sm"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                <span className="text-green-600">📄</span>
              </div>
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
