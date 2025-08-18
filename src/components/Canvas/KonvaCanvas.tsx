/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Line,
  Text,
  Image,
} from "react-konva";
import type { ImageObject, TextObject, ArtboardSize } from "@/types/Shape";

interface Section {
  id: string;
  y: number; // ตำแหน่ง y ของการแบ่ง section
  height: number; // ความสูงของ section
  remark?: string; // ข้อความหมายเหตุ
  backgroundImage?: string; // URL รูปพื้นหลัง section
}

interface KonvaCanvasProps {
  images: ImageObject[];
  texts: TextObject[];
  onImageChange?: (images: ImageObject[]) => void;
  onTextChange?: (texts: TextObject[]) => void;
  onImageSelect?: (image: ImageObject | null) => void;
  onTextSelect?: (text: TextObject | null) => void;
  artboardSize: ArtboardSize;
  showJsonModal?: boolean;
  onShowJsonModal?: (show: boolean) => void;
  showPreviewModal?: boolean;
  onShowPreviewModal?: (show: boolean) => void;
  triggerFileUpload?: boolean;
  triggerAddText?: boolean;
}

const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  images = [],
  texts = [],
  artboardSize,
  onImageChange,
  onTextChange,
  onImageSelect,
  onTextSelect,
  showJsonModal: externalShowJsonModal,
  onShowJsonModal,
  showPreviewModal: externalShowPreviewModal,
  onShowPreviewModal,
  triggerFileUpload,
  triggerAddText,
}) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Text customization states
  const [textSettings, setTextSettings] = useState({
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#000000",
    fontStyle: "normal" as "normal" | "bold" | "italic" | "bold italic",
  });

  const [sections] = useState<Section[]>([
    { id: "section-1", y: 50, height: artboardSize.height, remark: "" },
  ]);
  const [guidelines, setGuidelines] = useState<
    Array<{
      type: "vertical" | "horizontal";
      position: number;
      show: boolean;
    }>
  >([]);

  // สำหรับ zoom และ pan
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // สำหรับ artboard dragging
  const [artboardPosition, setArtboardPosition] = useState({ x: 50, y: 50 });

  // สำหรับ JSON review modal
  const [showJsonModal, setShowJsonModal] = useState(false);

  // สำหรับ Preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // สำหรับ Inline Text Editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState({ x: 0, y: 0 });
  const [editingValue, setEditingValue] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Use external props if provided
  const currentShowJsonModal = externalShowJsonModal ?? showJsonModal;
  const currentShowPreviewModal = externalShowPreviewModal ?? showPreviewModal;

  // Handle new text addition to artboard
  const handleNewTextAdd = (
    x: number,
    y: number,
    textContent: string = "Double click to edit"
  ) => {
    const newText: TextObject = {
      id: `text-${Date.now()}`,
      x,
      y,
      text: textContent,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      fontStyle: textSettings.fontStyle,
      fill: textSettings.fill,
      draggable: true,
      zIndex:
        Math.max(
          ...texts.map((txt) => txt.zIndex),
          ...images.map((img) => img.zIndex),
          0
        ) + 1,
    };
    onTextChange?.([...texts, newText]);
  };

  // Handle new image upload to artboard
  const handleNewImageUpload = (file: File, x: number, y: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newImage: ImageObject = {
        id: `image-${Date.now()}`,
        x,
        y,
        width: 200,
        height: 150,
        imageUrl,
        draggable: true,
        zIndex: Math.max(...images.map((img) => img.zIndex), 0) + 1,
        name: file.name,
      };
      onImageChange?.([...images, newImage]);
    };
    reader.readAsDataURL(file);
  };

  // Generate JSON data for export
  const generateArtboardJson = () => {
    return {
      artboard: {
        size: artboardSize,
        width: artboardSize.width,
        height: totalArtboardHeight,
      },
      sections: sections,
      images: images,
      texts: texts,
      totalImages: images.length,
      totalTexts: texts.length,
    };
  };

  // Handle preview mode image replacement
  const handlePreviewImageReplace = (imageId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const updatedImages = images.map((img) =>
            img.id === imageId ? { ...img, imageUrl } : img
          );
          onImageChange?.(updatedImages);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle preview mode text editing
  const handlePreviewTextEdit = (textId: string) => {
    const text = texts.find((t) => t.id === textId);
    if (!text) return;

    const newText = prompt("Edit text:", text.text);
    if (newText !== null) {
      const updatedTexts = texts.map((t) =>
        t.id === textId ? { ...t, text: newText } : t
      );
      onTextChange?.(updatedTexts);
    }
  };

  // Handle preview mode image drag
  const handlePreviewImageDragEnd = (e: any, imageId: string) => {
    const updatedImages = images.map((img) => {
      if (img.id === imageId) {
        return {
          ...img,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return img;
    });
    onImageChange?.(updatedImages);
  };

  // Handle preview mode text drag
  const handlePreviewTextDragEnd = (e: any, textId: string) => {
    const updatedTexts = texts.map((text) => {
      if (text.id === textId) {
        return {
          ...text,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return text;
    });
    onTextChange?.(updatedTexts);
  };

  // คำนวณความสูงรวมของ artboard
  const totalArtboardHeight = sections.reduce(
    (total, section) => total + section.height,
    0
  );

  // Update stage size on window resize
  useEffect(() => {
    const updateStageSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateStageSize);
    updateStageSize();

    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  // Handle text editing focus and auto-resize
  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      // Auto-resize on initial focus
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.style.height = "auto";
          textInputRef.current.style.height =
            textInputRef.current.scrollHeight + "px";
          textInputRef.current.style.width = "auto";
          textInputRef.current.style.width =
            Math.max(50, textInputRef.current.scrollWidth) + "px";
        }
      }, 0);
    }
  }, [editingTextId]);

  // Handle external triggers
  useEffect(() => {
    if (triggerFileUpload) {
      handleFileUpload();
    }
  }, [triggerFileUpload]);

  useEffect(() => {
    if (triggerAddText) {
      const centerX = artboardPosition.x + artboardSize.width / 2;
      const centerY = artboardPosition.y + totalArtboardHeight / 2;
      handleNewTextAdd(centerX, centerY);
    }
  }, [
    triggerAddText,
    artboardPosition.x,
    artboardPosition.y,
    artboardSize.width,
  ]);

  // Auto-scale images when artboard size changes
  const [prevArtboardSize, setPrevArtboardSize] = useState(artboardSize);
  useEffect(() => {
    if (
      images.length > 0 &&
      (prevArtboardSize.width !== artboardSize.width ||
        prevArtboardSize.height !== artboardSize.height)
    ) {
      const scaleX = artboardSize.width / prevArtboardSize.width;
      const scaleY = artboardSize.height / prevArtboardSize.height;

      const scaledImages = images.map((image) => ({
        ...image,
        x: image.x * scaleX,
        y: image.y * scaleY,
        width: image.width * scaleX,
        height: image.height * scaleY,
      }));

      onImageChange?.(scaledImages);
    }
    setPrevArtboardSize(artboardSize);
  }, [artboardSize, images, prevArtboardSize, onImageChange]);

  // Calculate guidelines for alignment
  const calculateGuidelines = (
    draggedImage: ImageObject,
    otherImages: ImageObject[]
  ) => {
    const snapTolerance = 5;
    const guidelines: Array<{
      type: "vertical" | "horizontal";
      position: number;
      show: boolean;
    }> = [];

    const draggedBounds = getImageBounds(draggedImage);

    // Center guidelines (artboard center)
    const artboardCenterX = 50 + artboardSize.width / 2;
    const artboardCenterY = 50 + totalArtboardHeight / 2;

    // Check alignment with artboard center
    if (Math.abs(draggedBounds.centerX - artboardCenterX) < snapTolerance) {
      guidelines.push({
        type: "vertical",
        position: artboardCenterX,
        show: true,
      });
    }

    if (Math.abs(draggedBounds.centerY - artboardCenterY) < snapTolerance) {
      guidelines.push({
        type: "horizontal",
        position: artboardCenterY,
        show: true,
      });
    }

    // Check alignment with other images
    otherImages.forEach((image) => {
      const bounds = getImageBounds(image);

      // Vertical alignment
      if (Math.abs(draggedBounds.left - bounds.left) < snapTolerance) {
        guidelines.push({
          type: "vertical",
          position: bounds.left,
          show: true,
        });
      }
      if (Math.abs(draggedBounds.right - bounds.right) < snapTolerance) {
        guidelines.push({
          type: "vertical",
          position: bounds.right,
          show: true,
        });
      }
      if (Math.abs(draggedBounds.centerX - bounds.centerX) < snapTolerance) {
        guidelines.push({
          type: "vertical",
          position: bounds.centerX,
          show: true,
        });
      }

      // Horizontal alignment
      if (Math.abs(draggedBounds.top - bounds.top) < snapTolerance) {
        guidelines.push({
          type: "horizontal",
          position: bounds.top,
          show: true,
        });
      }
      if (Math.abs(draggedBounds.bottom - bounds.bottom) < snapTolerance) {
        guidelines.push({
          type: "horizontal",
          position: bounds.bottom,
          show: true,
        });
      }
      if (Math.abs(draggedBounds.centerY - bounds.centerY) < snapTolerance) {
        guidelines.push({
          type: "horizontal",
          position: bounds.centerY,
          show: true,
        });
      }
    });

    return guidelines;
  };

  const getImageBounds = (image: ImageObject) => {
    return {
      left: image.x,
      right: image.x + image.width,
      top: image.y,
      bottom: image.y + image.height,
      centerX: image.x + image.width / 2,
      centerY: image.y + image.height / 2,
    };
  };

  // Render section dividers and remarks
  const renderSectionDividers = () => {
    const elements: React.ReactElement[] = [];

    sections.forEach((section, index) => {
      // Section divider line (except for the first section)
      if (index > 0) {
        elements.push(
          <Line
            key={`divider-${section.id}`}
            points={[
              artboardPosition.x,
              artboardPosition.y + section.y - 50,
              artboardPosition.x + artboardSize.width,
              artboardPosition.y + section.y - 50,
            ]}
            stroke="#ff6b6b"
            strokeWidth={2}
            dash={[5, 5]}
          />
        );
      }

      // Section remark
      if (section.remark) {
        elements.push(
          <Text
            key={`remark-${section.id}`}
            x={artboardPosition.x + 10}
            y={artboardPosition.y + section.y - 40}
            text={section.remark}
            fontSize={12}
            fill="#666"
          />
        );
      }
    });

    return elements;
  };

  const handleImageClick = (image: ImageObject) => {
    setSelectedId(image.id);
    onImageSelect?.(image);
    onTextSelect?.(null);
  };

  const handleTextClick = (text: TextObject) => {
    setSelectedId(text.id);
    onTextSelect?.(text);
    onImageSelect?.(null);

    // โหลด settings จาก selected text
    setTextSettings({
      fontSize: text.fontSize,
      fontFamily: text.fontFamily,
      fill: text.fill,
      fontStyle: (text.fontStyle || "normal") as
        | "normal"
        | "bold"
        | "italic"
        | "bold italic",
    });
  };

  const handleTextDoubleClick = (text: TextObject) => {
    // Start inline editing
    setEditingTextId(text.id);
    setEditingValue(text.text);

    // Calculate position for input overlay
    const stage = stageRef.current;
    if (stage) {
      const stageBox = stage.container().getBoundingClientRect();
      // Use artboard position and text position relative to artboard
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
        textInputRef.current.select();
      }
    }, 0);
  };

  const handleTextEditComplete = () => {
    if (editingTextId && editingValue !== null) {
      const updatedTexts = texts.map((t) =>
        t.id === editingTextId ? { ...t, text: editingValue } : t
      );
      onTextChange?.(updatedTexts);
    }
    setEditingTextId(null);
    setEditingValue("");
  };

  const handleTextEditCancel = () => {
    setEditingTextId(null);
    setEditingValue("");
  };

  const handleStageClick = (e: any) => {
    // Check if clicked on empty area or artboard
    if (
      e.target === e.target.getStage() ||
      e.target.getClassName() === "Rect"
    ) {
      setSelectedId(null);
      onImageSelect?.(null);
      onTextSelect?.(null);
    }
  };

  const handleImageDragMove = (e: any, imageId: string) => {
    const draggedImage = images.find((img) => img.id === imageId);
    if (!draggedImage) return;

    const otherImages = images.filter((img) => img.id !== imageId);
    const guidelines = calculateGuidelines(
      {
        ...draggedImage,
        x: e.target.x(),
        y: e.target.y(),
      },
      otherImages
    );
    setGuidelines(guidelines);
  };

  const handleTextDragMove = () => {
    // ไม่แสดง guidelines สำหรับ text เพื่อให้เรียบง่าย
    setGuidelines([]);
  };

  const handleTextDragEnd = (e: any, textId: string) => {
    const newTexts = texts.map((text) => {
      if (text.id === textId) {
        return {
          ...text,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return text;
    });
    onTextChange?.(newTexts);
    setGuidelines([]);
  };

  // File upload trigger
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach((file, index) => {
        handleNewImageUpload(file, 100 + index * 50, 100 + index * 50);
      });
    };
    input.click();
  };

  // Render functions
  const renderText = (text: TextObject) => {
    return (
      <Text
        key={text.id}
        id={text.id}
        x={text.x}
        y={text.y}
        text={text.text}
        fontSize={text.fontSize}
        fontFamily={text.fontFamily}
        fontStyle={text.fontStyle || "normal"}
        fill={text.fill}
        draggable={text.draggable}
        onClick={() => handleTextClick(text)}
        onDblClick={() => handleTextDoubleClick(text)}
        onDragMove={() => handleTextDragMove()}
        onDragEnd={(e) => handleTextDragEnd(e, text.id)}
        onTransformEnd={handleTransformEnd}
        stroke={selectedId === text.id ? "#0066ff" : undefined}
        strokeWidth={selectedId === text.id ? 2 : 0}
        visible={editingTextId !== text.id}
      />
    );
  };

  const renderImage = (image: ImageObject) => {
    const imageObj = new window.Image();
    imageObj.src = image.imageUrl;

    return (
      <Image
        key={image.id}
        id={image.id}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        image={imageObj}
        draggable={image.draggable}
        onClick={() => handleImageClick(image)}
        onDragMove={(e) => handleImageDragMove(e, image.id)}
        onDragEnd={(e) => handleImageDragEnd(e, image.id)}
        onTransformEnd={handleTransformEnd}
        stroke={selectedId === image.id ? "#0066ff" : undefined}
        strokeWidth={selectedId === image.id ? 2 : 0}
        alt=""
      />
    );
  };

  // Sort images by zIndex
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

  // Transform handlers
  const handleImageDragEnd = (e: any, imageId: string) => {
    setGuidelines([]);
    const newImages = images.map((image) => {
      if (image.id === imageId) {
        return {
          ...image,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return image;
    });
    onImageChange?.(newImages);
  };

  const handleTransformEnd = () => {
    if (!selectedId) return;

    const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
    if (selectedNode) {
      // Check if it's an image
      const selectedImage = images.find((img) => img.id === selectedId);
      if (selectedImage) {
        const newImages = images.map((image) => {
          if (image.id === selectedId) {
            return {
              ...image,
              x: selectedNode.x(),
              y: selectedNode.y(),
              width: selectedNode.width() * selectedNode.scaleX(),
              height: selectedNode.height() * selectedNode.scaleY(),
            };
          }
          return image;
        });
        onImageChange?.(newImages);
        // Reset scale after applying to dimensions
        selectedNode.scaleX(1);
        selectedNode.scaleY(1);
      }

      // Check if it's a text
      const selectedText = texts.find((txt) => txt.id === selectedId);
      if (selectedText) {
        const newTexts = texts.map((text) => {
          if (text.id === selectedId) {
            return {
              ...text,
              x: selectedNode.x(),
              y: selectedNode.y(),
              fontSize: text.fontSize * selectedNode.scaleY(),
            };
          }
          return text;
        });
        onTextChange?.(newTexts);
        // Reset scale after applying to dimensions
        selectedNode.scaleX(1);
        selectedNode.scaleY(1);
      }
    }
  };

  // Handle zoom
  const handleZoom = (type: "in" | "out") => {
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const newScale = type === "in" ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom levels
    if (newScale < 0.1 || newScale > 5) return;

    const pointer = stage.getPointerPosition() || {
      x: stageSize.width / 2,
      y: stageSize.height / 2,
    };

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom
    if (newScale < 0.1 || newScale > 5) return;

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // Reset view
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setArtboardPosition({ x: 50, y: 50 });
  };

  // Handle artboard drag
  const handleArtboardDragStart = () => {
    // อาจจะเพิ่ม visual feedback ในอนาคต
  };

  const handleArtboardDragMove = (e: any) => {
    setArtboardPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleArtboardDragEnd = () => {
    // อาจจะเพิ่ม save state ในอนาคต
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main Canvas */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        ref={stageRef}
      >
        <Layer>
          {/* Grid Pattern */}
          {Array.from(
            { length: Math.ceil(stageSize.width / (20 * scale)) + 1 },
            (_, i) => (
              <Line
                key={`grid-v-${i}`}
                points={[
                  i * 20 * scale - (position.x % (20 * scale)),
                  0,
                  i * 20 * scale - (position.x % (20 * scale)),
                  stageSize.height,
                ]}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={0.5}
              />
            )
          )}
          {Array.from(
            { length: Math.ceil(stageSize.height / (20 * scale)) + 1 },
            (_, i) => (
              <Line
                key={`grid-h-${i}`}
                points={[
                  0,
                  i * 20 * scale - (position.y % (20 * scale)),
                  stageSize.width,
                  i * 20 * scale - (position.y % (20 * scale)),
                ]}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={0.5}
              />
            )
          )}

          {/* Artboard Background */}
          <Rect
            x={artboardPosition.x}
            y={artboardPosition.y}
            width={artboardSize.width}
            height={totalArtboardHeight}
            fill="white"
            stroke="#ccc"
            strokeWidth={2}
            draggable={true}
            onDragStart={handleArtboardDragStart}
            onDragMove={handleArtboardDragMove}
            onDragEnd={handleArtboardDragEnd}
          />

          {/* Section Backgrounds */}
          {sections.map((section) => {
            if (section.backgroundImage) {
              const bgImg = new window.Image();
              bgImg.src = section.backgroundImage;
              return (
                <Rect
                  key={`bg-${section.id}`}
                  x={artboardPosition.x}
                  y={artboardPosition.y + section.y - 50}
                  width={artboardSize.width}
                  height={section.height}
                  fillPatternImage={bgImg}
                  fillPatternRepeat="no-repeat"
                  fillPatternScaleX={artboardSize.width / (bgImg.width || 1)}
                  fillPatternScaleY={section.height / (bgImg.height || 1)}
                />
              );
            }
            return null;
          })}

          {/* Images and Texts (sorted by zIndex) */}
          {[...sortedImages, ...texts.sort((a, b) => a.zIndex - b.zIndex)]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((item) =>
              "imageUrl" in item ? renderImage(item) : renderText(item)
            )}

          {/* Section Dividers and Remarks */}
          {renderSectionDividers()}

          {/* Guidelines */}
          {guidelines.map((guideline, index) => (
            <Line
              key={`guideline-${index}`}
              points={
                guideline.type === "vertical"
                  ? [
                      guideline.position,
                      0,
                      guideline.position,
                      stageSize.height,
                    ]
                  : [0, guideline.position, stageSize.width, guideline.position]
              }
              stroke="#ff0000"
              strokeWidth={1}
              dash={[4, 4]}
              opacity={0.8}
            />
          ))}
        </Layer>

        {/* Transformer */}
        <Layer>
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            className="w-8 h-8 bg-white shadow rounded flex items-center justify-center text-sm hover:bg-gray-50"
            onClick={() => handleZoom("out")}
            title="Zoom Out"
          >
            -
          </button>
          <button
            className="bg-white shadow rounded px-2 py-1 text-sm hover:bg-gray-50 cursor-pointer"
            onClick={handleResetView}
            title="Reset View"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            className="w-8 h-8 bg-white shadow rounded flex items-center justify-center text-sm hover:bg-gray-50"
            onClick={() => handleZoom("in")}
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

      {/* JSON Review Modal */}
      {currentShowJsonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-5xl max-h-[90vh] w-full mx-6 overflow-hidden shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-3 text-3xl">📄</span>
                Artboard Configuration
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                onClick={() => {
                  if (onShowJsonModal) {
                    onShowJsonModal(false);
                  } else {
                    setShowJsonModal(false);
                  }
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] bg-gray-50 rounded-xl p-4 border">
              <pre className="text-sm text-gray-800 font-mono leading-relaxed">
                {JSON.stringify(generateArtboardJson(), null, 2)}
              </pre>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                onClick={() => {
                  if (onShowJsonModal) {
                    onShowJsonModal(false);
                  } else {
                    setShowJsonModal(false);
                  }
                }}
              >
                Close
              </button>
              <button
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(generateArtboardJson(), null, 2)
                  );
                  alert("JSON copied to clipboard!");
                }}
              >
                <span className="mr-2">📋</span>
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {currentShowPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-6xl max-h-[90vh] w-full mx-6 overflow-hidden shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-3 text-3xl">👁️</span>
                Preview Artboard
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                onClick={() => {
                  if (onShowPreviewModal) {
                    onShowPreviewModal(false);
                  } else {
                    setShowPreviewModal(false);
                  }
                  setIsPreviewMode(false);
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
              <div className="text-sm mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <strong className="text-blue-800 flex items-center mb-2">
                  <span className="mr-2">✨</span>
                  Preview Mode Instructions:
                </strong>
                <ul className="mt-2 space-y-1 text-blue-700 leading-relaxed">
                  <li>• Click on images to replace them with new uploads</li>
                  <li>• Double-click on texts to edit their content inline</li>
                  <li>• Drag images and texts to reposition them</li>
                  <li>• All changes will be saved to your design</li>
                  <li>• Cannot add new items in preview mode</li>
                </ul>
              </div>

              {/* Preview Canvas */}
              <div className="bg-white inline-block border-2 border-gray-300 rounded">
                <Stage
                  width={artboardSize.width + 100}
                  height={totalArtboardHeight + 100}
                  scaleX={0.8}
                  scaleY={0.8}
                >
                  <Layer>
                    {/* Preview Artboard Background */}
                    <Rect
                      x={50}
                      y={50}
                      width={artboardSize.width}
                      height={totalArtboardHeight}
                      fill="white"
                      stroke="#ccc"
                      strokeWidth={1}
                    />

                    {/* Preview Section Backgrounds */}
                    {sections.map((section) => {
                      if (section.backgroundImage) {
                        const bgImg = new window.Image();
                        bgImg.src = section.backgroundImage;
                        return (
                          <Rect
                            key={`preview-bg-${section.id}`}
                            x={50}
                            y={section.y}
                            width={artboardSize.width}
                            height={section.height}
                            fillPatternImage={bgImg}
                            fillPatternRepeat="no-repeat"
                            fillPatternScaleX={
                              artboardSize.width / (bgImg.width || 1)
                            }
                            fillPatternScaleY={
                              section.height / (bgImg.height || 1)
                            }
                          />
                        );
                      }
                      return null;
                    })}

                    {/* Preview Images and Texts (sorted by zIndex) */}
                    {[
                      ...sortedImages,
                      ...texts.sort((a, b) => a.zIndex - b.zIndex),
                    ]
                      .sort((a, b) => a.zIndex - b.zIndex)
                      .map((item) => {
                        if ("imageUrl" in item) {
                          // Render Image with drag capability
                          const imageObj = new window.Image();
                          imageObj.src = item.imageUrl;
                          return (
                            <Image
                              key={`preview-${item.id}`}
                              x={item.x}
                              y={item.y}
                              width={item.width}
                              height={item.height}
                              image={imageObj}
                              draggable={isPreviewMode}
                              onClick={() => handlePreviewImageReplace(item.id)}
                              onTap={() => handlePreviewImageReplace(item.id)}
                              onDragEnd={(e) =>
                                handlePreviewImageDragEnd(e, item.id)
                              }
                              stroke={isPreviewMode ? "#3b82f6" : undefined}
                              strokeWidth={isPreviewMode ? 2 : 0}
                              dash={isPreviewMode ? [5, 5] : undefined}
                              alt=""
                            />
                          );
                        } else {
                          // Render Text with drag capability
                          return (
                            <Text
                              key={`preview-text-${item.id}`}
                              x={item.x}
                              y={item.y}
                              text={item.text}
                              fontSize={item.fontSize}
                              fontFamily={item.fontFamily}
                              fontStyle={item.fontStyle}
                              fill={item.fill}
                              draggable={isPreviewMode}
                              onClick={() => handlePreviewTextEdit(item.id)}
                              onTap={() => handlePreviewTextEdit(item.id)}
                              onDragEnd={(e) =>
                                handlePreviewTextDragEnd(e, item.id)
                              }
                              stroke={isPreviewMode ? "#3b82f6" : undefined}
                              strokeWidth={isPreviewMode ? 1 : 0}
                              dash={isPreviewMode ? [3, 3] : undefined}
                            />
                          );
                        }
                      })}
                  </Layer>
                </Stage>
              </div>

              {/* Preview JSON Data */}
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Configuration JSON:</h3>
                <pre className="text-xs text-black overflow-auto max-h-40">
                  {JSON.stringify(generateArtboardJson(), null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                onClick={() => {
                  if (onShowPreviewModal) {
                    onShowPreviewModal(false);
                  } else {
                    setShowPreviewModal(false);
                  }
                  setIsPreviewMode(false);
                }}
              >
                Close
              </button>
              <button
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(generateArtboardJson(), null, 2)
                  );
                  alert("Preview JSON copied to clipboard!");
                }}
              >
                <span className="mr-2">📋</span>
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Text Editor Overlay */}
      {editingTextId && (
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
            onChange={(e) => {
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
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextEditComplete();
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleTextEditCancel();
              }
            }}
            onBlur={handleTextEditComplete}
            className="pointer-events-auto bg-transparent border-2 border-blue-500 rounded px-1 py-0 text-black resize-none overflow-hidden"
            style={{
              fontSize:
                texts.find((t) => t.id === editingTextId)?.fontSize || 24,
              fontFamily:
                texts.find((t) => t.id === editingTextId)?.fontFamily ||
                "Arial",
              fontStyle:
                texts.find((t) => t.id === editingTextId)?.fontStyle ||
                "normal",
              color:
                texts.find((t) => t.id === editingTextId)?.fill || "#000000",
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
      )}
    </div>
  );
};

export default KonvaCanvas;
