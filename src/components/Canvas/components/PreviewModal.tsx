import React from "react";
import { Stage, Layer, Rect, Image, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { ImageObject, TextObject, ArtboardSize } from "@/types/Shape";

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
  sections: Section[];
  images: ImageObject[];
  texts: TextObject[];
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
  sections,
  images,
  texts,
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
      <div className="bg-white rounded-2xl p-8 max-w-6xl max-h-[90vh] w-full mx-6 overflow-hidden shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3 text-3xl">👁️</span>
            Preview Artboard
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
                        fillPatternScaleY={section.height / (bgImg.height || 1)}
                      />
                    );
                  }
                  return null;
                })}

                {/* Preview Images and Texts (sorted by zIndex) */}
                {[...images, ...texts]
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
                          onClick={() => onImageReplace(item.id)}
                          onTap={() => onImageReplace(item.id)}
                          onDragEnd={(e) => onImageDragEnd(e, item.id)}
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

          {/* Preview JSON Data */}
          <div className="mt-4 bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Configuration JSON:</h3>
            <pre className="text-xs text-black overflow-auto max-h-40">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
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
