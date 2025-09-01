import React from "react";
import type { TextObject } from "@/types/Shape";

interface TextSettingsPanelProps {
  selectedText: TextObject;
  textSettings: {
    fontSize: number;
    fontFamily: string;
    fill: string;
    fontStyle: "normal" | "bold" | "italic" | "bold italic";
  };
  onTextSettingsChange: (settings: {
    fontSize: number;
    fontFamily: string;
    fill: string;
    fontStyle: "normal" | "bold" | "italic" | "bold italic";
  }) => void;
  onTextDelete: (textId: string) => void;
  onTextDuplicate: (text: TextObject) => void;
  setTextSettings: (settings: {
    fontSize: number;
    fontFamily: string;
    fill: string;
    fontStyle: "normal" | "bold" | "italic" | "bold italic";
  }) => void;
}

const TextSettingsPanel: React.FC<TextSettingsPanelProps> = ({
  selectedText,
  textSettings,
  onTextSettingsChange,
  onTextDelete,
  onTextDuplicate,
  setTextSettings,
}) => {
  const fontFamilyOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
    { value: "Courier New", label: "Courier New" },
    { value: "Impact", label: "Impact" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
    { value: "Great Vibes", label: "Great Vibes" },
    { value: "Dancing Script", label: "Dancing Script" },
    { value: "Alex Brush", label: "Alex Brush" },
    { value: "Parisienne", label: "Parisienne" },
    { value: "Allura", label: "Allura" },
    { value: "Sacramento", label: "Sacramento" },
    { value: "Cookie", label: "Cookie" },
    { value: "Kaushan Script", label: "Kaushan Script" },
    { value: "Satisfy", label: "Satisfy" },
    { value: "Herr Von Muellerhoff", label: "Herr Von Muellerhoff" },
  ];

  const fontStyleOptions = [
    { value: "normal", label: "Normal" },
    { value: "bold", label: "Bold" },
    { value: "italic", label: "Italic" },
    { value: "bold italic", label: "Bold Italic" },
  ];

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">✏️</span>
          Text Settings
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Customize selected text appearance
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={textSettings.fontFamily}
            onChange={(e) => {
              const newSettings = {
                ...textSettings,
                fontFamily: e.target.value,
              };
              setTextSettings(newSettings);
              onTextSettingsChange(newSettings);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {fontFamilyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size: {textSettings.fontSize}px
          </label>
          <input
            type="range"
            min="8"
            max="120"
            value={textSettings.fontSize}
            onChange={(e) => {
              const newSettings = {
                ...textSettings,
                fontSize: parseInt(e.target.value),
              };
              setTextSettings(newSettings);
              onTextSettingsChange(newSettings);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>8px</span>
            <span>120px</span>
          </div>
        </div>

        {/* Font Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontStyleOptions.map((style) => (
              <button
                key={style.value}
                onClick={() => {
                  const newSettings = {
                    ...textSettings,
                    fontStyle: style.value as typeof textSettings.fontStyle,
                  };
                  setTextSettings(newSettings);
                  onTextSettingsChange(newSettings);
                }}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  textSettings.fontStyle === style.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={textSettings.fill}
              onChange={(e) => {
                const newSettings = {
                  ...textSettings,
                  fill: e.target.value,
                };
                setTextSettings(newSettings);
                onTextSettingsChange(newSettings);
              }}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={textSettings.fill}
              onChange={(e) => {
                const newSettings = {
                  ...textSettings,
                  fill: e.target.value,
                };
                setTextSettings(newSettings);
                onTextSettingsChange(newSettings);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTextDelete(selectedText.id)}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-all duration-200"
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => onTextDuplicate(selectedText)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium transition-all duration-200"
            >
              📋 Duplicate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSettingsPanel;
