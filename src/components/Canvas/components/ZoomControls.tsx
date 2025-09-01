import React from "react";

interface ZoomControlsProps {
  scale: number;
  position: { x: number; y: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  position,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col space-y-2 items-end">
      <div className="flex space-x-2">
        <button
          className="w-8 h-8 bg-white shadow rounded flex items-center justify-center text-sm hover:bg-gray-50"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          -
        </button>
        <button
          className="bg-white shadow rounded px-2 py-1 text-sm hover:bg-gray-50 cursor-pointer"
          onClick={onResetView}
          title="Reset View"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          className="w-8 h-8 bg-white shadow rounded flex items-center justify-center text-sm hover:bg-gray-50"
          onClick={onZoomIn}
          title="Zoom In"
        >
          +
        </button>
      </div>
      {(position.x !== 0 || position.y !== 0) && (
        <div className="bg-white shadow rounded px-2 py-1 text-xs text-gray-500">
          x: {Math.round(position.x)}, y: {Math.round(position.y)}
        </div>
      )}
    </div>
  );
};

export default ZoomControls;
