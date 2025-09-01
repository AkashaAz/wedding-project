"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

// Types for our artboard elements
interface ArtboardElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content?: string; // for text
  src?: string; // for images
  backgroundColor?: string; // for shapes
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  textAlign?: string;
  borderRadius?: number;
}

const CreateTemplateEditor: React.FC = () => {
  const [elements, setElements] = useState<ArtboardElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);
  const artboardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    elementId: string | null;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementId: null,
  });

  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    elementId: string | null;
    handle: string | null;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
  }>({
    isResizing: false,
    startX: 0,
    startY: 0,
    elementId: null,
    handle: null,
    startWidth: 0,
    startHeight: 0,
    startElementX: 0,
    startElementY: 0,
  });

  // Add text element
  const addTextElement = useCallback(() => {
    const newElement: ArtboardElement = {
      id: `text_${Date.now()}`,
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      rotation: 0,
      zIndex: nextZIndex,
      content: "Sample Text",
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      fontWeight: "normal",
      textAlign: "left",
    };
    setElements((prev) => [...prev, newElement]);
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  // Add image element
  const addImageElement = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newElement: ArtboardElement = {
            id: `image_${Date.now()}`,
            type: "image",
            x: 150,
            y: 150,
            width: 200,
            height: 150,
            rotation: 0,
            zIndex: nextZIndex,
            src: e.target?.result as string,
          };
          setElements((prev) => [...prev, newElement]);
          setNextZIndex((prev) => prev + 1);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [nextZIndex]);

  // Add shape element
  const addShapeElement = useCallback(() => {
    const newElement: ArtboardElement = {
      id: `shape_${Date.now()}`,
      type: "shape",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: nextZIndex,
      backgroundColor: "#3b82f6",
      borderRadius: 8,
    };
    setElements((prev) => [...prev, newElement]);
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  // Delete element
  const deleteElement = useCallback(() => {
    if (selectedElement) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // Layer management functions
  const bringToFront = useCallback(() => {
    if (!selectedElement) return;

    const maxZ = Math.max(...elements.map((el) => el.zIndex));
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElement ? { ...el, zIndex: maxZ + 1 } : el
      )
    );
    setNextZIndex(maxZ + 2);
  }, [selectedElement, elements]);

  const sendToBack = useCallback(() => {
    if (!selectedElement) return;

    const minZ = Math.min(...elements.map((el) => el.zIndex));
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElement ? { ...el, zIndex: minZ - 1 } : el
      )
    );
  }, [selectedElement, elements]);

  const bringForward = useCallback(() => {
    if (!selectedElement) return;

    const currentElement = elements.find((el) => el.id === selectedElement);
    if (!currentElement) return;

    const higherElements = elements.filter(
      (el) => el.zIndex > currentElement.zIndex
    );
    if (higherElements.length === 0) return;

    const nextZ = Math.min(...higherElements.map((el) => el.zIndex));
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElement ? { ...el, zIndex: nextZ + 1 } : el
      )
    );
  }, [selectedElement, elements]);

  const sendBackward = useCallback(() => {
    if (!selectedElement) return;

    const currentElement = elements.find((el) => el.id === selectedElement);
    if (!currentElement) return;

    const lowerElements = elements.filter(
      (el) => el.zIndex < currentElement.zIndex
    );
    if (lowerElements.length === 0) return;

    const prevZ = Math.max(...lowerElements.map((el) => el.zIndex));
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElement ? { ...el, zIndex: prevZ - 1 } : el
      )
    );
  }, [selectedElement, elements]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, elementId: string, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      resizeRef.current = {
        isResizing: true,
        startX: e.clientX,
        startY: e.clientY,
        elementId,
        handle,
        startWidth: element.width,
        startHeight: element.height,
        startElementX: element.x,
        startElementY: element.y,
      };

      setSelectedElement(elementId);
    },
    [elements]
  );

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeRef.current.isResizing || !resizeRef.current.elementId) return;

    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;
    const handle = resizeRef.current.handle;

    let newWidth = resizeRef.current.startWidth;
    let newHeight = resizeRef.current.startHeight;
    let newX = resizeRef.current.startElementX;
    let newY = resizeRef.current.startElementY;

    // Calculate new dimensions based on handle
    switch (handle) {
      case "se": // Southeast
        newWidth = Math.max(20, resizeRef.current.startWidth + deltaX);
        newHeight = Math.max(20, resizeRef.current.startHeight + deltaY);
        break;
      case "sw": // Southwest
        newWidth = Math.max(20, resizeRef.current.startWidth - deltaX);
        newHeight = Math.max(20, resizeRef.current.startHeight + deltaY);
        newX = resizeRef.current.startElementX + deltaX;
        if (newWidth === 20)
          newX =
            resizeRef.current.startElementX + resizeRef.current.startWidth - 20;
        break;
      case "ne": // Northeast
        newWidth = Math.max(20, resizeRef.current.startWidth + deltaX);
        newHeight = Math.max(20, resizeRef.current.startHeight - deltaY);
        newY = resizeRef.current.startElementY + deltaY;
        if (newHeight === 20)
          newY =
            resizeRef.current.startElementY +
            resizeRef.current.startHeight -
            20;
        break;
      case "nw": // Northwest
        newWidth = Math.max(20, resizeRef.current.startWidth - deltaX);
        newHeight = Math.max(20, resizeRef.current.startHeight - deltaY);
        newX = resizeRef.current.startElementX + deltaX;
        newY = resizeRef.current.startElementY + deltaY;
        if (newWidth === 20)
          newX =
            resizeRef.current.startElementX + resizeRef.current.startWidth - 20;
        if (newHeight === 20)
          newY =
            resizeRef.current.startElementY +
            resizeRef.current.startHeight -
            20;
        break;
      case "e": // East
        newWidth = Math.max(20, resizeRef.current.startWidth + deltaX);
        break;
      case "w": // West
        newWidth = Math.max(20, resizeRef.current.startWidth - deltaX);
        newX = resizeRef.current.startElementX + deltaX;
        if (newWidth === 20)
          newX =
            resizeRef.current.startElementX + resizeRef.current.startWidth - 20;
        break;
      case "s": // South
        newHeight = Math.max(20, resizeRef.current.startHeight + deltaY);
        break;
      case "n": // North
        newHeight = Math.max(20, resizeRef.current.startHeight - deltaY);
        newY = resizeRef.current.startElementY + deltaY;
        if (newHeight === 20)
          newY =
            resizeRef.current.startElementY +
            resizeRef.current.startHeight -
            20;
        break;
    }

    // Update element
    setElements((prev) =>
      prev.map((el) =>
        el.id === resizeRef.current.elementId
          ? { ...el, width: newWidth, height: newHeight, x: newX, y: newY }
          : el
      )
    );
  }, []);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    resizeRef.current.isResizing = false;
    resizeRef.current.elementId = null;
    resizeRef.current.handle = null;
  }, []);

  // Export to JSON
  const exportJSON = useCallback(() => {
    const schema = {
      artboard: {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      },
      elements: elements,
    };
    const jsonString = JSON.stringify(schema, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert("JSON schema copied to clipboard!");
  }, [elements]);

  // Import from JSON
  const importJSON = useCallback(() => {
    const jsonString = prompt("Paste your JSON schema here:");
    if (jsonString) {
      try {
        const schema = JSON.parse(jsonString);
        if (schema.elements && Array.isArray(schema.elements)) {
          setElements(schema.elements);
          const maxZ = Math.max(
            ...schema.elements.map((el: ArtboardElement) => el.zIndex),
            0
          );
          setNextZIndex(maxZ + 1);
        }
      } catch {
        alert("Invalid JSON format!");
      }
    }
  }, []);

  // Update element content
  const updateElementContent = useCallback(
    (id: string, updates: Partial<ArtboardElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    []
  );

  // Simple mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      if (e.button !== 0) return; // Only left click

      setSelectedElement(elementId);

      // Start drag tracking for non-text elements or drag handle
      const element = elements.find((el) => el.id === elementId);
      if (
        element?.type !== "text" ||
        (e.target as HTMLElement).classList.contains("drag-handle")
      ) {
        e.preventDefault();
        e.stopPropagation();

        dragRef.current = {
          isDragging: false,
          startX: e.clientX,
          startY: e.clientY,
          elementId,
        };

        // Don't automatically bring to front - let user control layers manually
      }
    },
    [elements]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current.elementId) return;

      // Check if mouse moved enough to start dragging
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Start dragging only if moved more than 5 pixels
      if (distance > 5) {
        dragRef.current.isDragging = true;
      }

      if (!dragRef.current.isDragging) return;

      const element = elements.find(
        (el) => el.id === dragRef.current.elementId
      );
      if (element) {
        updateElementContent(dragRef.current.elementId, {
          x: Math.max(0, element.x + deltaX),
          y: Math.max(0, element.y + deltaY),
        });
      }

      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    },
    [elements, updateElementContent]
  );

  const handleMouseUp = useCallback(() => {
    // Reset drag state
    const wasDragging = dragRef.current.isDragging;
    dragRef.current.isDragging = false;
    dragRef.current.elementId = null;

    // If it was just a click (not dragging), don't interfere with selection
    return wasDragging;
  }, []);

  // Add global mouse events
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleResizeMove, handleResizeEnd]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedElement) {
        deleteElement();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, deleteElement]);

  // Click outside to deselect
  const handleArtboardClick = useCallback((e: React.MouseEvent) => {
    if (e.target === artboardRef.current) {
      setSelectedElement(null);
    }
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Toolbar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={addTextElement}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Text
          </button>
          <button
            onClick={addImageElement}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Add Image
          </button>
          <button
            onClick={addShapeElement}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Add Shape
          </button>
          <button
            onClick={deleteElement}
            disabled={!selectedElement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Delete
          </button>

          {/* Layer Management Buttons */}
          {selectedElement && (
            <>
              <div className="border-l border-gray-300 h-8 mx-2"></div>
              <div className="flex gap-2">
                <button
                  onClick={bringToFront}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                  title="Bring to Front"
                >
                  ⬆️ Front
                </button>
                <button
                  onClick={bringForward}
                  className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  title="Bring Forward"
                >
                  ↑ Forward
                </button>
                <button
                  onClick={sendBackward}
                  className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  title="Send Backward"
                >
                  ↓ Backward
                </button>
                <button
                  onClick={sendToBack}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                  title="Send to Back"
                >
                  ⬇️ Back
                </button>
              </div>
            </>
          )}
          <div className="border-l border-gray-300 h-8 mx-2"></div>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={importJSON}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Import JSON
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Artboard - ชิดซ้าย */}
        <div className="flex-none">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div
              ref={artboardRef}
              onClick={handleArtboardClick}
              className="relative bg-white border-2 border-gray-200 mx-auto overflow-hidden"
              style={{
                width: "800px",
                height: "600px",
                cursor: "default",
              }}
            >
              {elements
                .sort((a, b) => a.zIndex - b.zIndex) // Sort by zIndex for proper layering
                .map((element) => {
                  const isSelected = selectedElement === element.id;

                  return (
                    <div
                      key={element.id}
                      className={`absolute select-none ${
                        isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                      }`}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex,
                        ...(isSelected && {
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                        }),
                      }}
                    >
                      {element.type === "text" && (
                        <>
                          {/* Full-size clickable wrapper */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedElement(element.id);

                              // Start drag tracking
                              dragRef.current = {
                                isDragging: false,
                                startX: e.clientX,
                                startY: e.clientY,
                                elementId: element.id,
                              };
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElement(element.id);
                              // Focus on content editable for editing
                              if (!dragRef.current.isDragging) {
                                const textContent =
                                  e.currentTarget.querySelector(
                                    "[contenteditable]"
                                  ) as HTMLDivElement;
                                if (textContent) {
                                  textContent.focus();
                                }
                              }
                            }}
                            className="w-full h-full cursor-text transition-all duration-200 group hover:bg-slate-50"
                            style={{
                              border: isSelected
                                ? "2px solid rgba(99, 102, 241, 0.4)"
                                : "2px solid transparent",
                              backgroundColor: isSelected
                                ? "rgba(99, 102, 241, 0.03)"
                                : "transparent",
                              borderRadius: "8px",
                              minHeight: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                element.textAlign === "center"
                                  ? "center"
                                  : element.textAlign === "right"
                                  ? "flex-end"
                                  : "flex-start",
                              boxSizing: "border-box",
                              position: "relative",
                              ...(isSelected && {
                                boxShadow:
                                  "0 0 0 4px rgba(99, 102, 241, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                              }),
                            }}
                          >
                            {/* Placeholder text */}
                            {!element.content && !isSelected && (
                              <div
                                className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic pointer-events-none"
                                style={{
                                  fontSize: `${Math.max(
                                    (element.fontSize || 16) * 0.8,
                                    12
                                  )}px`,
                                  fontFamily: element.fontFamily,
                                }}
                              >
                                Click to edit text
                              </div>
                            )}
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement(element.id);
                                // Focus immediately for editing
                                const target = e.target as HTMLDivElement;
                                if (target && !dragRef.current.isDragging) {
                                  target.focus();
                                }
                              }}
                              onBlur={(e) =>
                                updateElementContent(element.id, {
                                  content: e.target.textContent || "",
                                })
                              }
                              onFocus={(e) => {
                                e.stopPropagation();
                                setSelectedElement(element.id);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLDivElement;
                                target.focus();
                                // Select all text on double click
                                const range = document.createRange();
                                range.selectNodeContents(target);
                                const selection = window.getSelection();
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                              }}
                              className="w-full h-full outline-none cursor-text transition-all duration-200 focus:bg-white focus:shadow-sm"
                              style={{
                                fontSize: `${element.fontSize}px`,
                                fontFamily: element.fontFamily,
                                color: element.color,
                                fontWeight: element.fontWeight,
                                textAlign: (element.textAlign || "left") as
                                  | "left"
                                  | "center"
                                  | "right"
                                  | "justify",
                                wordBreak: "break-word",
                                padding: "8px 12px",
                                width: "100%",
                                minHeight: "100%",
                                display: "flex",
                                alignItems: "center",
                                lineHeight: "1.5",
                                boxSizing: "border-box",
                                borderRadius: "6px",
                                backgroundColor: "transparent",
                                transition: "all 0.2s ease",
                                flex: "1",
                              }}
                            >
                              {element.content}
                            </div>
                          </div>
                        </>
                      )}

                      {element.type === "image" && element.src && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                          className="relative w-full h-full overflow-hidden cursor-move"
                          style={{
                            borderRadius: `${element.borderRadius || 0}px`,
                          }}
                        >
                          <Image
                            src={element.src}
                            alt="Artboard element"
                            fill
                            className="object-cover"
                            style={{
                              borderRadius: `${element.borderRadius || 0}px`,
                            }}
                            draggable={false}
                            unoptimized // Allow data URLs
                          />
                        </div>
                      )}

                      {element.type === "shape" && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                          className="w-full h-full cursor-move"
                          style={{
                            backgroundColor: element.backgroundColor,
                            borderRadius: `${element.borderRadius || 0}px`,
                          }}
                        />
                      )}

                      {/* Resize handles for selected element */}
                      {isSelected && (
                        <>
                          <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-nw-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "nw")
                            }
                          ></div>
                          <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-ne-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "ne")
                            }
                          ></div>
                          <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-sw-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "sw")
                            }
                          ></div>
                          <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-se-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "se")
                            }
                          ></div>

                          {/* Edge handles */}
                          <div
                            className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-n-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "n")
                            }
                          ></div>
                          <div
                            className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-s-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "s")
                            }
                          ></div>
                          <div
                            className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-w-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "w")
                            }
                          ></div>
                          <div
                            className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-sm cursor-e-resize shadow-sm hover:scale-110 transition-transform"
                            onMouseDown={(e) =>
                              handleResizeStart(e, element.id, "e")
                            }
                          ></div>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* พื้นที่ด้านขวาสำหรับ Tools Menu */}
        <div className="w-96 flex-shrink-0">
          {/* Properties Panel - อยู่ในพื้นที่ด้านขวา */}
          {selectedElement && (
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 sticky top-6 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Properties
                </h3>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              {(() => {
                const element = elements.find(
                  (el) => el.id === selectedElement
                );
                if (!element) return null;

                return (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={element.x}
                          onChange={(e) =>
                            updateElementContent(element.id, {
                              x: parseInt(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="X"
                        />
                        <input
                          type="number"
                          value={element.y}
                          onChange={(e) =>
                            updateElementContent(element.id, {
                              y: parseInt(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Y"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Size
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={element.width}
                          onChange={(e) =>
                            updateElementContent(element.id, {
                              width: parseInt(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Width"
                        />
                        <input
                          type="number"
                          value={element.height}
                          onChange={(e) =>
                            updateElementContent(element.id, {
                              height: parseInt(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Height"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        Rotation
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {element.rotation}°
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={element.rotation}
                        onChange={(e) =>
                          updateElementContent(element.id, {
                            rotation: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                            (element.rotation / 360) * 100
                          }%, #e5e7eb ${
                            (element.rotation / 360) * 100
                          }%, #e5e7eb 100%)`,
                        }}
                      />
                    </div>

                    {element.type === "text" && (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Font Family
                          </label>
                          <select
                            value={element.fontFamily || "Arial"}
                            onChange={(e) =>
                              updateElementContent(element.id, {
                                fontFamily: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800"
                          >
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, Arial, sans-serif">
                              Helvetica
                            </option>
                            <option value="'Times New Roman', Times, serif">
                              Times New Roman
                            </option>
                            <option value="Georgia, 'Times New Roman', Times, serif">
                              Georgia
                            </option>
                            <option value="Verdana, Geneva, sans-serif">
                              Verdana
                            </option>
                            <option value="'Courier New', Courier, monospace">
                              Courier New
                            </option>
                            <option value="Impact, Arial Black, sans-serif">
                              Impact
                            </option>
                            <option value="'Comic Sans MS', cursive">
                              Comic Sans MS
                            </option>
                            <option value="'Great Vibes', cursive">
                              Great Vibes
                            </option>
                            <option value="'Dancing Script', cursive">
                              Dancing Script
                            </option>
                            <option value="'Alex Brush', cursive">
                              Alex Brush
                            </option>
                            <option value="'Parisienne', cursive">
                              Parisienne
                            </option>
                            <option value="'Allura', cursive">Allura</option>
                            <option value="'Sacramento', cursive">
                              Sacramento
                            </option>
                            <option value="'Cookie', cursive">Cookie</option>
                            <option value="'Kaushan Script', cursive">
                              Kaushan Script
                            </option>
                            <option value="'Satisfy', cursive">Satisfy</option>
                            <option value="'Herr Von Muellerhoff', cursive">
                              Herr Von Muellerhoff
                            </option>
                          </select>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Font Size
                          </label>
                          <input
                            type="number"
                            value={element.fontSize}
                            onChange={(e) =>
                              updateElementContent(element.id, {
                                fontSize: parseInt(e.target.value) || 16,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800"
                          />
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Font Weight
                          </label>
                          <select
                            value={element.fontWeight || "normal"}
                            onChange={(e) =>
                              updateElementContent(element.id, {
                                fontWeight: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                            <option value="bolder">Bolder</option>
                          </select>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Text Align
                          </label>
                          <select
                            value={element.textAlign || "left"}
                            onChange={(e) =>
                              updateElementContent(element.id, {
                                textAlign: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={element.color}
                              onChange={(e) =>
                                updateElementContent(element.id, {
                                  color: e.target.value,
                                })
                              }
                              className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={element.color}
                              onChange={(e) =>
                                updateElementContent(element.id, {
                                  color: e.target.value,
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800 font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {element.type === "shape" && (
                      <>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Background Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={element.backgroundColor}
                              onChange={(e) =>
                                updateElementContent(element.id, {
                                  backgroundColor: e.target.value,
                                })
                              }
                              className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={element.backgroundColor}
                              onChange={(e) =>
                                updateElementContent(element.id, {
                                  backgroundColor: e.target.value,
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-800 font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            Border Radius
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                              {element.borderRadius || 0}px
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={element.borderRadius || 0}
                            onChange={(e) =>
                              updateElementContent(element.id, {
                                borderRadius: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full accent-purple-500"
                          />
                        </div>
                      </>
                    )}

                    {element.type === "image" && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Replace Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                updateElementContent(element.id, {
                                  src: e.target?.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-gray-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                        />
                      </div>
                    )}

                    {/* Layer Management Section */}
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        Layer Order
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          Z: {element.zIndex}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={bringToFront}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          ⬆️ To Front
                        </button>
                        <button
                          onClick={sendToBack}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          ⬇️ To Back
                        </button>
                        <button
                          onClick={bringForward}
                          className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                        >
                          ↑ Forward
                        </button>
                        <button
                          onClick={sendBackward}
                          className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                        >
                          ↓ Backward
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateEditor;
