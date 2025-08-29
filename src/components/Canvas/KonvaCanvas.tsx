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
  const [selectedText, setSelectedText] = useState<TextObject | null>(null);

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

  // สำหรับ panning
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

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
  const [isEditingComplete, setIsEditingComplete] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const addTextProcessedRef = useRef<boolean>(false);

  // Context menu states
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    elementId: string;
    elementType: "image" | "text";
  } | null>(null);

  // Use external props if provided
  const currentShowJsonModal = externalShowJsonModal ?? showJsonModal;
  const currentShowPreviewModal = externalShowPreviewModal ?? showPreviewModal;

  // Layer management functions
  const moveElementForward = (
    elementId: string,
    elementType: "image" | "text"
  ) => {
    if (elementType === "image") {
      const allElements = [...images, ...texts];
      const maxZIndex = Math.max(...allElements.map((el) => el.zIndex));
      const updatedImages = images.map((img) =>
        img.id === elementId
          ? { ...img, zIndex: Math.min(img.zIndex + 1, maxZIndex + 1) }
          : img
      );
      onImageChange?.(updatedImages);
    } else {
      const allElements = [...images, ...texts];
      const maxZIndex = Math.max(...allElements.map((el) => el.zIndex));
      const updatedTexts = texts.map((txt) =>
        txt.id === elementId
          ? { ...txt, zIndex: Math.min(txt.zIndex + 1, maxZIndex + 1) }
          : txt
      );
      onTextChange?.(updatedTexts);
    }
  };

  const moveElementBackward = (
    elementId: string,
    elementType: "image" | "text"
  ) => {
    if (elementType === "image") {
      const allElements = [...images, ...texts];
      const minZIndex = Math.min(...allElements.map((el) => el.zIndex));
      const updatedImages = images.map((img) =>
        img.id === elementId
          ? { ...img, zIndex: Math.max(img.zIndex - 1, minZIndex - 1) }
          : img
      );
      onImageChange?.(updatedImages);
    } else {
      const allElements = [...images, ...texts];
      const minZIndex = Math.min(...allElements.map((el) => el.zIndex));
      const updatedTexts = texts.map((txt) =>
        txt.id === elementId
          ? { ...txt, zIndex: Math.max(txt.zIndex - 1, minZIndex - 1) }
          : txt
      );
      onTextChange?.(updatedTexts);
    }
  };

  const moveElementToFront = (
    elementId: string,
    elementType: "image" | "text"
  ) => {
    const allElements = [...images, ...texts];
    const maxZIndex = Math.max(...allElements.map((el) => el.zIndex));

    if (elementType === "image") {
      const updatedImages = images.map((img) =>
        img.id === elementId ? { ...img, zIndex: maxZIndex + 1 } : img
      );
      onImageChange?.(updatedImages);
    } else {
      const updatedTexts = texts.map((txt) =>
        txt.id === elementId ? { ...txt, zIndex: maxZIndex + 1 } : txt
      );
      onTextChange?.(updatedTexts);
    }
  };

  const moveElementToBack = (
    elementId: string,
    elementType: "image" | "text"
  ) => {
    const allElements = [...images, ...texts];
    const minZIndex = Math.min(...allElements.map((el) => el.zIndex));

    if (elementType === "image") {
      const updatedImages = images.map((img) =>
        img.id === elementId ? { ...img, zIndex: minZIndex - 1 } : img
      );
      onImageChange?.(updatedImages);
    } else {
      const updatedTexts = texts.map((txt) =>
        txt.id === elementId ? { ...txt, zIndex: minZIndex - 1 } : txt
      );
      onTextChange?.(updatedTexts);
    }
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

  // Load Google Fonts for decorative text
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Alex+Brush&family=Parisienne&family=Allura&family=Sacramento&family=Cookie&family=Kaushan+Script&family=Satisfy&family=Herr+Von+Muellerhoff&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
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

  // ลบรูปเมื่อกดปุ่ม Delete หรือ Backspace
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        // เช็คว่า selectedId เป็นรูปภาพ
        const selectedImage = images.find((img) => img.id === selectedId);
        if (selectedImage) {
          const updatedImages = images.filter((img) => img.id !== selectedId);
          onImageChange?.(updatedImages);
          setSelectedId(null);
          onImageSelect?.(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, images, onImageChange, onImageSelect]);

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
      // Inline file upload handler to avoid dependency issues
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const newImage: ImageObject = {
              id: `image-${Date.now()}-${index}`,
              x: 100 + index * 50,
              y: 100 + index * 50,
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
        });
      };
      input.click();
    }
  }, [triggerFileUpload, images, onImageChange]);

  useEffect(() => {
    if (triggerAddText && !addTextProcessedRef.current) {
      addTextProcessedRef.current = true;

      const centerX = artboardPosition.x + artboardSize.width / 2;
      const centerY = artboardPosition.y + totalArtboardHeight / 2;
      // Inline text add handler
      const newText: TextObject = {
        id: `text-${Date.now()}`,
        x: centerX,
        y: centerY,
        text: "Double click to edit",
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
    }

    // Reset the flag when triggerAddText becomes false
    if (!triggerAddText) {
      addTextProcessedRef.current = false;
    }
  }, [
    triggerAddText,
    artboardPosition.x,
    artboardPosition.y,
    artboardSize.width,
    totalArtboardHeight,
    textSettings.fontSize,
    textSettings.fontFamily,
    textSettings.fontStyle,
    textSettings.fill,
    texts,
    images,
    onTextChange,
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
    setSelectedText(null);
    onImageSelect?.(image);
    onTextSelect?.(null);
    setContextMenu(null); // Hide context menu when selecting normally
  };

  const handleImageRightClick = (e: any, image: ImageObject) => {
    e.evt.preventDefault(); // Prevent browser context menu

    setContextMenu({
      visible: true,
      x: e.evt.clientX,
      y: e.evt.clientY,
      elementId: image.id,
      elementType: "image",
    });
  };

  const handleTextClick = (text: TextObject) => {
    setSelectedId(text.id);
    setSelectedText(text);
    onTextSelect?.(text);
    onImageSelect?.(null);
    setContextMenu(null); // Hide context menu when selecting normally

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

  const handleTextRightClick = (e: any, text: TextObject) => {
    e.evt.preventDefault(); // Prevent browser context menu

    setContextMenu({
      visible: true,
      x: e.evt.clientX,
      y: e.evt.clientY,
      elementId: text.id,
      elementType: "text",
    });
  };

  // Apply text settings to selected text
  const handleTextSettingsChange = (newSettings: typeof textSettings) => {
    if (!selectedText) return;

    const updatedTexts = texts.map((text) =>
      text.id === selectedText.id
        ? {
            ...text,
            fontSize: newSettings.fontSize,
            fontFamily: newSettings.fontFamily,
            fill: newSettings.fill,
            fontStyle: newSettings.fontStyle,
          }
        : text
    );
    onTextChange?.(updatedTexts);

    // Update selectedText state to reflect changes
    setSelectedText({
      ...selectedText,
      fontSize: newSettings.fontSize,
      fontFamily: newSettings.fontFamily,
      fill: newSettings.fill,
      fontStyle: newSettings.fontStyle,
    });
  };

  // Delete selected text
  const handleTextDelete = (textId: string) => {
    const updatedTexts = texts.filter((text) => text.id !== textId);
    onTextChange?.(updatedTexts);
    setSelectedText(null);
    setSelectedId(null);
    onTextSelect?.(null);
  };

  // Duplicate selected text
  const handleTextDuplicate = (text: TextObject) => {
    const newText: TextObject = {
      ...text,
      id: `text-${Date.now()}`,
      x: text.x + 20,
      y: text.y + 20,
      zIndex: Math.max(...texts.map((t) => t.zIndex), 0) + 1,
    };
    onTextChange?.([...texts, newText]);
  };

  const handleTextDoubleClick = (text: TextObject) => {
    // Start inline editing
    setEditingTextId(text.id);
    setIsEditingComplete(false);
    // If the text is the default placeholder, start with empty string
    const initialValue = text.text === "Double click to edit" ? "" : text.text;
    setEditingValue(initialValue);

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
        // Only select all text if it's not the placeholder
        if (text.text !== "Double click to edit") {
          textInputRef.current.select();
        }
      }
    }, 0);
  };

  const handleTextEditComplete = () => {
    if (isEditingComplete || !editingTextId || editingValue === null) {
      return;
    }

    setIsEditingComplete(true);

    // If the text is empty, remove the text element
    if (editingValue.trim() === "") {
      const updatedTexts = texts.filter((t) => t.id !== editingTextId);
      onTextChange?.(updatedTexts);
      // Also clear selection
      setSelectedId(null);
      setSelectedText(null);
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

  const handleTextEditCancel = () => {
    setEditingTextId(null);
    setEditingValue("");
    setIsEditingComplete(false);
  };

  const handleStageClick = (e: any) => {
    // Check if clicked on empty area or artboard
    if (
      e.target === e.target.getStage() ||
      e.target.getClassName() === "Rect"
    ) {
      setSelectedId(null);
      setSelectedText(null);
      onImageSelect?.(null);
      onTextSelect?.(null);
      // Only hide context menu when clicking on stage/artboard
      setContextMenu(null);
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

  // Render functions
  const renderText = (text: TextObject) => {
    // Don't render the text if it's currently being edited
    if (editingTextId === text.id) {
      return null;
    }

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
        onContextMenu={(e) => handleTextRightClick(e, text)}
        stroke={selectedId === text.id ? "#0066ff" : undefined}
        strokeWidth={selectedId === text.id ? 2 : 0}
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
        onContextMenu={(e) => handleImageRightClick(e, image)}
        stroke={selectedId === image.id ? "#0066ff" : undefined}
        strokeWidth={selectedId === image.id ? 2 : 0}
        alt=""
      />
    );
  };

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

  // Handle wheel zoom and trackpad pan (like Figma)
  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const evt = e.evt;
    const stage = stageRef.current;
    if (!stage) return;

    // ตรวจจับการ zoom ก่อน (pinch gesture หรือ Ctrl+scroll)
    if (evt.ctrlKey || evt.metaKey) {
      // Pinch to zoom หรือ Ctrl+scroll
      const scaleBy = 1.02;
      const oldScale = scale;
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      const direction = evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Limit zoom
      if (newScale < 0.1 || newScale > 5) return;

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setScale(newScale);
      setPosition(newPos);
      return;
    }

    // ตรวจจับ trackpad two-finger pan
    // เงื่อนไขที่เข้มงวดขึ้น: ต้องมี deltaX และ deltaY ไม่ใหญ่เกินไป (ไม่ใช่ mouse wheel)
    const hasHorizontalMovement = Math.abs(evt.deltaX) > 0.1;
    const isNotMouseWheel =
      Math.abs(evt.deltaY) < 50 && Math.abs(evt.deltaX) < 50;
    const isTrackpadPan =
      hasHorizontalMovement && isNotMouseWheel && !evt.ctrlKey && !evt.metaKey;

    if (isTrackpadPan) {
      // Two-finger pan gesture like Figma
      const panSensitivity = 1;
      setPosition({
        x: position.x - evt.deltaX * panSensitivity,
        y: position.y - evt.deltaY * panSensitivity,
      });
      return;
    }

    // ถ้าไม่ใช่ pan และไม่ใช่ zoom ที่มี modifier = mouse wheel zoom
    const scaleBy = 1.02;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = evt.deltaY > 0 ? -1 : 1;
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

  // Handle panning
  const handleMouseDown = (e: any) => {
    // เช็คว่าคลิกในพื้นที่ว่าง (ไม่ใช่ artboard หรือ element)
    const target = e.target;
    const isStage = target === target.getStage();
    const isGridLine =
      target.getClassName() === "Line" &&
      target.attrs.stroke === "rgba(0,0,0,0.1)";
    const isArtboard =
      target.getClassName() === "Rect" && target.attrs.fill === "white";

    // อนุญาตให้ pan เมื่อคลิกใน stage หรือ grid lines แต่ไม่ใช่ artboard
    if ((isStage || isGridLine) && !isArtboard) {
      setIsPanning(true);
      const stage = stageRef.current;
      if (stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          setLastPanPoint({ x: pointer.x, y: pointer.y });
        }
      }
    }
  };

  const handleMouseMove = () => {
    if (!isPanning) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const dx = pointer.x - lastPanPoint.x;
    const dy = pointer.y - lastPanPoint.y;

    setPosition({
      x: position.x + dx,
      y: position.y + dy,
    });

    setLastPanPoint({ x: pointer.x, y: pointer.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {/* Grid Pattern - Full coverage optimized dots */}
          {Array.from(
            { length: Math.ceil((stageSize.width * 2) / 20) + 10 },
            (_, i) => {
              const x = (i - 5) * 20 - (position.x % 20);
              return (
                <Line
                  key={`grid-v-${i}`}
                  points={[x, -stageSize.height * 2, x, stageSize.height * 4]}
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth={1.2 / scale}
                  dash={[0.8, 19.2]}
                  lineCap="round"
                />
              );
            }
          )}
          {Array.from(
            { length: Math.ceil((stageSize.height * 2) / 20) + 10 },
            (_, i) => {
              const y = (i - 5) * 20 - (position.y % 20);
              return (
                <Line
                  key={`grid-h-${i}`}
                  points={[-stageSize.width * 2, y, stageSize.width * 4, y]}
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth={1.2 / scale}
                  dash={[0.8, 19.2]}
                  lineCap="round"
                />
              );
            }
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
          {[...images, ...texts]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((item) =>
              "imageUrl" in item ? renderImage(item) : renderText(item)
            )
            .filter(Boolean)}

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

      {/* Text Settings Panel */}
      {selectedText && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">✏️</span>
              Text Settings
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Customize selected text appearance
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={textSettings.fontFamily}
                onChange={(e) => {
                  const newSettings = {
                    ...textSettings,
                    fontFamily: e.target.value,
                  };
                  setTextSettings(newSettings);
                  handleTextSettingsChange(newSettings);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Impact">Impact</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Alex Brush">Alex Brush</option>
                <option value="Parisienne">Parisienne</option>
                <option value="Allura">Allura</option>
                <option value="Sacramento">Sacramento</option>
                <option value="Cookie">Cookie</option>
                <option value="Kaushan Script">Kaushan Script</option>
                <option value="Satisfy">Satisfy</option>
                <option value="Herr Von Muellerhoff">
                  Herr Von Muellerhoff
                </option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {textSettings.fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="120"
                value={textSettings.fontSize}
                onChange={(e) => {
                  const newSettings = {
                    ...textSettings,
                    fontSize: parseInt(e.target.value),
                  };
                  setTextSettings(newSettings);
                  handleTextSettingsChange(newSettings);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>8px</span>
                <span>120px</span>
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "normal", label: "Normal" },
                  { value: "bold", label: "Bold" },
                  { value: "italic", label: "Italic" },
                  { value: "bold italic", label: "Bold Italic" },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => {
                      const newSettings = {
                        ...textSettings,
                        fontStyle: style.value as typeof textSettings.fontStyle,
                      };
                      setTextSettings(newSettings);
                      handleTextSettingsChange(newSettings);
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      textSettings.fontStyle === style.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={textSettings.fill}
                  onChange={(e) => {
                    const newSettings = {
                      ...textSettings,
                      fill: e.target.value,
                    };
                    setTextSettings(newSettings);
                    handleTextSettingsChange(newSettings);
                  }}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textSettings.fill}
                  onChange={(e) => {
                    const newSettings = {
                      ...textSettings,
                      fill: e.target.value,
                    };
                    setTextSettings(newSettings);
                    handleTextSettingsChange(newSettings);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTextDelete(selectedText.id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => handleTextDuplicate(selectedText)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  📋 Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Context Menu */}
      {contextMenu?.visible && (
        <>
          {/* Background overlay to catch clicks outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />

          <div
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2 min-w-[180px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
              Layer Options
            </div>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              onClick={() => {
                moveElementForward(
                  contextMenu.elementId,
                  contextMenu.elementType
                );
                setContextMenu(null);
              }}
            >
              <span className="mr-2">⬆️</span>
              Bring Forward
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              onClick={() => {
                moveElementBackward(
                  contextMenu.elementId,
                  contextMenu.elementType
                );
                setContextMenu(null);
              }}
            >
              <span className="mr-2">⬇️</span>
              Send Backward
            </button>

            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => {
                  moveElementToFront(
                    contextMenu.elementId,
                    contextMenu.elementType
                  );
                  setContextMenu(null);
                }}
              >
                <span className="mr-2">⏫</span>
                Bring to Front
              </button>

              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => {
                  moveElementToBack(
                    contextMenu.elementId,
                    contextMenu.elementType
                  );
                  setContextMenu(null);
                }}
              >
                <span className="mr-2">⏬</span>
                Send to Back
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KonvaCanvas;
