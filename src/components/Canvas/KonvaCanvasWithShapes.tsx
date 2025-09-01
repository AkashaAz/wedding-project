/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Line,
  Text,
  Image,
} from "react-konva";
import type {
  ImageObject,
  TextObject,
  ShapeContainer,
  ArtboardSize,
} from "@/types/Shape";
import ShapeContainerComponent from "./components/ShapeContainer";

interface KonvaCanvasWithShapesProps {
  images: ImageObject[];
  texts: TextObject[];
  shapeContainers?: ShapeContainer[];
  onImageChange?: (images: ImageObject[]) => void;
  onTextChange?: (texts: TextObject[]) => void;
  onShapeContainerChange?: (shapes: ShapeContainer[]) => void;
  onImageSelect?: (image: ImageObject | null) => void;
  onTextSelect?: (text: TextObject | null) => void;
  onShapeSelect?: (shape: ShapeContainer | null) => void;
  artboardSize: ArtboardSize;
  showJsonModal?: boolean;
  onShowJsonModal?: (show: boolean) => void;
  showPreviewModal?: boolean;
  onShowPreviewModal?: (show: boolean) => void;
  triggerFileUpload?: boolean;
  triggerAddText?: boolean;
}

// Undo/Redo Hook
const useUndoRedo = (
  images: ImageObject[],
  texts: TextObject[],
  shapes: ShapeContainer[]
) => {
  const [history, setHistory] = useState<
    Array<{
      images: ImageObject[];
      texts: TextObject[];
      shapes: ShapeContainer[];
    }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback(
    (
      newImages: ImageObject[],
      newTexts: TextObject[],
      newShapes: ShapeContainer[]
    ) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({
          images: [...newImages],
          texts: [...newTexts],
          shapes: [...newShapes],
        });
        return newHistory.slice(-50); // Keep only last 50 states
      });
      setCurrentIndex((prev) => Math.min(prev + 1, 49));
    },
    [currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [history, currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Initialize with current state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([
        { images: [...images], texts: [...texts], shapes: [...shapes] },
      ]);
      setCurrentIndex(0);
    }
  }, [images, texts, shapes, history.length]);

  return { saveState, undo, redo, canUndo, canRedo };
};

const KonvaCanvasWithShapes: React.FC<KonvaCanvasWithShapesProps> = ({
  images = [],
  texts = [],
  shapeContainers = [],
  artboardSize,
  onImageChange,
  onTextChange,
  onShapeContainerChange,
  onImageSelect,
  onTextSelect,
  onShapeSelect,
  triggerFileUpload,
  triggerAddText,
}) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });

  // Text editing states
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState({ x: 0, y: 0 });
  const [editingValue, setEditingValue] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Zoom and pan states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Artboard position state
  const [artboardPosition, setArtboardPosition] = useState({
    x: stageSize.width / 2 - artboardSize.width / 2,
    y: stageSize.height / 2 - artboardSize.height / 2,
  });

  // Stage panning states
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({
    x: 0,
    y: 0,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Undo/Redo hook
  const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo(
    images,
    texts,
    shapeContainers
  );

  // Debounced save state function
  const debouncedSaveState = useCallback(
    (
      newImages: ImageObject[],
      newTexts: TextObject[],
      newShapes: ShapeContainer[]
    ) => {
      setTimeout(() => saveState(newImages, newTexts, newShapes), 100);
    },
    [saveState]
  );

  // Enhanced handlers with undo support
  const handleImageChange = useCallback(
    (newImages: ImageObject[]) => {
      onImageChange?.(newImages);
      debouncedSaveState(newImages, texts, shapeContainers);
    },
    [onImageChange, debouncedSaveState, texts, shapeContainers]
  );

  const handleTextChange = useCallback(
    (newTexts: TextObject[]) => {
      onTextChange?.(newTexts);
      debouncedSaveState(images, newTexts, shapeContainers);
    },
    [onTextChange, debouncedSaveState, images, shapeContainers]
  );

  const handleShapeContainerChange = useCallback(
    (newShapes: ShapeContainer[]) => {
      onShapeContainerChange?.(newShapes);
      debouncedSaveState(images, texts, newShapes);
    },
    [onShapeContainerChange, debouncedSaveState, images, texts]
  );

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      onImageChange?.(previousState.images);
      onTextChange?.(previousState.texts);
      onShapeContainerChange?.(previousState.shapes);
    }
  }, [undo, onImageChange, onTextChange, onShapeContainerChange]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      onImageChange?.(nextState.images);
      onTextChange?.(nextState.texts);
      onShapeContainerChange?.(nextState.shapes);
    }
  }, [redo, onImageChange, onTextChange, onShapeContainerChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // File upload handler
  const handleFileUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const img = new window.Image();
          img.onload = () => {
            const newImage: ImageObject = {
              id: `image_${Date.now()}_${Math.random()}`,
              imageUrl,
              x: 50,
              y: 50,
              width: Math.min(img.width, 300),
              height: Math.min(img.height, 300),
              draggable: true,
              zIndex: images.length + 1,
            };
            const updatedImages = [...images, newImage];
            handleImageChange(updatedImages);
          };
          img.src = imageUrl;
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }, [images, handleImageChange]);

  // Add text handler
  const handleAddText = useCallback(() => {
    const newText: TextObject = {
      id: `text_${Date.now()}`,
      text: "New Text",
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      fontStyle: "normal",
      draggable: true,
      zIndex: texts.length + 1,
      width: 200,
      height: 30,
    };
    const updatedTexts = [...texts, newText];
    handleTextChange(updatedTexts);
  }, [texts, handleTextChange]);

  // Effects for triggers
  useEffect(() => {
    if (triggerFileUpload) {
      handleFileUpload();
    }
  }, [triggerFileUpload, handleFileUpload]);

  useEffect(() => {
    if (triggerAddText) {
      handleAddText();
    }
  }, [triggerAddText, handleAddText]);

  // Update stage size on mount
  useEffect(() => {
    const updateSize = () => {
      // เพิ่มขนาด stage ให้ใหญ่ขึ้นเพื่อให้ background ครอบคลุมทั้งหมด
      const padding = 500; // เพิ่ม padding ให้มากขึ้น
      const newWidth = Math.max(2000, artboardSize.width + padding * 2); // ขนาดขั้นต่ำ 2000px
      const newHeight = Math.max(1500, artboardSize.height + padding * 2); // ขนาดขั้นต่ำ 1500px

      setStageSize({
        width: newWidth,
        height: newHeight,
      });

      // อัปเดตตำแหน่ง artboard ให้อยู่ตรงกลาง
      setArtboardPosition({
        x: newWidth / 2 - artboardSize.width / 2,
        y: newHeight / 2 - artboardSize.height / 2,
      });
    };
    updateSize();
  }, [artboardSize]);

  // Zoom handler
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // Click handler for selection
  const handleClick = (e: any) => {
    const clickedOnStage = e.target === e.target.getStage();
    if (clickedOnStage && !isPanning) {
      // เฉพาะเมื่อไม่ได้ลาก จึงจะ clear selection
      const currentPos = e.target.getStage().getPointerPosition();
      const distance = Math.sqrt(
        Math.pow(currentPos.x - dragStart.x, 2) +
          Math.pow(currentPos.y - dragStart.y, 2)
      );

      // ถ้าเคลื่อนที่น้อยกว่า 5 pixel ถือว่าเป็นการคลิก
      if (distance < 5) {
        setSelectedId(null);
        onImageSelect?.(null);
        onTextSelect?.(null);
        onShapeSelect?.(null);
      }
    }
  };

  // Stage panning handlers
  const handleMouseDown = (e: any) => {
    // เฉพาะเมื่อคลิกที่ Stage (background) เท่านั้น
    const clickedOnStage = e.target === e.target.getStage();
    if (clickedOnStage) {
      const pos = e.target.getStage().getPointerPosition();
      setDragStart(pos);
      setIsPanning(true);
      setLastPointerPosition(pos);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isPanning) return;

    const stage = e.target.getStage();
    const newPos = stage.getPointerPosition();

    if (lastPointerPosition) {
      const dx = newPos.x - lastPointerPosition.x;
      const dy = newPos.y - lastPointerPosition.y;

      // เพิ่ม threshold สำหรับการเริ่มลาก
      const distance = Math.sqrt(
        Math.pow(newPos.x - dragStart.x, 2) +
          Math.pow(newPos.y - dragStart.y, 2)
      );

      if (distance > 5) {
        document.body.style.cursor = "grabbing";
        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }
    }

    setLastPointerPosition(newPos);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    document.body.style.cursor = "default";
  };

  // Cleanup cursor on component unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  // Pan/Drag handlers for Stage - ปิดการใช้งานเพื่อไม่ให้ขัดแย้งกับ artboard dragging
  // const handleDragStart = () => {
  //   setIsDragging(true);
  // };

  // const handleDragEnd = () => {
  //   setIsDragging(false);
  // };

  // const handleDragMove = (e: any) => {
  //   if (isDragging) {
  //     setPosition({
  //       x: e.target.x(),
  //       y: e.target.y(),
  //     });
  //   }
  // };

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedId) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  // Text editing functions
  const startTextEditing = (
    textId: string,
    x: number,
    y: number,
    text: string
  ) => {
    setEditingTextId(textId);
    setEditingPosition({ x, y });
    setEditingValue(text);
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }, 0);
  };

  const completeTextEditing = () => {
    if (editingTextId && editingValue.trim()) {
      const updatedTexts = texts.map((text) =>
        text.id === editingTextId ? { ...text, text: editingValue } : text
      );
      handleTextChange(updatedTexts);
    }
    setEditingTextId(null);
    setEditingValue("");
  };

  const cancelTextEditing = () => {
    setEditingTextId(null);
    setEditingValue("");
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Undo/Redo Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`px-3 py-1 rounded text-sm ${
            canUndo
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title="Undo (Cmd+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`px-3 py-1 rounded text-sm ${
            canRedo
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title="Redo (Cmd+Shift+Z)"
        >
          ↷ Redo
        </button>
      </div>

      {/* Main Canvas */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        ref={stageRef}
        onWheel={handleWheel}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={-stageSize.width}
            y={-stageSize.height}
            width={stageSize.width * 3}
            height={stageSize.height * 3}
            fill="#f5f5f5"
            listening={false}
          />

          {/* Grid */}
          {Array.from(
            { length: Math.ceil((stageSize.width * 3) / 20) },
            (_, i) => (
              <Line
                key={`v-${i}`}
                points={[
                  i * 20 - stageSize.width,
                  -stageSize.height,
                  i * 20 - stageSize.width,
                  stageSize.height * 2,
                ]}
                stroke="#e0e0e0"
                strokeWidth={0.5}
                listening={false}
              />
            )
          )}
          {Array.from(
            { length: Math.ceil((stageSize.height * 3) / 20) },
            (_, i) => (
              <Line
                key={`h-${i}`}
                points={[
                  -stageSize.width,
                  i * 20 - stageSize.height,
                  stageSize.width * 2,
                  i * 20 - stageSize.height,
                ]}
                stroke="#e0e0e0"
                strokeWidth={0.5}
                listening={false}
              />
            )
          )}

          {/* Artboard */}
          <Rect
            id="artboard"
            x={artboardPosition.x}
            y={artboardPosition.y}
            width={artboardSize.width}
            height={artboardSize.height}
            fill="white"
            stroke="#999"
            strokeWidth={1}
            draggable={true}
            dragBoundFunc={(pos) => {
              // จำกัดการลากให้อยู่ในขอบเขตที่สมเหตุสมผล
              return {
                x: Math.max(
                  -200,
                  Math.min(pos.x, stageSize.width - artboardSize.width + 200)
                ),
                y: Math.max(
                  -200,
                  Math.min(pos.y, stageSize.height - artboardSize.height + 200)
                ),
              };
            }}
            onDragStart={() => {
              // เพิ่ม performance ตอนลาก
              document.body.style.cursor = "grabbing";
            }}
            onDragEnd={(e) => {
              document.body.style.cursor = "default";
              setArtboardPosition({
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onMouseEnter={() => {
              document.body.style.cursor = "grab";
            }}
            onMouseLeave={() => {
              document.body.style.cursor = "default";
            }}
            onClick={(e) => {
              // Prevent selecting artboard as an element
              e.cancelBubble = true;
            }}
          />

          {/* Shape Containers */}
          {shapeContainers.map((shape) => (
            <ShapeContainerComponent
              key={shape.id}
              shape={shape}
              onShapeChange={(updatedShape) => {
                const updatedShapes = shapeContainers.map((s) =>
                  s.id === shape.id ? updatedShape : s
                );
                handleShapeContainerChange(updatedShapes);
              }}
              onSelect={() => {
                setSelectedId(shape.id);
                onShapeSelect?.(shape);
              }}
            />
          ))}

          {/* Images */}
          {images.map((image) => (
            <Image
              key={image.id}
              id={image.id}
              x={image.x}
              y={image.y}
              width={image.width}
              height={image.height}
              image={(() => {
                const img = new window.Image();
                img.src = image.imageUrl;
                return img;
              })()}
              draggable
              onClick={() => {
                setSelectedId(image.id);
                onImageSelect?.(image);
              }}
              onDragEnd={(e) => {
                const updatedImages = images.map((img) =>
                  img.id === image.id
                    ? { ...img, x: e.target.x(), y: e.target.y() }
                    : img
                );
                handleImageChange(updatedImages);
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                const updatedImages = images.map((img) =>
                  img.id === image.id
                    ? {
                        ...img,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY),
                      }
                    : img
                );
                node.scaleX(1);
                node.scaleY(1);
                handleImageChange(updatedImages);
              }}
            />
          ))}

          {/* Texts */}
          {texts.map((text) => (
            <Text
              key={text.id}
              id={text.id}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize}
              fontFamily={text.fontFamily}
              fill={text.fill}
              fontStyle={text.fontStyle}
              width={text.width}
              height={text.height}
              draggable
              onClick={() => {
                setSelectedId(text.id);
                onTextSelect?.(text);
              }}
              onDblClick={() => {
                startTextEditing(text.id, text.x, text.y, text.text);
              }}
              onDragEnd={(e) => {
                const updatedTexts = texts.map((t) =>
                  t.id === text.id
                    ? { ...t, x: e.target.x(), y: e.target.y() }
                    : t
                );
                handleTextChange(updatedTexts);
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                const updatedTexts = texts.map((t) =>
                  t.id === text.id
                    ? {
                        ...t,
                        x: node.x(),
                        y: node.y(),
                        fontSize: Math.max(
                          8,
                          text.fontSize * Math.max(scaleX, scaleY)
                        ),
                        width: text.width ? text.width * scaleX : undefined,
                        height: text.height ? text.height * scaleY : undefined,
                      }
                    : t
                );
                node.scaleX(1);
                node.scaleY(1);
                handleTextChange(updatedTexts);
              }}
            />
          ))}

          {/* Transformer */}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>

      {/* Text Editing Overlay */}
      {editingTextId && (
        <div
          className="absolute z-50"
          style={{
            left: editingPosition.x * scale + position.x,
            top: editingPosition.y * scale + position.y,
          }}
        >
          <textarea
            ref={textInputRef}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                completeTextEditing();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelTextEditing();
              }
            }}
            onBlur={completeTextEditing}
            className="border border-blue-500 rounded px-2 py-1 text-black bg-white resize-none"
            style={{
              minWidth: "100px",
              minHeight: "30px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default KonvaCanvasWithShapes;
