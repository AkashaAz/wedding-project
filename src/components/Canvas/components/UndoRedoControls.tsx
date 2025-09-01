import React from "react";

interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="absolute top-4 left-4 flex space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
          canUndo
            ? "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400"
            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
        }`}
        title={`Undo (${
          navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"
        }+Z)`}
      >
        ↶
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
          canRedo
            ? "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400"
            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
        }`}
        title={`Redo (${
          navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"
        }+Shift+Z)`}
      >
        ↷
      </button>

      <div className="flex items-center px-2 text-xs text-gray-500">
        {navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"}+Z
      </div>
    </div>
  );
};

export default UndoRedoControls;
