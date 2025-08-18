"use client";

import React from "react";

interface TopToolbarProps {
  onExportTemplate: () => void;
  onClearAll: () => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  onExportTemplate,
  onClearAll,
}) => {
  return (
    <div className="w-full h-12 bg-gray-100 border-b border-gray-300 flex items-center px-4 justify-between">
      {/* Left section - Logo/Brand */}
      <div className="flex items-center space-x-4">
        <div className="text-lg font-semibold text-gray-800">
          Image Layout Editor
        </div>
      </div>

      {/* Center section - Instructions */}
      <div className="flex items-center">
        <span className="text-sm text-gray-600">
          Upload images to start designing your layout
        </span>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          onClick={onExportTemplate}
        >
          Export Template
        </button>
        <button
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onClearAll}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default TopToolbar;
