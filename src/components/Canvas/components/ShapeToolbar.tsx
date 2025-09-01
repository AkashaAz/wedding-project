import React from "react";
import type { ShapeContainer } from "@/types/Shape";

interface ShapeToolbarProps {
  onAddShape: (shapeType: ShapeContainer["type"]) => void;
}

const ShapeToolbar: React.FC<ShapeToolbarProps> = ({ onAddShape }) => {
  const shapes = [
    { type: "rect" as const, label: "Rectangle", icon: "⬜" },
    { type: "circle" as const, label: "Circle", icon: "⭕" },
    { type: "ellipse" as const, label: "Ellipse", icon: "🔵" },
    { type: "triangle" as const, label: "Triangle", icon: "🔺" },
  ];

  return (
    <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-700 flex items-center">
        Shape Frames:
      </span>
      {shapes.map((shape) => (
        <button
          key={shape.type}
          onClick={() => onAddShape(shape.type)}
          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
          title={`Add ${shape.label} Frame`}
        >
          <span className="text-lg">{shape.icon}</span>
          <span className="text-xs text-gray-600">{shape.label}</span>
        </button>
      ))}
      <div className="text-xs text-gray-500 flex items-center ml-2">
        💡 Double-click to add image
      </div>
    </div>
  );
};

export default ShapeToolbar;
