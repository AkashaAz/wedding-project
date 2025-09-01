import { useState, useRef } from "react";
import type { TextObject } from "@/types/Shape";
import type { Stage } from "konva/lib/Stage";

export const useTextEditing = () => {
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState({ x: 0, y: 0 });
  const [editingValue, setEditingValue] = useState("");
  const [isEditingComplete, setIsEditingComplete] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const startEditing = (
    text: TextObject,
    stageRef: React.RefObject<Stage>,
    artboardPosition: { x: number; y: number },
    scale: number,
    position: { x: number; y: number }
  ) => {
    setEditingTextId(text.id);
    setIsEditingComplete(false);
    const initialValue = text.text === "Double click to edit" ? "" : text.text;
    setEditingValue(initialValue);

    // Calculate position for input overlay
    const stage = stageRef.current;
    if (stage) {
      const stageBox = stage.container().getBoundingClientRect();
      const actualX = artboardPosition.x + text.x;
      const actualY = artboardPosition.y + text.y;

      setEditingPosition({
        x: stageBox.left + actualX * scale + position.x,
        y: stageBox.top + actualY * scale + position.y,
      });
    }

    // Focus input after state update
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        if (text.text !== "Double click to edit") {
          textInputRef.current.select();
        }
      }
    }, 0);
  };

  const completeEditing = (
    texts: TextObject[],
    onTextChange?: (texts: TextObject[]) => void,
    onTextSelect?: (text: TextObject | null) => void,
    setSelectedId?: (id: string | null) => void,
    setSelectedText?: (text: TextObject | null) => void
  ) => {
    if (isEditingComplete || !editingTextId || editingValue === null) {
      return;
    }

    setIsEditingComplete(true);

    if (editingValue.trim() === "") {
      const updatedTexts = texts.filter((t) => t.id !== editingTextId);
      onTextChange?.(updatedTexts);
      setSelectedId?.(null);
      setSelectedText?.(null);
      onTextSelect?.(null);
    } else {
      const updatedTexts = texts.map((t) =>
        t.id === editingTextId ? { ...t, text: editingValue.trim() } : t
      );
      onTextChange?.(updatedTexts);
    }

    setEditingTextId(null);
    setEditingValue("");
    setIsEditingComplete(false);
  };

  const cancelEditing = () => {
    setEditingTextId(null);
    setEditingValue("");
    setIsEditingComplete(false);
  };

  return {
    editingTextId,
    editingPosition,
    editingValue,
    setEditingValue,
    textInputRef,
    startEditing,
    completeEditing,
    cancelEditing,
  };
};
