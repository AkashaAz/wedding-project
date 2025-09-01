import React from "react";

interface ContextMenuProps {
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    elementId: string;
    elementType: "image" | "text";
  } | null;
  onClose: () => void;
  onMoveForward: (elementId: string, elementType: "image" | "text") => void;
  onMoveBackward: (elementId: string, elementType: "image" | "text") => void;
  onMoveToFront: (elementId: string, elementType: "image" | "text") => void;
  onMoveToBack: (elementId: string, elementType: "image" | "text") => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  onClose,
  onMoveForward,
  onMoveBackward,
  onMoveToFront,
  onMoveToBack,
}) => {
  if (!contextMenu?.visible) return null;

  return (
    <>
      {/* Background overlay to catch clicks outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2 min-w-[180px]"
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
        }}
      >
        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
          Layer Options
        </div>

        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          onClick={() => {
            onMoveForward(contextMenu.elementId, contextMenu.elementType);
            onClose();
          }}
        >
          <span className="mr-2">⬆️</span>
          Bring Forward
        </button>

        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          onClick={() => {
            onMoveBackward(contextMenu.elementId, contextMenu.elementType);
            onClose();
          }}
        >
          <span className="mr-2">⬇️</span>
          Send Backward
        </button>

        <div className="border-t border-gray-100 mt-1 pt-1">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            onClick={() => {
              onMoveToFront(contextMenu.elementId, contextMenu.elementType);
              onClose();
            }}
          >
            <span className="mr-2">⏫</span>
            Bring to Front
          </button>

          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            onClick={() => {
              onMoveToBack(contextMenu.elementId, contextMenu.elementType);
              onClose();
            }}
          >
            <span className="mr-2">⏬</span>
            Send to Back
          </button>
        </div>
      </div>
    </>
  );
};

export default ContextMenu;
