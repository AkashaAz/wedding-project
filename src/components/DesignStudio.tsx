"use client";

import React, { useState } from "react";
import TopToolbar from "@/components/Layout/TopToolbar";
import SidePanel from "@/components/Layout/SidePanel";
import Artboard from "@/components/Canvas/Artboard";
import type {
  ImageObject,
  TextObject,
  ShapeContainer,
  ArtboardSize,
} from "@/types/Shape";
import { ARTBOARD_SIZES } from "@/types/Shape";

const DesignStudio: React.FC = () => {
  const [selectedArtboardSize, setSelectedArtboardSize] =
    useState<ArtboardSize>(ARTBOARD_SIZES[0]);
  const [images, setImages] = useState<ImageObject[]>([]);
  const [texts, setTexts] = useState<TextObject[]>([]);
  const [shapeContainers, setShapeContainers] = useState<ShapeContainer[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null);
  const [selectedText, setSelectedText] = useState<TextObject | null>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeContainer | null>(
    null
  );

  // States for UI controls
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [triggerFileUpload, setTriggerFileUpload] = useState(false);
  const [triggerAddText, setTriggerAddText] = useState(false);

  const handleImageChange = (newImages: ImageObject[]) => {
    setImages(newImages);
  };

  const handleTextChange = (newTexts: TextObject[]) => {
    setTexts(newTexts);
  };

  const handleShapeContainerChange = (newShapes: ShapeContainer[]) => {
    setShapeContainers(newShapes);
  };

  const handleImageSelect = (image: ImageObject | null) => {
    setSelectedImage(image);
    if (image) {
      setSelectedText(null);
      setSelectedShape(null);
    }
  };

  const handleTextSelect = (text: TextObject | null) => {
    setSelectedText(text);
    if (text) {
      setSelectedImage(null);
      setSelectedShape(null);
    }
  };

  const handleShapeSelect = (shape: ShapeContainer | null) => {
    setSelectedShape(shape);
    if (shape) {
      setSelectedImage(null);
      setSelectedText(null);
    }
  };

  const handleArtboardSizeChange = (newSize: ArtboardSize) => {
    setSelectedArtboardSize(newSize);
  };

  const handleExportTemplate = () => {
    const imageTemplate = images.map((image) => ({
      id: image.id,
      name: image.name,
      position: { x: image.x, y: image.y },
      size: { width: image.width, height: image.height },
      zIndex: image.zIndex,
      imageUrl: image.imageUrl,
    }));

    const textTemplate = texts.map((text) => ({
      id: text.id,
      text: text.text,
      position: { x: text.x, y: text.y },
      fontSize: text.fontSize,
      fontFamily: text.fontFamily,
      fill: text.fill,
      zIndex: text.zIndex,
    }));

    const shapeTemplate = shapeContainers.map((shape) => ({
      id: shape.id,
      type: shape.type,
      position: { x: shape.x, y: shape.y },
      size: { width: shape.width, height: shape.height },
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      zIndex: shape.zIndex,
      imageUrl: shape.imageUrl,
      name: shape.name,
    }));

    const template = {
      images: imageTemplate,
      texts: textTemplate,
      shapeContainers: shapeTemplate,
      artboardSize: selectedArtboardSize,
    };

    console.log("=== COMPLETE TEMPLATE ===");
    console.log(JSON.stringify(template, null, 2));
    console.log("========================");
  };

  const handleClearAll = () => {
    setImages([]);
    setTexts([]);
    setShapeContainers([]);
    setSelectedImage(null);
    setSelectedText(null);
    setSelectedShape(null);
    console.log("Template cleared - all images, texts, and shapes removed");
  };

  // Function to add new shape container
  const handleAddShapeContainer = (shapeType: ShapeContainer["type"]) => {
    const newShape: ShapeContainer = {
      id: `shape_${Date.now()}`,
      type: shapeType,
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      fill: "#f0f0f0",
      stroke: "#999",
      strokeWidth: 2,
      draggable: true,
      zIndex: shapeContainers.length + 1,
      cropEnabled: true,
    };
    setShapeContainers([...shapeContainers, newShape]);
  };

  // SidePanel handlers
  const handleUploadImages = () => {
    setTriggerFileUpload(true);
    setTimeout(() => setTriggerFileUpload(false), 100);
  };

  const handleAddText = () => {
    setTriggerAddText(true);
    setTimeout(() => setTriggerAddText(false), 100);
  };

  const handleReviewJSON = () => {
    setShowJsonModal(!showJsonModal);
  };

  const handlePreview = () => {
    setShowPreviewModal(!showPreviewModal);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Toolbar */}
      <TopToolbar
        onExportTemplate={handleExportTemplate}
        onClearAll={handleClearAll}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel */}
        <SidePanel
          selectedArtboardSize={selectedArtboardSize}
          onArtboardSizeChange={handleArtboardSizeChange}
          onUploadImages={handleUploadImages}
          onAddText={handleAddText}
          onAddShapeContainer={handleAddShapeContainer}
          onReviewJSON={handleReviewJSON}
          onPreview={handlePreview}
        />

        {/* Artboard Area */}
        <Artboard
          images={images}
          texts={texts}
          shapeContainers={shapeContainers}
          artboardSize={selectedArtboardSize}
          onImageChange={handleImageChange}
          onTextChange={handleTextChange}
          onShapeContainerChange={handleShapeContainerChange}
          onImageSelect={handleImageSelect}
          onTextSelect={handleTextSelect}
          onShapeSelect={handleShapeSelect}
          showJsonModal={showJsonModal}
          onShowJsonModal={setShowJsonModal}
          showPreviewModal={showPreviewModal}
          onShowPreviewModal={setShowPreviewModal}
          triggerFileUpload={triggerFileUpload}
          triggerAddText={triggerAddText}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-100 border-t border-gray-300 flex items-center px-4 text-xs text-gray-600">
        <span>Ready</span>
        <span className="ml-auto">
          {selectedImage
            ? `Selected Image: ${selectedImage.name || selectedImage.id}`
            : selectedText
            ? `Selected Text: ${selectedText.text}`
            : selectedShape
            ? `Selected Shape: ${selectedShape.type} ${
                selectedShape.name || selectedShape.id
              }`
            : "No selection"}
        </span>
      </div>
    </div>
  );
};

export default DesignStudio;
