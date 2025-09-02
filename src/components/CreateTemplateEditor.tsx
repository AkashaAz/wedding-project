"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ShapeSelector from "./ShapeSelector";
import ShapeRenderer from "./ShapeRenderer";

// Types for our artboard elements
interface ArtboardElement {
  id: string;
  type: "text" | "image" | "shape" | "group";
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
  // Individual border radius for corners
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  shapeType?:
    | "rect"
    | "circle"
    | "ellipse"
    | "triangle"
    | "pentagon"
    | "hexagon"
    | "star"; // for shape types
  strokeColor?: string; // for shape stroke
  strokeWidth?: number; // for shape stroke width
  strokeStyle?: "solid" | "dashed" | "dotted"; // stroke style
  // Group properties
  children?: string[]; // array of child element IDs for groups
  parentId?: string; // parent group ID for grouped elements
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

const CreateTemplateEditor: React.FC = () => {
  const [elements, setElements] = useState<ArtboardElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]); // Multi-selection
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null
  ); // Context menu
  const [nextZIndex, setNextZIndex] = useState(1);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false); // Layout panel toggle
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
  const addShapeElement = useCallback(
    (
      shapeType:
        | "rect"
        | "circle"
        | "ellipse"
        | "triangle"
        | "pentagon"
        | "hexagon"
        | "star" = "rect"
    ) => {
      const newElement: ArtboardElement = {
        id: `shape_${Date.now()}`,
        type: "shape",
        x: 200,
        y: 200,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: nextZIndex,
        backgroundColor: "#8b5cf6",
        borderRadius: shapeType === "rect" ? 8 : 0,
        borderTopLeftRadius: shapeType === "rect" ? 8 : 0,
        borderTopRightRadius: shapeType === "rect" ? 8 : 0,
        borderBottomLeftRadius: shapeType === "rect" ? 8 : 0,
        borderBottomRightRadius: shapeType === "rect" ? 8 : 0,
        shapeType: shapeType,
        strokeColor: "#6d28d9",
        strokeWidth: 2,
        strokeStyle: "solid",
      };
      setElements((prev) => [...prev, newElement]);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
  );

  // Delete element
  const deleteElement = useCallback(() => {
    if (selectedElement) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
    } else if (selectedElements.length > 0) {
      setElements((prev) =>
        prev.filter((el) => !selectedElements.includes(el.id))
      );
      setSelectedElements([]);
    }
  }, [selectedElement, selectedElements]);

  // Group selected elements
  const groupElements = useCallback(() => {
    if (selectedElements.length < 2) return;

    const elementsToGroup = elements.filter(
      (el) => selectedElements.includes(el.id) && !el.parentId
    );
    if (elementsToGroup.length < 2) return;

    // Calculate bounding box for the group
    const minX = Math.min(...elementsToGroup.map((el) => el.x));
    const minY = Math.min(...elementsToGroup.map((el) => el.y));
    const maxX = Math.max(...elementsToGroup.map((el) => el.x + el.width));
    const maxY = Math.max(...elementsToGroup.map((el) => el.y + el.height));

    const groupId = `group_${Date.now()}`;
    const groupElement: ArtboardElement = {
      id: groupId,
      type: "group",
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      zIndex: Math.max(...elementsToGroup.map((el) => el.zIndex)),
      children: elementsToGroup.map((el) => el.id),
    };

    // Update elements: add group and update children with relative positions and parentId
    setElements((prev) => {
      const updated = prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          return {
            ...el,
            x: el.x - minX,
            y: el.y - minY,
            parentId: groupId,
          };
        }
        return el;
      });
      return [...updated, groupElement];
    });

    setSelectedElements([]);
    setSelectedElement(groupId);
    setNextZIndex((prev) => prev + 1);
  }, [selectedElements, elements]);

  // Ungroup selected group
  const ungroupElements = useCallback(() => {
    if (!selectedElement) return;

    const group = elements.find(
      (el) => el.id === selectedElement && el.type === "group"
    );
    if (!group || !group.children) return;

    // Update children to absolute positions and remove parentId
    setElements((prev) => {
      const updated = prev
        .map((el) => {
          if (group.children?.includes(el.id)) {
            return {
              ...el,
              x: el.x + group.x,
              y: el.y + group.y,
              parentId: undefined,
            };
          }
          return el;
        })
        .filter((el) => el.id !== selectedElement); // Remove the group

      return updated;
    });

    setSelectedElement(null);
  }, [selectedElement, elements]);

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

  // Handle shape image upload on double click
  const handleShapeImageUpload = useCallback(
    (elementId: string) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            updateElementContent(elementId, {
              src: e.target?.result as string,
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },
    [updateElementContent]
  );

  // Simple mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      if (e.button !== 0) return; // Only left click

      // Handle multi-selection with Shift key
      if (e.shiftKey) {
        setSelectedElements((prev) => {
          if (prev.includes(elementId)) {
            return prev.filter((id) => id !== elementId);
          } else {
            return [...prev, elementId];
          }
        });
        setSelectedElement(null);
      } else {
        // Single selection
        if (selectedElements.length > 0) {
          setSelectedElements([]);
        }
        setSelectedElement(elementId);
      }

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
      }
    },
    [elements, selectedElements]
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
        // If dragging a group, move all children
        if (element.type === "group" && element.children) {
          setElements((prev) =>
            prev.map((el) => {
              if (el.id === element.id) {
                return {
                  ...el,
                  x: Math.max(0, el.x + deltaX),
                  y: Math.max(0, el.y + deltaY),
                };
              } else if (element.children?.includes(el.id)) {
                // Children positions are relative to group, so they don't need to move
                return el;
              }
              return el;
            })
          );
        } else if (
          selectedElements.length > 1 &&
          selectedElements.includes(element.id)
        ) {
          // Move all selected elements together
          setElements((prev) =>
            prev.map((el) => {
              if (selectedElements.includes(el.id) && !el.parentId) {
                return {
                  ...el,
                  x: Math.max(0, el.x + deltaX),
                  y: Math.max(0, el.y + deltaY),
                };
              }
              return el;
            })
          );
        } else {
          // Single element movement
          updateElementContent(dragRef.current.elementId, {
            x: Math.max(0, element.x + deltaX),
            y: Math.max(0, element.y + deltaY),
          });
        }
      }

      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    },
    [elements, updateElementContent, selectedElements]
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
      if (e.key === "Delete") {
        if (selectedElement || selectedElements.length > 0) {
          deleteElement();
        }
      }
      if (e.key === "Escape") {
        setSelectedElement(null);
        setSelectedElements([]);
        setContextMenu(null);
        setShowLayoutPanel(false);
      }
      if (e.key === "l" || e.key === "L") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          // Check if not typing in an input field
          const activeElement = document.activeElement;
          if (
            activeElement?.tagName !== "INPUT" &&
            activeElement?.tagName !== "TEXTAREA" &&
            !activeElement?.hasAttribute("contenteditable")
          ) {
            e.preventDefault();
            setShowLayoutPanel((prev) => !prev);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, selectedElements, deleteElement]);

  // Click outside to deselect
  const handleArtboardClick = useCallback((e: React.MouseEvent) => {
    if (e.target === artboardRef.current) {
      setSelectedElement(null);
      setSelectedElements([]);
      setContextMenu(null);
    }
  }, []);

  // Handle context menu (right-click)
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, elementId?: string) => {
      e.preventDefault();

      if (elementId) {
        // Right-clicked on an element
        if (
          !selectedElements.includes(elementId) &&
          selectedElement !== elementId
        ) {
          setSelectedElement(elementId);
          setSelectedElements([]);
        }
      }

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
      });
    },
    [selectedElement, selectedElements]
  );

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Main Content - Full screen without top margin */}
      <div className="px-6 py-6">
        <div className="flex gap-6">
          {/* Artboard - ชิดซ้าย */}
          <div className="flex-none">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div
                ref={artboardRef}
                onClick={handleArtboardClick}
                onContextMenu={(e) => handleContextMenu(e)}
                className="relative bg-white border-2 border-gray-200 mx-auto overflow-hidden"
                style={{
                  width: "800px",
                  height: "600px",
                  cursor: "default",
                }}
              >
                {elements
                  .filter((el) => !el.parentId) // Only render top-level elements (groups and ungrouped elements)
                  .sort((a, b) => a.zIndex - b.zIndex) // Sort by zIndex for proper layering
                  .map((element) => {
                    const isSelected = selectedElement === element.id;
                    const isMultiSelected = selectedElements.includes(
                      element.id
                    );

                    return (
                      <div
                        key={element.id}
                        className={`absolute select-none ${
                          isSelected || isMultiSelected
                            ? "ring-2 ring-blue-500 ring-opacity-50"
                            : ""
                        }`}
                        style={{
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          width: `${element.width}px`,
                          height: `${element.height}px`,
                          transform: `rotate(${element.rotation}deg)`,
                          zIndex: element.zIndex,
                          ...((isSelected || isMultiSelected) && {
                            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                          }),
                        }}
                        onContextMenu={(e) => handleContextMenu(e, element.id)}
                      >
                        {element.type === "group" && (
                          <div
                            onMouseDown={(e) => handleMouseDown(e, element.id)}
                            className={`w-full h-full cursor-move bg-transparent ${
                              isSelected || isMultiSelected
                                ? "border-2 border-dashed border-blue-500"
                                : "border-2 border-transparent"
                            }`}
                            style={{
                              position: "relative",
                            }}
                          >
                            {/* Render grouped children */}
                            {element.children?.map((childId) => {
                              const childElement = elements.find(
                                (el) => el.id === childId
                              );
                              if (!childElement) return null;

                              return (
                                <div
                                  key={childId}
                                  className="absolute"
                                  style={{
                                    left: `${childElement.x}px`,
                                    top: `${childElement.y}px`,
                                    width: `${childElement.width}px`,
                                    height: `${childElement.height}px`,
                                    transform: `rotate(${childElement.rotation}deg)`,
                                    pointerEvents: "none", // Prevent individual interaction
                                  }}
                                >
                                  {childElement.type === "text" && (
                                    <div
                                      className="w-full h-full cursor-text transition-all duration-200"
                                      style={{
                                        border: "2px solid transparent",
                                        borderRadius: "8px",
                                        minHeight: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                          childElement.textAlign === "center"
                                            ? "center"
                                            : childElement.textAlign === "right"
                                            ? "flex-end"
                                            : "flex-start",
                                        boxSizing: "border-box",
                                        position: "relative",
                                      }}
                                    >
                                      <div
                                        className="w-full h-full outline-none transition-all duration-200"
                                        style={{
                                          fontSize: `${childElement.fontSize}px`,
                                          fontFamily: childElement.fontFamily,
                                          color: childElement.color,
                                          fontWeight: childElement.fontWeight,
                                          textAlign: (childElement.textAlign ||
                                            "left") as
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
                                          flex: "1",
                                        }}
                                      >
                                        {childElement.content}
                                      </div>
                                    </div>
                                  )}

                                  {childElement.type === "image" &&
                                    childElement.src && (
                                      <div
                                        className="relative w-full h-full overflow-hidden"
                                        style={{
                                          borderRadius: `${
                                            childElement.borderRadius || 0
                                          }px`,
                                        }}
                                      >
                                        <Image
                                          src={childElement.src}
                                          alt="Grouped element"
                                          fill
                                          className="object-cover"
                                          style={{
                                            borderRadius: `${
                                              childElement.borderRadius || 0
                                            }px`,
                                          }}
                                          draggable={false}
                                          unoptimized
                                        />
                                      </div>
                                    )}

                                  {childElement.type === "shape" && (
                                    <ShapeRenderer
                                      shapeType={
                                        childElement.shapeType || "rect"
                                      }
                                      width={childElement.width}
                                      height={childElement.height}
                                      backgroundColor={
                                        childElement.backgroundColor ||
                                        "#8b5cf6"
                                      }
                                      borderRadius={childElement.borderRadius}
                                      borderTopLeftRadius={
                                        childElement.borderTopLeftRadius
                                      }
                                      borderTopRightRadius={
                                        childElement.borderTopRightRadius
                                      }
                                      borderBottomLeftRadius={
                                        childElement.borderBottomLeftRadius
                                      }
                                      borderBottomRightRadius={
                                        childElement.borderBottomRightRadius
                                      }
                                      strokeColor={childElement.strokeColor}
                                      strokeWidth={childElement.strokeWidth}
                                      strokeStyle={childElement.strokeStyle}
                                      backgroundImage={childElement.src}
                                      className="w-full h-full"
                                    />
                                  )}
                                </div>
                              );
                            })}
                            {/* Group label removed per user request */}
                          </div>
                        )}

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
                          <ShapeRenderer
                            shapeType={element.shapeType || "rect"}
                            width={element.width}
                            height={element.height}
                            backgroundColor={
                              element.backgroundColor || "#8b5cf6"
                            }
                            borderRadius={element.borderRadius}
                            borderTopLeftRadius={element.borderTopLeftRadius}
                            borderTopRightRadius={element.borderTopRightRadius}
                            borderBottomLeftRadius={
                              element.borderBottomLeftRadius
                            }
                            borderBottomRightRadius={
                              element.borderBottomRightRadius
                            }
                            strokeColor={element.strokeColor}
                            strokeWidth={element.strokeWidth}
                            strokeStyle={element.strokeStyle}
                            backgroundImage={element.src}
                            onDoubleClick={() =>
                              handleShapeImageUpload(element.id)
                            }
                            onMouseDown={(e) => handleMouseDown(e, element.id)}
                            className="w-full h-full"
                          />
                        )}

                        {/* Resize handles for selected element */}
                        {(isSelected || isMultiSelected) &&
                          element.type !== "group" && (
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

                {/* Context Menu */}
                {contextMenu && (
                  <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                    style={{
                      left: `${contextMenu.x}px`,
                      top: `${contextMenu.y}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {selectedElements.length >= 2 && (
                      <button
                        onClick={() => {
                          groupElements();
                          setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Group Elements
                      </button>
                    )}
                    {selectedElement &&
                      elements.find((el) => el.id === selectedElement)?.type ===
                        "group" && (
                        <button
                          onClick={() => {
                            ungroupElements();
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Ungroup Elements
                        </button>
                      )}
                    {(selectedElement || selectedElements.length > 0) && (
                      <button
                        onClick={() => {
                          deleteElement();
                          setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* พื้นที่ด้านขวาสำหรับ Tools Menu */}
          <div className="w-96 flex-shrink-0">
            {/* Properties Panel - อยู่ในพื้นที่ด้านขวา */}
            {selectedElement && (
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 sticky top-6 max-h-[calc(100vh-120px)] overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 flex-shrink-0">
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
                <div className="p-6 pt-4 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
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
                                <option value="'Allura', cursive">
                                  Allura
                                </option>
                                <option value="'Sacramento', cursive">
                                  Sacramento
                                </option>
                                <option value="'Cookie', cursive">
                                  Cookie
                                </option>
                                <option value="'Kaushan Script', cursive">
                                  Kaushan Script
                                </option>
                                <option value="'Satisfy', cursive">
                                  Satisfy
                                </option>
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
                                Shape Type
                              </label>
                              <select
                                value={element.shapeType || "rect"}
                                onChange={(e) =>
                                  updateElementContent(element.id, {
                                    shapeType: e.target.value as
                                      | "rect"
                                      | "circle"
                                      | "ellipse"
                                      | "triangle"
                                      | "pentagon"
                                      | "hexagon"
                                      | "star",
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-800"
                              >
                                <option value="rect">Rectangle</option>
                                <option value="circle">Circle</option>
                                <option value="ellipse">Ellipse</option>
                                <option value="triangle">Triangle</option>
                                <option value="pentagon">Pentagon</option>
                                <option value="hexagon">Hexagon</option>
                                <option value="star">Star</option>
                              </select>
                            </div>
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

                            {element.shapeType === "rect" && (
                              <div className="bg-purple-50 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Border Radius
                                </label>

                                {/* Global Border Radius */}
                                <div className="mb-4">
                                  <label className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                    All Corners
                                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                      {element.borderRadius || 0}px
                                    </span>
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={element.borderRadius || 0}
                                    onChange={(e) => {
                                      const radius =
                                        parseInt(e.target.value) || 0;
                                      updateElementContent(element.id, {
                                        borderRadius: radius,
                                        borderTopLeftRadius: radius,
                                        borderTopRightRadius: radius,
                                        borderBottomLeftRadius: radius,
                                        borderBottomRightRadius: radius,
                                      });
                                    }}
                                    className="w-full accent-purple-500"
                                  />
                                </div>

                                {/* Individual Corner Controls */}
                                <div className="space-y-2">
                                  <label className="text-xs text-gray-600 mb-2 block">
                                    Individual Corners:
                                  </label>

                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Top Left */}
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Top Left
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={
                                          element.borderTopLeftRadius ??
                                          element.borderRadius ??
                                          0
                                        }
                                        onChange={(e) =>
                                          updateElementContent(element.id, {
                                            borderTopLeftRadius:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                      />
                                    </div>

                                    {/* Top Right */}
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Top Right
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={
                                          element.borderTopRightRadius ??
                                          element.borderRadius ??
                                          0
                                        }
                                        onChange={(e) =>
                                          updateElementContent(element.id, {
                                            borderTopRightRadius:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                      />
                                    </div>

                                    {/* Bottom Left */}
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Bottom Left
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={
                                          element.borderBottomLeftRadius ??
                                          element.borderRadius ??
                                          0
                                        }
                                        onChange={(e) =>
                                          updateElementContent(element.id, {
                                            borderBottomLeftRadius:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                      />
                                    </div>

                                    {/* Bottom Right */}
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Bottom Right
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={
                                          element.borderBottomRightRadius ??
                                          element.borderRadius ??
                                          0
                                        }
                                        onChange={(e) =>
                                          updateElementContent(element.id, {
                                            borderBottomRightRadius:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="bg-purple-50 rounded-lg p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Stroke
                              </label>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <label className="text-xs text-gray-600 w-12">
                                    Color:
                                  </label>
                                  <input
                                    type="color"
                                    value={element.strokeColor || "#6d28d9"}
                                    onChange={(e) =>
                                      updateElementContent(element.id, {
                                        strokeColor: e.target.value,
                                      })
                                    }
                                    className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={element.strokeColor || "#6d28d9"}
                                    onChange={(e) =>
                                      updateElementContent(element.id, {
                                        strokeColor: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white font-mono"
                                    placeholder="#6d28d9"
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <label className="text-xs text-gray-600 w-12">
                                    Width:
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={element.strokeWidth || 0}
                                    onChange={(e) =>
                                      updateElementContent(element.id, {
                                        strokeWidth:
                                          parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="flex-1 accent-purple-500"
                                  />
                                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded min-w-[35px] text-center">
                                    {element.strokeWidth || 0}px
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <label className="text-xs text-gray-600 w-12">
                                    Style:
                                  </label>
                                  <select
                                    value={element.strokeStyle || "solid"}
                                    onChange={(e) =>
                                      updateElementContent(element.id, {
                                        strokeStyle: e.target.value as
                                          | "solid"
                                          | "dashed"
                                          | "dotted",
                                      })
                                    }
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                  >
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Shape Image
                              </label>
                              <div className="space-y-2">
                                <button
                                  onClick={() =>
                                    handleShapeImageUpload(element.id)
                                  }
                                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                >
                                  {element.src
                                    ? "Replace Image"
                                    : "Upload Image"}
                                </button>
                                {element.src && (
                                  <button
                                    onClick={() =>
                                      updateElementContent(element.id, {
                                        src: undefined,
                                      })
                                    }
                                    className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                  >
                                    Remove Image
                                  </button>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Double-click the shape to upload an image
                                </p>
                              </div>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Toolbar - Figma Style */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm bg-white/95">
          <div className="flex items-center px-3 py-2 gap-1">
            {/* Main Tools Group */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              {/* Layout Templates Button */}
              <button
                onClick={() => setShowLayoutPanel(!showLayoutPanel)}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                title="Layout Templates (L)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                </svg>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Layout Templates (L)
                </div>
              </button>

              <button
                onClick={addTextElement}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                title="Add Text (T)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 4v3h5.5v12h3V7H19V4z" />
                </svg>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Add Text (T)
                </div>
              </button>
              <button
                onClick={addImageElement}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                title="Add Image (I)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Add Image (I)
                </div>
              </button>
              <div className="relative">
                <ShapeSelector onShapeSelect={addShapeElement} />
              </div>
            </div>

            {/* Selection Tools - Only show when elements are selected */}
            {(selectedElement || selectedElements.length > 0) && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                  {/* Group/Ungroup for multi-selection */}
                  {selectedElements.length >= 2 && (
                    <button
                      onClick={groupElements}
                      className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                      title="Group (⌘G)"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2c-1.1 0-2 .9-2 2v2h2V4h2V2H6zm0 16H4v-2H2v2c0 1.1.9 2 2 2h2v-2zm8-16h2v2h2V4c0-1.1-.9-2-2-2h-2v2zm4 16v-2h2v2c0 1.1-.9 2-2 2h-2v-2h2z" />
                      </svg>
                      <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Group (⌘G)
                      </div>
                    </button>
                  )}

                  {/* Ungroup for groups */}
                  {selectedElement &&
                    elements.find((el) => el.id === selectedElement)?.type ===
                      "group" && (
                      <button
                        onClick={ungroupElements}
                        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                        title="Ungroup (⌘⇧G)"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 2H4c-1.1 0-2 .9-2 2v2h2V4h2V2zm0 16H4v-2H2v2c0 1.1.9 2 2 2h2v-2zm8-16h2v2h2V4c0-1.1-.9-2-2-2h-2v2zm4 16v-2h2v2c0 1.1-.9 2-2 2h-2v-2h2zM8 8h8v8H8z" />
                        </svg>
                        <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Ungroup (⌘⇧G)
                        </div>
                      </button>
                    )}

                  {/* Delete */}
                  <button
                    onClick={deleteElement}
                    className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-all duration-150 relative group"
                    title="Delete (Del)"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                    <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Delete (Del)
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* Import/Export Tools */}
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <button
                onClick={importJSON}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                title="Import JSON"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16v-6h4l-5 5-5-5h4v6H9zm3-10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Import JSON
                </div>
              </button>
              <button
                onClick={exportJSON}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-all duration-150 relative group"
                title="Export JSON"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8v6H5l5 5 5-5h-4V8H9zm3 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Export JSON
                </div>
              </button>
            </div>

            {/* Status Indicator */}
            {(selectedElements.length > 0 || selectedElement) && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <div className="flex items-center gap-2 px-2">
                  {selectedElements.length > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 5h2V3c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2h2v2h-2v12c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V7H3V5z" />
                      </svg>
                      {selectedElements.length}
                    </div>
                  ) : selectedElement ? (
                    <div className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {elements.find((el) => el.id === selectedElement)?.type}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Layout Templates Panel */}
      {showLayoutPanel && (
        <div className="fixed top-20 left-6 z-40 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Layout Templates</h3>
              <button
                onClick={() => setShowLayoutPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {/* Hero Layout */}
              <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded"></div>
                  <div>
                    <h4 className="font-medium text-sm">Hero Section</h4>
                    <p className="text-xs text-gray-500">
                      Large header with image and text
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                  Click to add a responsive hero section with image, title,
                  subtitle and button
                </div>
              </div>

              {/* Info Cards Layout */}
              <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded"></div>
                  <div>
                    <h4 className="font-medium text-sm">Info Cards</h4>
                    <p className="text-xs text-gray-500">
                      Information cards with icons
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                  Add information cards with images, icons and descriptions
                </div>
              </div>

              {/* Gallery Layout */}
              <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded"></div>
                  <div>
                    <h4 className="font-medium text-sm">Gallery Grid</h4>
                    <p className="text-xs text-gray-500">
                      Photo gallery in grid layout
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                  Create a responsive image gallery with customizable grid
                  columns
                </div>
              </div>

              {/* Quick Access to Preview Page */}
              <div className="border-t border-gray-200 pt-3 mt-4">
                <a
                  href="/preview"
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Open Advanced Layout Editor
                </a>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  For more layout options and drag & drop functionality
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTemplateEditor;
