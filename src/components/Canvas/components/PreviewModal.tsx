/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Stage, Layer, Rect, Image, Text, Circle, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type {
  ImageObject,
  TextObject,
  ShapeContainer,
  ArtboardSize,
} from "@/types/Shape";

// Helper function to create image element
const createImageElement = (src: string): HTMLImageElement => {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  return img;
};

interface Section {
  id: string;
  y: number;
  height: number;
  remark?: string;
  backgroundImage?: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artboardSize: ArtboardSize;
  artboardPosition?: { x: number; y: number };
  sections: Section[];
  images: ImageObject[];
  texts: TextObject[];
  shapeContainers?: ShapeContainer[];
  totalArtboardHeight: number;
  jsonData: object;
  onImageReplace: (imageId: string) => void;
  onTextEdit: (textId: string) => void;
  onImageDragEnd: (e: KonvaEventObject<DragEvent>, imageId: string) => void;
  onTextDragEnd: (e: KonvaEventObject<DragEvent>, textId: string) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (mode: boolean) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  artboardSize,
  artboardPosition = { x: 0, y: 0 },
  sections,
  images,
  texts,
  shapeContainers = [],
  totalArtboardHeight,
  jsonData,
  onImageReplace,
  onTextEdit,
  onImageDragEnd,
  onTextDragEnd,
  isPreviewMode,
  setIsPreviewMode,
}) => {
  if (!isOpen) return null;

  // Get artboard position
  const artboardX = artboardPosition.x;
  const artboardY = artboardPosition.y;

  // Filter function to check if object is inside artboard
  const isInsideArtboard = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    return (
      x >= artboardX &&
      y >= artboardY &&
      x + width <= artboardX + artboardSize.width &&
      y + height <= artboardY + artboardSize.height
    );
  };

  // Filter objects that are inside artboard
  const artboardImages = images.filter((img) =>
    isInsideArtboard(img.x, img.y, img.width, img.height)
  );

  const artboardTexts = texts.filter((text) =>
    isInsideArtboard(text.x, text.y, text.width || 100, text.height || 30)
  );

  const artboardShapes = shapeContainers.filter((shape) =>
    isInsideArtboard(shape.x, shape.y, shape.width, shape.height)
  );

  const handleClose = () => {
    onClose();
    setIsPreviewMode(false);
  };

  const handleExportJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    alert("Preview JSON copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-7xl max-h-[95vh] w-full mx-4 overflow-hidden shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-2xl">👁️</span>
            Preview Design
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
            onClick={handleClose}
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
        <div className="overflow-auto max-h-[85vh] bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border">
          {/* Preview Canvas */}
          <div className="flex justify-center items-center bg-gray-50 p-6 rounded-xl mb-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <Stage
                width={Math.min(artboardSize.width, 800)}
                height={Math.min(totalArtboardHeight, 600)}
                scaleX={Math.min(
                  800 / artboardSize.width,
                  600 / totalArtboardHeight,
                  1
                )}
                scaleY={Math.min(
                  800 / artboardSize.width,
                  600 / totalArtboardHeight,
                  1
                )}
              >
                <Layer>
                  {/* Preview Artboard Background */}
                  <Rect
                    x={0}
                    y={0}
                    width={artboardSize.width}
                    height={totalArtboardHeight}
                    fill="white"
                  />

                  {/* Preview Section Backgrounds */}
                  {sections.map((section) => {
                    if (section.backgroundImage) {
                      const bgImg = new window.Image();
                      bgImg.src = section.backgroundImage;
                      return (
                        <Rect
                          key={`preview-bg-${section.id}`}
                          x={0}
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

                  {/* Shape Containers - only ones inside artboard */}
                  {artboardShapes.map((shape) => {
                    // Render ShapeContainer - ทั้งกรอบและรูปภาพข้างใน
                    const shapeElements = [];

                    // Background shape - adjust position relative to artboard
                    if (shape.type === "circle") {
                      shapeElements.push(
                        <Circle
                          key={`shape-bg-${shape.id}`}
                          x={shape.x - artboardX + shape.width / 2}
                          y={shape.y - artboardY + shape.height / 2}
                          radius={Math.min(shape.width, shape.height) / 2}
                          fill={shape.imageUrl ? "transparent" : shape.fill}
                          stroke={shape.stroke || "#999"}
                          strokeWidth={shape.strokeWidth || 2}
                        />
                      );
                    } else if (shape.type === "rect") {
                      shapeElements.push(
                        <Rect
                          key={`shape-bg-${shape.id}`}
                          x={shape.x - artboardX}
                          y={shape.y - artboardY}
                          width={shape.width}
                          height={shape.height}
                          fill={shape.imageUrl ? "transparent" : shape.fill}
                          stroke={shape.stroke || "#999"}
                          strokeWidth={shape.strokeWidth || 2}
                        />
                      );
                    }

                    // Image inside shape (if exists)
                    if (shape.imageUrl) {
                      const img = createImageElement(shape.imageUrl);

                      const clipFunc = (ctx: any) => {
                        ctx.save();
                        ctx.beginPath();
                        if (shape.type === "circle") {
                          ctx.arc(
                            shape.x - artboardX + shape.width / 2,
                            shape.y - artboardY + shape.height / 2,
                            Math.min(shape.width, shape.height) / 2,
                            0,
                            Math.PI * 2
                          );
                        } else {
                          ctx.rect(
                            shape.x - artboardX,
                            shape.y - artboardY,
                            shape.width,
                            shape.height
                          );
                        }
                        ctx.clip();
                        ctx.restore();
                      };

                      shapeElements.push(
                        <Group
                          key={`shape-img-${shape.id}`}
                          clipFunc={clipFunc}
                        >
                          <Image
                            x={shape.x - artboardX}
                            y={shape.y - artboardY}
                            width={shape.width}
                            height={shape.height}
                            image={img}
                          />
                        </Group>
                      );

                      // Border on top - adjust position relative to artboard
                      if (shape.type === "circle") {
                        shapeElements.push(
                          <Circle
                            key={`shape-border-${shape.id}`}
                            x={shape.x - artboardX + shape.width / 2}
                            y={shape.y - artboardY + shape.height / 2}
                            radius={Math.min(shape.width, shape.height) / 2}
                            fill="transparent"
                            stroke={shape.stroke || "#999"}
                            strokeWidth={shape.strokeWidth || 2}
                          />
                        );
                      } else {
                        shapeElements.push(
                          <Rect
                            key={`shape-border-${shape.id}`}
                            x={shape.x - artboardX}
                            y={shape.y - artboardY}
                            width={shape.width}
                            height={shape.height}
                            fill="transparent"
                            stroke={shape.stroke || "#999"}
                            strokeWidth={shape.strokeWidth || 2}
                          />
                        );
                      }
                    }

                    return shapeElements;
                  })}

                  {/* Preview Images and Texts (sorted by zIndex) - only ones inside artboard */}
                  {[...artboardImages, ...artboardTexts]
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((item) => {
                      if ("imageUrl" in item) {
                        // Render Image with direct image creation - adjust position relative to artboard
                        const img = createImageElement(item.imageUrl);

                        return (
                          <Image
                            key={`preview-${item.id}`}
                            x={item.x - artboardX}
                            y={item.y - artboardY}
                            width={item.width}
                            height={item.height}
                            image={img}
                            draggable={isPreviewMode}
                            onClick={() => onImageReplace(item.id)}
                            onTap={() => onImageReplace(item.id)}
                            onDragEnd={(e) => onImageDragEnd(e, item.id)}
                            stroke={isPreviewMode ? "#3b82f6" : undefined}
                            strokeWidth={isPreviewMode ? 2 : 0}
                            dash={isPreviewMode ? [5, 5] : undefined}
                          />
                        );
                      } else {
                        // Render Text with drag capability - adjust position relative to artboard
                        return (
                          <Text
                            key={`preview-text-${item.id}`}
                            x={item.x - artboardX}
                            y={item.y - artboardY}
                            text={item.text}
                            fontSize={item.fontSize}
                            fontFamily={item.fontFamily}
                            fontStyle={item.fontStyle}
                            fill={item.fill}
                            draggable={isPreviewMode}
                            onClick={() => onTextEdit(item.id)}
                            onTap={() => onTextEdit(item.id)}
                            onDragEnd={(e) => onTextDragEnd(e, item.id)}
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
          </div>

          {/* Preview JSON Data */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2 text-sm text-gray-700">
              Configuration JSON:
            </h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32 bg-gray-50 p-2 rounded">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-3">
          <button
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center"
            onClick={handleExportJson}
          >
            <span className="mr-2">📋</span>
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
