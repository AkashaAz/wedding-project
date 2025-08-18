"use client";

import React from "react";
import ArtboardSizeSelector from "./ArtboardSizeSelector";
import { ArtboardSize } from "@/types/Shape";

interface SidePanelProps {
  selectedArtboardSize: ArtboardSize;
  onArtboardSizeChange: (size: ArtboardSize) => void;
  onUploadImages?: () => void;
  onAddText?: () => void;
  onTextSettingsHover?: (isHovering: boolean) => void;
  onReviewJSON?: () => void;
  onPreview?: () => void;
  showTextPanel?: boolean;
  textSettings?: {
    fontSize: number;
    fontFamily: string;
    fill: string;
    fontStyle: "normal" | "bold" | "italic" | "bold italic";
  };
  onTextSettingsChange?: (settings: {
    fontSize: number;
    fontFamily: string;
    fill: string;
    fontStyle: "normal" | "bold" | "italic" | "bold italic";
  }) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  selectedArtboardSize,
  onArtboardSizeChange,
  onUploadImages,
  onAddText,
  onTextSettingsHover,
  onReviewJSON,
  onPreview,
  showTextPanel = false,
  textSettings = {
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#000000",
    fontStyle: "normal" as const,
  },
  onTextSettingsChange,
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

            <button
              onClick={() => onTextSettingsHover?.(!showTextPanel)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center group hover:shadow-sm"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                <span className="text-green-600">⚙️</span>
              </div>
              <span>Text Settings</span>
            </button>

            {/* Text Settings Panel */}
            {showTextPanel && (
              <div className="mt-3 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">✏️</span>
                  Text Settings
                </h4>

                <div className="space-y-3">
                  {/* Font Family */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={textSettings.fontFamily}
                      onChange={(e) => {
                        const newSettings = {
                          ...textSettings,
                          fontFamily: e.target.value,
                        };
                        onTextSettingsChange?.(newSettings);
                      }}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Size: {textSettings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={textSettings.fontSize}
                      onChange={(e) => {
                        const newSettings = {
                          ...textSettings,
                          fontSize: parseInt(e.target.value),
                        };
                        onTextSettingsChange?.(newSettings);
                      }}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Font Style */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Style
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        className={`px-2 py-1 text-xs border rounded transition-all duration-200 ${
                          textSettings.fontStyle === "normal"
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          const newSettings = {
                            ...textSettings,
                            fontStyle: "normal" as const,
                          };
                          onTextSettingsChange?.(newSettings);
                        }}
                      >
                        Normal
                      </button>
                      <button
                        className={`px-2 py-1 text-xs border rounded font-bold transition-all duration-200 ${
                          textSettings.fontStyle === "bold"
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          const newSettings = {
                            ...textSettings,
                            fontStyle: "bold" as const,
                          };
                          onTextSettingsChange?.(newSettings);
                        }}
                      >
                        Bold
                      </button>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={textSettings.fill}
                        onChange={(e) => {
                          const newSettings = {
                            ...textSettings,
                            fill: e.target.value,
                          };
                          onTextSettingsChange?.(newSettings);
                        }}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textSettings.fill}
                        onChange={(e) => {
                          const newSettings = {
                            ...textSettings,
                            fill: e.target.value,
                          };
                          onTextSettingsChange?.(newSettings);
                        }}
                        className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <span>�️</span>
              </div>
              <span>Preview Design</span>
            </button>

            <button
              onClick={onReviewJSON}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center group hover:shadow-sm"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                <span className="text-green-600">�</span>
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
