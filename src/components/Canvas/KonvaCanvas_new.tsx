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
import type { ImageObject, ArtboardSize } from "@/types/Shape";

interface Section {
  id: string;
  y: number; // ตำแหน่ง y ของการแบ่ง section
  height: number; // ความสูงของ section
  remark?: string; // ข้อความหมายเหตุ
  backgroundImage?: string; // URL รูปพื้นหลัง section
}

interface KonvaCanvasProps {
  images: ImageObject[];
  onImageChange?: (images: ImageObject[]) => void;
  onImageSelect?: (image: ImageObject | null) => void;
  artboardSize: ArtboardSize;
  onAddSection?: () => void;
}

const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  images = [],
  artboardSize,
  onImageChange,
  onImageSelect,
  onAddSection,
}) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [sections, setSections] = useState<Section[]>([
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

  // สำหรับ JSON review modal
  const [showJsonModal, setShowJsonModal] = useState(false);

  // สำหรับ Preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // สำหรับ Layer Management
  const [showLayerPanel, setShowLayerPanel] = useState(false);

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
      totalImages: images.length,
    };
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

  // Add section functionality
  const addSection = () => {
    const lastSection = sections[sections.length - 1];
    const newSection: Section = {
      id: `section-${sections.length + 1}`,
      y: lastSection.y + lastSection.height,
      height: 300, // default height
      remark: "",
    };
    setSections([...sections, newSection]);
    onAddSection?.();
  };

  // Remove section
  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      const updatedSections = sections.filter((s) => s.id !== sectionId);
      // Recalculate positions
      let currentY = 50;
      const repositionedSections = updatedSections.map((section) => {
        const updatedSection = { ...section, y: currentY };
        currentY += section.height;
        return updatedSection;
      });
      setSections(repositionedSections);
    }
  };

  // Update section remark
  const updateSectionRemark = (sectionId: string, remark: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, remark } : section
    );
    setSections(updatedSections);
  };

  // Update section height
  const updateSectionHeight = (sectionId: string, height: number) => {
    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...sections];
    updatedSections[sectionIndex].height = height;

    // Recalculate positions for subsequent sections
    let currentY = 50;
    for (let i = 0; i < updatedSections.length; i++) {
      updatedSections[i].y = currentY;
      currentY += updatedSections[i].height;
    }

    setSections(updatedSections);
  };

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
            points={[50, section.y, 50 + artboardSize.width, section.y]}
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
            x={60}
            y={section.y + 10}
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
  };

  const handleStageClick = (e: any) => {
    // Check if clicked on empty area
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      onImageSelect?.(null);
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
  };

  // File upload trigger
  const triggerFileUpload = () => {
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

  // Layer management functions
  const moveImageToFront = (imageId: string) => {
    const maxZIndex = Math.max(...images.map((img) => img.zIndex));
    const updatedImages = images.map((img) =>
      img.id === imageId ? { ...img, zIndex: maxZIndex + 1 } : img
    );
    onImageChange?.(updatedImages);
  };

  const moveImageToBack = (imageId: string) => {
    const minZIndex = Math.min(...images.map((img) => img.zIndex));
    const updatedImages = images.map((img) =>
      img.id === imageId ? { ...img, zIndex: minZIndex - 1 } : img
    );
    onImageChange?.(updatedImages);
  };

  const moveImageUp = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    const higherImages = images.filter((img) => img.zIndex > image.zIndex);
    if (higherImages.length === 0) return;

    const nextZIndex = Math.min(...higherImages.map((img) => img.zIndex));
    const updatedImages = images.map((img) => {
      if (img.id === imageId) return { ...img, zIndex: nextZIndex + 0.1 };
      if (img.zIndex === nextZIndex) return { ...img, zIndex: image.zIndex };
      return img;
    });
    onImageChange?.(updatedImages);
  };

  const moveImageDown = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    const lowerImages = images.filter((img) => img.zIndex < image.zIndex);
    if (lowerImages.length === 0) return;

    const prevZIndex = Math.max(...lowerImages.map((img) => img.zIndex));
    const updatedImages = images.map((img) => {
      if (img.id === imageId) return { ...img, zIndex: prevZIndex - 0.1 };
      if (img.zIndex === prevZIndex) return { ...img, zIndex: image.zIndex };
      return img;
    });
    onImageChange?.(updatedImages);
  };

  const deleteImage = (imageId: string) => {
    const updatedImages = images.filter((img) => img.id !== imageId);
    onImageChange?.(updatedImages);
    if (selectedId === imageId) {
      setSelectedId(null);
      onImageSelect?.(null);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Upload Button */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
          onClick={triggerFileUpload}
        >
          Upload Images
        </button>
        <button
          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow text-sm"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
        >
          Layers
        </button>
      </div>

      {/* Layer Panel */}
      {showLayerPanel && (
        <div className="absolute top-4 left-52 z-20 bg-white rounded shadow-lg border p-4 w-64 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3">Layer Management</h3>
          <div className="space-y-2">
            {sortedImages
              .slice()
              .reverse()
              .map((image) => (
                <div
                  key={image.id}
                  className={`p-2 border rounded ${
                    selectedId === image.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-sm font-medium truncate"
                      title={image.name}
                    >
                      {image.name || `Image ${image.id}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      z:{Math.floor(image.zIndex)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => moveImageToFront(image.id)}
                      title="Bring to Front"
                    >
                      ⬆⬆
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => moveImageUp(image.id)}
                      title="Bring Forward"
                    >
                      ⬆
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => moveImageDown(image.id)}
                      title="Send Backward"
                    >
                      ⬇
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => moveImageToBack(image.id)}
                      title="Send to Back"
                    >
                      ⬇⬇
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-red-200 hover:bg-red-300 rounded"
                      onClick={() => deleteImage(image.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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
            x={50}
            y={50}
            width={artboardSize.width}
            height={totalArtboardHeight}
            fill="white"
            stroke="#ccc"
            strokeWidth={2}
          />

          {/* Section Backgrounds */}
          {sections.map((section) => {
            if (section.backgroundImage) {
              const bgImg = new window.Image();
              bgImg.src = section.backgroundImage;
              return (
                <Rect
                  key={`bg-${section.id}`}
                  x={50}
                  y={section.y}
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

          {/* Images */}
          {sortedImages.map(renderImage)}

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

      {/* Control Panel */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded shadow"
          onClick={() => setShowJsonModal(true)}
        >
          Review JSON
        </button>
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow"
          onClick={() => setShowPreviewModal(true)}
        >
          Preview
        </button>
      </div>

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

      {/* Section Management */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded shadow text-sm"
          onClick={addSection}
        >
          Add Section
        </button>
        <div className="bg-white rounded shadow-lg border p-3 max-w-xs max-h-48 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">Sections</h3>
          {sections.map((section, index) => (
            <div key={section.id} className="mb-2 p-2 border rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Section {index + 1}</span>
                {sections.length > 1 && (
                  <button
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => removeSection(section.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Remark..."
                value={section.remark || ""}
                onChange={(e) =>
                  updateSectionRemark(section.id, e.target.value)
                }
                className="w-full text-xs border rounded px-1 py-0.5 mb-1"
              />
              <input
                type="number"
                placeholder="Height"
                value={section.height}
                onChange={(e) =>
                  updateSectionHeight(
                    section.id,
                    parseInt(e.target.value) || 300
                  )
                }
                className="w-full text-xs border rounded px-1 py-0.5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* JSON Review Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Artboard Configuration</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowJsonModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh]">
              <pre className="text-sm text-black">
                {JSON.stringify(generateArtboardJson(), null, 2)}
              </pre>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => setShowJsonModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(generateArtboardJson(), null, 2)
                  );
                  alert("JSON copied to clipboard!");
                }}
              >
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Preview Artboard</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] bg-gray-100 p-4 rounded">
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

                    {/* Preview Images */}
                    {sortedImages.map((image) => {
                      const imageObj = new window.Image();
                      imageObj.src = image.imageUrl;
                      return (
                        <Image
                          key={`preview-${image.id}`}
                          x={image.x}
                          y={image.y}
                          width={image.width}
                          height={image.height}
                          image={imageObj}
                          alt=""
                        />
                      );
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
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(generateArtboardJson(), null, 2)
                  );
                  alert("Preview JSON copied to clipboard!");
                }}
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KonvaCanvas;
