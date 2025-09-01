import React from "react";
import type { TextObject } from "@/types/Shape";

interface TextInputOverlayProps {
  editingTextId: string | null;
  editingPosition: { x: number; y: number };
  editingValue: string;
  setEditingValue: (value: string) => void;
  textInputRef: React.RefObject<HTMLTextAreaElement>;
  texts: TextObject[];
  onComplete: () => void;
  onCancel: () => void;
}

const TextInputOverlay: React.FC<TextInputOverlayProps> = ({
  editingTextId,
  editingPosition,
  editingValue,
  setEditingValue,
  textInputRef,
  texts,
  onComplete,
  onCancel,
}) => {
  if (!editingTextId) return null;

  const currentText = texts.find((t) => t.id === editingTextId);
  if (!currentText) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onComplete();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingValue(e.target.value);
    // Auto-resize textarea
    if (textInputRef.current) {
      textInputRef.current.style.height = "auto";
      textInputRef.current.style.height =
        textInputRef.current.scrollHeight + "px";
      textInputRef.current.style.width = "auto";
      textInputRef.current.style.width =
        Math.max(50, textInputRef.current.scrollWidth) + "px";
    }
  };

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: editingPosition.x,
        top: editingPosition.y,
        transform: "translate(0, 0)",
      }}
    >
      <textarea
        ref={textInputRef}
        value={editingValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onComplete}
        className="pointer-events-auto bg-transparent border-2 border-blue-500 rounded px-1 py-0 text-black resize-none overflow-hidden"
        style={{
          fontSize: currentText.fontSize || 24,
          fontFamily: currentText.fontFamily || "Arial",
          fontStyle: currentText.fontStyle || "normal",
          color: currentText.fill || "#000000",
          outline: "none",
          background: "rgba(255, 255, 255, 0.9)",
          minWidth: "50px",
          minHeight: "auto",
          lineHeight: "1.2",
          whiteSpace: "nowrap",
        }}
        rows={1}
        autoFocus
      />
    </div>
  );
};

export default TextInputOverlay;
