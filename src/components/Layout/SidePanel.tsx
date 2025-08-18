"use client";

import React from "react";
import ArtboardSizeSelector from "./ArtboardSizeSelector";
import { ArtboardSize } from "@/types/Shape";

interface SidePanelProps {
  selectedArtboardSize: ArtboardSize;
  onArtboardSizeChange: (size: ArtboardSize) => void;
  onUploadImages?: () => void;
  onAddText?: () => void;
  onReviewJSON?: () => void;
  onPreview?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  selectedArtboardSize,
  onArtboardSizeChange,
  onUploadImages,
  onAddText,
  onReviewJSON,
  onPreview,
}) => {
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
            Quick Actions
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
