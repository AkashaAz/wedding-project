import { useState, useRef, useCallback, useEffect } from "react";
import type { ImageObject, TextObject } from "@/types/Shape";

interface CanvasState {
  images: ImageObject[];
  texts: TextObject[];
}

interface UseUndoRedoProps {
  images: ImageObject[];
  texts: TextObject[];
  onImageChange?: (images: ImageObject[]) => void;
  onTextChange?: (texts: TextObject[]) => void;
}

export const useUndoRedo = ({
  images,
  texts,
  onImageChange,
  onTextChange,
}: UseUndoRedoProps) => {
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);
  const lastSavedState = useRef<string>("");

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      const initialState = { images, texts };
      setHistory([initialState]);
      setCurrentIndex(0);
      lastSavedState.current = JSON.stringify(initialState);
    }
  }, [history.length, images, texts]);

  // บันทึก state ปัจจุบันลง history
  const saveState = useCallback(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const newState = { images, texts };
    const newStateString = JSON.stringify(newState);

    // ตรวจสอบว่าไม่ได้เปลี่ยนแปลงจริง
    if (newStateString === lastSavedState.current) {
      return;
    }

    setHistory((prev) => {
      // ลบ history ที่อยู่หลัง currentIndex (ถ้ามี)
      const newHistory = prev.slice(0, currentIndex + 1);

      // เพิ่ม state ใหม่
      newHistory.push(newState);

      // จำกัดจำนวน history (เก็บแค่ 50 actions)
      if (newHistory.length > 50) {
        return newHistory.slice(-50);
      }

      return newHistory;
    });

    setCurrentIndex((prev) => prev + 1);
    lastSavedState.current = newStateString;
  }, [images, texts, currentIndex]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const prevState = history[newIndex];

      isUndoRedoAction.current = true;
      setCurrentIndex(newIndex);
      lastSavedState.current = JSON.stringify(prevState);

      onImageChange?.(prevState.images);
      onTextChange?.(prevState.texts);
    }
  }, [currentIndex, history, onImageChange, onTextChange]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const nextState = history[newIndex];

      isUndoRedoAction.current = true;
      setCurrentIndex(newIndex);
      lastSavedState.current = JSON.stringify(nextState);

      onImageChange?.(nextState.images);
      onTextChange?.(nextState.texts);
    }
  }, [currentIndex, history, onImageChange, onTextChange]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
  };
};
