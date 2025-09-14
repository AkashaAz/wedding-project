"use client";

import React, { useState, useEffect, useRef } from "react";
import HeroCard from "../../components/Layout/HeroCard";
import InfoCard from "../../components/Layout/InfoCard";
import GalleryCard from "../../components/Layout/GalleryCard";
import { FullScreenHero } from "../../components/Layout/FullScreenHero";
import { ParallaxFullScreenHero } from "../../components/Layout/ParallaxFullScreenHero";
import { WeddingInvitation } from "../../components/Layout/WeddingInvitation";

// Types for layout components
interface LayoutComponent {
  id: string;
  componentName: string;
  x: number;
  y: number;
  width: string; // percentage of artboard
  height: string; // percentage of artboard or 'auto'
  props: Record<string, unknown>;
  zIndex: number;
}

interface PropSchema {
  type: string;
  label: string;
  default?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  maxItems?: number;
}

interface LayoutDefinition {
  componentName: string;
  displayName: string;
  category: string;
  description: string;
  propsSchema: Record<string, PropSchema>;
  defaultLayout: {
    width: string;
    height: string;
    aspectRatio: string;
  };
}

const COMPONENT_MAP = {
  WeddingInvitation,
  FullScreenHero,
  ParallaxFullScreenHero,
  HeroCard,
  InfoCard,
  GalleryCard,
};

export default function PreviewPage() {
  // Modal state for layout selection
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [layoutDefinitions, setLayoutDefinitions] = useState<
    LayoutDefinition[]
  >([]);
  const [artboardComponents, setArtboardComponents] = useState<
    LayoutComponent[]
  >([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [artboardSize, setArtboardSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(100);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    componentId: string | null;
    startComponentX: number;
    startComponentY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    componentId: null,
    startComponentX: 0,
    startComponentY: 0,
  });

  // Load layout definitions from JSON
  useEffect(() => {
    fetch("/layout.json")
      .then((res) => res.json())
      .then((data) => setLayoutDefinitions(data))
      .catch((err) => console.error("Failed to load layout definitions:", err));
  }, []);

  // Calculate dynamic artboard size based on components
  const calculateDynamicArtboardSize = React.useCallback(() => {
    // Start with minimum artboard size
    let maxX = Math.max(artboardSize.width, 800);
    let maxY = Math.max(artboardSize.height, 600);

    if (artboardComponents.length === 0) {
      return { width: maxX, height: maxY };
    }

    artboardComponents.forEach((component) => {
      const componentWidth = component.width.includes("%")
        ? (parseInt(component.width) / 100) * artboardSize.width
        : parseInt(component.width) || 200;

      const componentHeight =
        component.height === "auto"
          ? 200 // Estimate for auto height
          : component.height.includes("%")
          ? (parseInt(component.height) / 100) * artboardSize.height
          : parseInt(component.height) || 200;

      const rightEdge = component.x + componentWidth;
      const bottomEdge = component.y + componentHeight;

      maxX = Math.max(maxX, rightEdge + 100); // Add padding
      maxY = Math.max(maxY, bottomEdge + 100); // Add padding
    });

    return { width: maxX, height: maxY };
  }, [artboardComponents, artboardSize]);

  const dynamicArtboardSize = calculateDynamicArtboardSize();

  // Handle adding component to artboard
  const addComponentToArtboard = (componentName: string) => {
    const definition = layoutDefinitions.find(
      (def) => def.componentName === componentName
    );
    if (!definition) return;

    // Create default props from schema
    const defaultProps: Record<string, unknown> = {};
    Object.entries(definition.propsSchema).forEach(([key, schema]) => {
      defaultProps[key] = schema.default;
    });

    // Calculate smart positioning to avoid overlap
    const getSmartPosition = () => {
      const startX = 50;
      const startY = 50;

      if (artboardComponents.length === 0) {
        return { x: startX, y: startY };
      }

      // Try to position below the last component
      const lastComponent = artboardComponents[artboardComponents.length - 1];
      const estimatedHeight =
        lastComponent.height === "auto"
          ? 300
          : lastComponent.height.includes("%")
          ? (parseInt(lastComponent.height) / 100) * artboardSize.height
          : parseInt(lastComponent.height) || 300;

      return {
        x: startX,
        y: lastComponent.y + estimatedHeight + 50,
      };
    };

    const position = getSmartPosition();

    const newComponent: LayoutComponent = {
      id: `${componentName}_${Date.now()}`,
      componentName,
      x: position.x,
      y: position.y,
      width: definition.defaultLayout.width.includes("%")
        ? definition.defaultLayout.width
        : "50%",
      height: definition.defaultLayout.height === "auto" ? "auto" : "40%",
      props: defaultProps,
      zIndex: nextZIndex,
    };

    setArtboardComponents((prev) => [...prev, newComponent]);
    setNextZIndex((prev) => prev + 1);
    setSelectedComponent(newComponent.id);
  };

  // Handle component selection and drag start
  const handleComponentMouseDown = (
    componentId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedComponent(componentId);

    const component = artboardComponents.find(
      (comp) => comp.id === componentId
    );
    if (!component) return;

    // Start drag tracking but don't set dragging to true yet
    dragRef.current = {
      isDragging: false, // Will be set to true when mouse moves enough
      startX: e.clientX,
      startY: e.clientY,
      componentId,
      startComponentX: component.x,
      startComponentY: component.y,
    };
  };

  // Handle mouse move for dragging
  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current.componentId) return;

      // Check if we should start dragging (mouse moved more than 5px)
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only start dragging if mouse moved enough
      if (!dragRef.current.isDragging && distance > 5) {
        dragRef.current.isDragging = true;
        setIsDragging(true);
      }

      if (!dragRef.current.isDragging) return;

      const scaledDeltaX = deltaX / (zoom / 100);
      const scaledDeltaY = deltaY / (zoom / 100);

      const component = artboardComponents.find(
        (comp) => comp.id === dragRef.current.componentId
      );
      if (!component) return;

      // Calculate component dimensions
      const componentWidth = component.width.includes("%")
        ? (parseInt(component.width) / 100) * artboardSize.width
        : parseInt(component.width) || 200;
      const componentHeight = component.height.includes("%")
        ? (parseInt(component.height) / 100) * artboardSize.height
        : parseInt(component.height) || 100;

      // Constrain to artboard bounds - use dynamic size
      const currentDynamicSize = calculateDynamicArtboardSize();
      const newX = Math.max(
        0,
        Math.min(
          currentDynamicSize.width - componentWidth,
          dragRef.current.startComponentX + scaledDeltaX
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          currentDynamicSize.height - componentHeight,
          dragRef.current.startComponentY + scaledDeltaY
        )
      );

      setArtboardComponents((prev) =>
        prev.map((comp) =>
          comp.id === dragRef.current.componentId
            ? { ...comp, x: newX, y: newY }
            : comp
        )
      );
    },
    [zoom, artboardComponents, artboardSize, calculateDynamicArtboardSize]
  );

  // Handle mouse up to end dragging
  const handleMouseUp = React.useCallback(() => {
    dragRef.current.isDragging = false;
    dragRef.current.componentId = null;
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle component selection
  const handleComponentClick = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Only handle click if we're not in the middle of dragging
    if (!dragRef.current.isDragging) {
      setSelectedComponent(componentId);
    }
  };

  // Handle artboard click (deselect)
  const handleArtboardClick = () => {
    setSelectedComponent(null);
  };

  // Update component props
  const updateComponentProps = (
    componentId: string,
    propKey: string,
    value: unknown
  ) => {
    setArtboardComponents((prev) =>
      prev.map((comp) =>
        comp.id === componentId
          ? { ...comp, props: { ...comp.props, [propKey]: value } }
          : comp
      )
    );
  };

  // Delete component
  const deleteComponent = (componentId: string) => {
    setArtboardComponents((prev) =>
      prev.filter((comp) => comp.id !== componentId)
    );
    setSelectedComponent(null);
  };

  // Export artboard as JSON
  const exportArtboard = () => {
    const exportData = {
      artboard: {
        width: artboardSize.width,
        height: artboardSize.height,
        backgroundColor: "#ffffff",
      },
      components: artboardComponents,
      metadata: {
        createdAt: new Date().toISOString(),
        version: "1.0",
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert("Artboard exported to clipboard!");
  };

  // Export as HTML/TSX page
  const exportAsHTML = () => {
    if (artboardComponents.length === 0) {
      alert("Please add some components to export!");
      return;
    }

    // Generate import statements
    const uniqueComponents = Array.from(
      new Set(artboardComponents.map((comp) => comp.componentName))
    );

    const imports = uniqueComponents
      .map((compName) => {
        if (compName === "FullScreenHero" || compName === "WeddingInvitation") {
          return `import { ${compName} } from "@/components/Layout/${compName}";`;
        }
        return `import ${compName} from "@/components/Layout/${compName}";`;
      })
      .join("\n");

    // Generate clean component JSX without positioning
    const componentsJSX = artboardComponents
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((comp) => {
        const propsString = Object.entries(comp.props)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `        ${key}="${value}"`;
            } else if (typeof value === "number") {
              return `        ${key}={${value}}`;
            } else if (Array.isArray(value)) {
              return `        ${key}={${JSON.stringify(value)}}`;
            }
            return `        ${key}={${JSON.stringify(value)}}`;
          })
          .join("\n");

        return `      <${comp.componentName}
${propsString}
      />`;
      })
      .join("\n\n");

    // Generate complete page.tsx content
    const htmlContent = `"use client";

import React from "react";
${imports}

export default function GeneratedPage() {
  return (
    <div className="min-h-screen">
${componentsJSX}
    </div>
  );
}

// Component Props Types (for reference)
${uniqueComponents
  .map((compName) => {
    const definition = layoutDefinitions.find(
      (def) => def.componentName === compName
    );
    if (!definition) return "";

    const propTypes = Object.entries(definition.propsSchema)
      .map(([key, schema]) => {
        let type = "string";
        if (schema.type === "number") type = "number";
        if (schema.type === "imageArray") type = "string[]";
        return `  ${key}?: ${type};`;
      })
      .join("\n");

    return `/*
interface ${compName}Props {
${propTypes}
}
*/`;
  })
  .join("\n\n")}`;

    // Download as file
    const blob = new Blob([htmlContent], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(
      "✅ page.tsx file downloaded!\n\n📁 You can now:\n1. Copy the file to your Next.js project\n2. Place it in app/your-page/page.tsx\n3. Make sure Layout components are in @/components/Layout/\n4. The page will be fully responsive!"
    );
  };

  // Import artboard from JSON
  const importArtboard = () => {
    const jsonString = prompt("Paste your artboard JSON here:");
    if (jsonString) {
      try {
        const importData = JSON.parse(jsonString);
        if (importData.components && Array.isArray(importData.components)) {
          setArtboardComponents(importData.components);
          if (importData.artboard) {
            setArtboardSize({
              width: importData.artboard.width || 800,
              height: importData.artboard.height || 600,
            });
          }
          const maxZ = Math.max(
            ...importData.components.map(
              (comp: LayoutComponent) => comp.zIndex
            ),
            0
          );
          setNextZIndex(maxZ + 1);
        }
      } catch {
        alert("Invalid JSON format!");
      }
    }
  };

  // Render component based on type
  const renderComponent = (component: LayoutComponent) => {
    const ComponentType =
      COMPONENT_MAP[component.componentName as keyof typeof COMPONENT_MAP];
    if (!ComponentType) return null;

    return <ComponentType {...component.props} />;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9ecf3] to-[#dbe6f6]">
      {/* Layout Selection Modal (always overlay, outside main layout) */}
      {showLayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-10 relative flex flex-col"
            style={{ minHeight: "60vh", minWidth: "700px" }}
          >
            {/* Modal Header with Tabs */}
            <div className="flex gap-2 border-b mb-4">
              {Array.from(
                new Set(layoutDefinitions.map((ld) => ld.category))
              ).map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${
                    activeTab === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Modal Content: Layouts by selected tab */}
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {layoutDefinitions
                .filter((ld) => !activeTab || ld.category === activeTab)
                .map((definition) => (
                  <div
                    key={definition.componentName}
                    className="border border-gray-200 bg-white rounded-xl p-4 hover:border-blue-400 cursor-pointer transition-colors shadow-sm"
                    onClick={() => {
                      addComponentToArtboard(definition.componentName);
                      setShowLayoutModal(false);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 drop-shadow-sm">
                        {definition.displayName}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {definition.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {definition.description}
                    </p>
                  </div>
                ))}
            </div>
            {/* Close Modal Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowLayoutModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6 flex gap-6">
        {/* Component Library Sidebar */}
        <div
          className="w-80 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 flex flex-col"
          style={{ boxShadow: "0 8px 32px 0 rgba(31,38,135,0.12)" }}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-900 drop-shadow-sm">
            Layout Components
          </h2>
          {/* Artboard Controls */}
          <div className="mb-6 p-4 bg-white/40 rounded-2xl border border-white/30 shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-800">
              Artboard Settings
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={artboardSize.width}
                  onChange={(e) =>
                    setArtboardSize((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value) || 800,
                    }))
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm bg-white/70 text-gray-800 focus:ring-2 focus:ring-blue-200"
                  placeholder="Width"
                />
                <span className="text-sm text-gray-500 py-1">×</span>
                <input
                  type="number"
                  value={artboardSize.height}
                  onChange={(e) =>
                    setArtboardSize((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value) || 600,
                    }))
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm bg-white/70 text-gray-800 focus:ring-2 focus:ring-blue-200"
                  placeholder="Height"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportArtboard}
                  className="px-3 py-1 bg-blue-600/90 text-white rounded-xl text-sm hover:bg-blue-700/90 shadow"
                >
                  Export JSON
                </button>
                <button
                  onClick={importArtboard}
                  className="px-3 py-1 bg-green-600/90 text-white rounded-xl text-sm hover:bg-green-700/90 shadow"
                >
                  Import
                </button>
              </div>
              <button
                onClick={exportAsHTML}
                className="w-full px-3 py-2 bg-purple-600/90 text-white rounded-xl text-sm hover:bg-purple-700/90 flex items-center justify-center gap-2 shadow"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Export as page.tsx
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow ${
                  previewMode
                    ? "bg-orange-600/90 text-white hover:bg-orange-700/90"
                    : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                </svg>
                {previewMode ? "Design Mode" : "Preview Mode"}
              </button>
            </div>
          </div>
          {/* Mode Info */}
          {!previewMode && (
            <div className="mt-4 bg-white/40 p-4 rounded-xl border text-sm text-gray-600">
              <p className="font-medium mb-2">🎨 Design Mode</p>
              <p>Click and drag components to position them on the artboard.</p>
            </div>
          )}
          {previewMode && (
            <div className="mt-4 bg-blue-50/80 p-4 rounded-xl border text-sm text-blue-800">
              <p className="font-medium mb-2">👁️ Preview Mode</p>
              <p>
                This shows how your layout will look when exported - components
                flow naturally without absolute positioning.
              </p>
            </div>
          )}
          {/* Layout Selection Button (opens modal) */}
          {!previewMode && (
            <div className="flex flex-col items-center mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-colors font-semibold"
                onClick={() => setShowLayoutModal(true)}
              >
                Choose Layout
              </button>
            </div>
          )}
        </div>
        {/* Main Artboard Area */}
        <div className="flex-1">
          <div
            className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6"
            style={{ boxShadow: "0 8px 32px 0 rgba(31,38,135,0.10)" }}
          >
            {/* Zoom Controls */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm">
                {previewMode ? "Layout Preview" : "Artboard Design"}
              </h2>
              {!previewMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((prev) => Math.max(25, prev - 25))}
                    className="px-3 py-1 border border-gray-300 rounded-lg bg-white/70 hover:bg-gray-100/80 shadow text-black"
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={() => setZoom((prev) => Math.min(200, prev + 25))}
                    className="px-3 py-1 border border-gray-300 rounded-lg bg-white/70 hover:bg-gray-100/80 shadow text-black"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Artboard */}
            <div className="overflow-auto border-2 border-white/30 bg-white/40 p-4 rounded-2xl">
              {previewMode ? (
                /* Preview Mode - Natural Flow Layout */
                <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg overflow-hidden min-h-screen">
                  {artboardComponents
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((component) => (
                      <div key={component.id} className="w-full">
                        {renderComponent(component)}
                      </div>
                    ))}
                  {artboardComponents.length === 0 && (
                    <div className="flex items-center justify-center h-96 text-gray-400">
                      <div className="text-center">
                        <p className="text-lg mb-2">Empty Preview</p>
                        <p className="text-sm">
                          Add components to see the preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Design Mode - Positioned Layout */
                <div
                  ref={artboardRef}
                  onClick={handleArtboardClick}
                  className="relative bg-white/80 shadow-lg mx-auto rounded-2xl"
                  style={{
                    width: `${dynamicArtboardSize.width * (zoom / 100)}px`,
                    height: `${dynamicArtboardSize.height * (zoom / 100)}px`,
                    transform: `scale(1)`,
                    transformOrigin: "top left",
                  }}
                >
                  {/* Components on artboard */}
                  {artboardComponents.map((component) => (
                    <div
                      key={component.id}
                      onClick={(e) => handleComponentClick(component.id, e)}
                      onMouseDown={(e) =>
                        handleComponentMouseDown(component.id, e)
                      }
                      className={`absolute transition-all select-none ${
                        selectedComponent === component.id
                          ? "ring-2 ring-blue-500 ring-opacity-50"
                          : "hover:ring-1 hover:ring-gray-300"
                      } ${
                        isDragging &&
                        dragRef.current.componentId === component.id
                          ? "cursor-grabbing shadow-lg scale-105 ring-4 ring-blue-400 ring-opacity-30"
                          : selectedComponent === component.id
                          ? "cursor-move"
                          : "cursor-pointer"
                      }`}
                      style={{
                        left: `${component.x * (zoom / 100)}px`,
                        top: `${component.y * (zoom / 100)}px`,
                        width: component.width.includes("%")
                          ? `${
                              (parseInt(component.width) / 100) *
                              artboardSize.width *
                              (zoom / 100)
                            }px`
                          : component.width,
                        height:
                          component.height === "auto"
                            ? "auto"
                            : component.height.includes("%")
                            ? `${
                                (parseInt(component.height) / 100) *
                                artboardSize.height *
                                (zoom / 100)
                              }px`
                            : component.height,
                        zIndex: component.zIndex,
                        fontSize: `${zoom / 100}em`,
                      }}
                    >
                      {/* Component content - allow pointer events for clicking but prevent text selection */}
                      <div
                        className="w-full h-full"
                        style={{ userSelect: "none" }}
                      >
                        {renderComponent(component)}
                      </div>

                      {/* Selection indicators and controls */}
                      {selectedComponent === component.id && (
                        <>
                          {/* Drag handle */}
                          <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-500 rounded-full cursor-move flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M13 6v5h5V9.5l3.5 3.5-3.5 3.5V14h-5v5h1.5L10.5 22.5 7 19h1.5v-5H3v1.5L-.5 12 3 8.5V10h5.5V5H7l3.5-3.5L14 5h-1z" />
                            </svg>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComponent(component.id);
                            }}
                            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors shadow-md flex items-center justify-center"
                          >
                            ×
                          </button>

                          {/* Component label */}
                          <div className="absolute -bottom-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md">
                            {component.componentName}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Empty state */}
                  {artboardComponents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <p className="text-lg mb-2">Empty Artboard</p>
                        <p className="text-sm">
                          Click on a component to add it to the artboard
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Properties Panel */}
        {selectedComponent && !previewMode && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Properties</h3>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {(() => {
              const component = artboardComponents.find(
                (comp) => comp.id === selectedComponent
              );
              const definition = layoutDefinitions.find(
                (def) => def.componentName === component?.componentName
              );

              if (!component || !definition) return null;

              return (
                <div className="max-h-64 overflow-y-auto space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(definition.propsSchema).map(
                      ([propKey, schema]) => (
                        <div key={propKey} className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600">
                            {schema.label}
                          </label>

                          {schema.type === "text" && (
                            <input
                              type="text"
                              value={String(component.props[propKey] || "")}
                              onChange={(e) =>
                                updateComponentProps(
                                  component.id,
                                  propKey,
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {schema.type === "textarea" && (
                            <textarea
                              value={String(component.props[propKey] || "")}
                              onChange={(e) =>
                                updateComponentProps(
                                  component.id,
                                  propKey,
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 col-span-2"
                            />
                          )}

                          {schema.type === "select" && schema.options && (
                            <select
                              value={String(
                                component.props[propKey] || schema.default
                              )}
                              onChange={(e) =>
                                updateComponentProps(
                                  component.id,
                                  propKey,
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {schema.options.map((option: string) => (
                                <option key={option} value={option}>
                                  {option
                                    .replace(/^(bg-|text-)/, "")
                                    .replace(/-/g, " ")}
                                </option>
                              ))}
                            </select>
                          )}

                          {schema.type === "number" && (
                            <input
                              type="number"
                              min={schema.min || 0}
                              max={schema.max || 100}
                              value={Number(
                                component.props[propKey] || schema.default
                              )}
                              onChange={(e) =>
                                updateComponentProps(
                                  component.id,
                                  propKey,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}

                          {schema.type === "image" && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={String(component.props[propKey] || "")}
                                onChange={(e) =>
                                  updateComponentProps(
                                    component.id,
                                    propKey,
                                    e.target.value
                                  )
                                }
                                placeholder="Image URL"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      updateComponentProps(
                                        component.id,
                                        propKey,
                                        event.target?.result as string
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
