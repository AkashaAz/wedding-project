"use client";

import React from "react";
import { ARTBOARD_SIZES, ArtboardSize } from "@/types/Shape";

interface ArtboardSizeSelectorProps {
  selectedSize: ArtboardSize;
  onSizeChange: (size: ArtboardSize) => void;
}

const ArtboardSizeSelector: React.FC<ArtboardSizeSelectorProps> = ({
  selectedSize,
  onSizeChange,
}) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      <div className="px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-800">Artboard Size</h3>
      </div>
      <div className="p-2 space-y-1">
        {ARTBOARD_SIZES.map((size) => (
          <button
            key={size.id}
            onClick={() => onSizeChange(size)}
            className={`w-full flex items-center px-3 py-2 text-left text-sm rounded transition-colors ${
              selectedSize.id === size.id
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <span className="mr-2 text-base">{size.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{size.name}</div>
              <div className="text-xs text-gray-500">
                {size.width} × {size.height}
              </div>
            </div>
            {selectedSize.id === size.id && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArtboardSizeSelector;
