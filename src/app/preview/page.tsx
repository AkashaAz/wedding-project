"use client";

import React, { useState, useEffect, useRef } from "react";
import LayoutSelectionModal from "./review/LayoutSelectionModal";
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

export interface LayoutDefinition {
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
  // Store refs for each component to measure real height
  const componentRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
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

  // Function to recalculate positions based on real DOM heights
  const recalculatePositions = React.useCallback(() => {
    // Get current values directly to avoid recreating this function on every state change
    const getCurrentComponents = () => artboardComponents;
    const getCurrentZoom = () => zoom;

    const currentComponents = getCurrentComponents();
    const currentZoom = getCurrentZoom();

    if (currentComponents.length <= 1) return; // No need to recalculate for 0 or 1 component

    // Wait for DOM to update then recalculate
    setTimeout(() => {
      let currentY = 0;
      const updatedComponents = [...currentComponents];

      // Sort by current Y position to maintain order
      updatedComponents.sort((a, b) => a.y - b.y);

      updatedComponents.forEach((comp, index) => {
        if (index === 0) {
          // First component stays at top
          comp.y = 0;
          const domElement = componentRefs.current[comp.id];
          if (domElement) {
            currentY = domElement.offsetHeight / (currentZoom / 100); // No gap
          } else {
            currentY = 300; // Fallback
          }
        } else {
          // Position subsequent components below previous ones
          comp.y = currentY;
          const domElement = componentRefs.current[comp.id];
          if (domElement) {
            currentY += domElement.offsetHeight / (currentZoom / 100); // No gap
          } else {
            currentY += 300; // Fallback
          }
        }
      });

      setArtboardComponents(updatedComponents);
    }, 100); // Small delay to ensure DOM is updated
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced version for performance
  const debouncedRecalculatePositions = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        recalculatePositions();
      }, 200);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate positions when zoom changes (but not for prop changes)
  useEffect(() => {
    // Use current values from refs to avoid unnecessary re-runs
    if (artboardComponents.length > 1) {
      // Call recalculate directly to avoid debounce function dependency
      setTimeout(() => {
        let currentY = 0;
        const updatedComponents = [...artboardComponents];
        updatedComponents.sort((a, b) => a.y - b.y);

        let hasChanges = false;
        updatedComponents.forEach((comp) => {
          const element = componentRefs.current[comp.id];
          if (element) {
            const height = element.offsetHeight;
            if (comp.y !== currentY) {
              hasChanges = true;
              comp.y = currentY;
            }
            currentY += height;
          }
        });

        if (hasChanges) {
          setArtboardComponents([...updatedComponents]);
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]); // Only depend on zoom // Handle adding component to artboard

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

    // Always fit to artboard width, stack vertically (find bottom-most y)
    const getSmartPosition = () => {
      if (artboardComponents.length === 0) {
        return { x: 0, y: 0 };
      }
      // Find the bottom-most y + height of all components using real DOM heights
      let maxBottom = 0;
      for (const comp of artboardComponents) {
        let compHeight = 0;
        const domElement = componentRefs.current[comp.id];

        if (domElement) {
          // Use actual DOM height if available
          compHeight = domElement.offsetHeight / (zoom / 100); // Adjust for zoom
        } else {
          // Fallback to estimated height if DOM element not yet available
          if (comp.height === "auto") {
            compHeight = 300; // fallback estimate for auto
          } else if (
            typeof comp.height === "string" &&
            comp.height.includes("%")
          ) {
            compHeight = (parseInt(comp.height) / 100) * artboardSize.height;
          } else {
            compHeight = parseInt(comp.height as string) || 300;
          }
        }
        maxBottom = Math.max(maxBottom, comp.y + compHeight);
      }
      return { x: 0, y: maxBottom };
    };

    const position = getSmartPosition();

    const newComponent: LayoutComponent = {
      id: `${componentName}_${Date.now()}`,
      componentName,
      x: 0,
      y: position.y,
      width: "100%",
      height:
        definition.defaultLayout.height === "auto"
          ? "auto"
          : definition.defaultLayout.height,
      props: defaultProps,
      zIndex: nextZIndex,
    };

    setArtboardComponents((prev) => [...prev, newComponent]);
    setNextZIndex((prev) => prev + 1);
    setSelectedComponent(newComponent.id);

    // Use debounced recalculation for better performance
    debouncedRecalculatePositions();
  };

  // Handle component selection and drag start
  const handleComponentMouseDown = React.useCallback(
    (componentId: string, e: React.MouseEvent) => {
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
    },
    [artboardComponents]
  );

  // Handle mouse move for dragging
  // Only allow vertical drag to reorder layouts
  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current.componentId) return;

      // Only vertical drag
      const deltaY = e.clientY - dragRef.current.startY;
      const distance = Math.abs(deltaY);

      // Only start dragging if mouse moved enough
      if (!dragRef.current.isDragging && distance > 5) {
        dragRef.current.isDragging = true;
        setIsDragging(true);
      }
      if (!dragRef.current.isDragging) return;

      const scaledDeltaY = deltaY / (zoom / 100);
      const component = artboardComponents.find(
        (comp) => comp.id === dragRef.current.componentId
      );
      if (!component) return;

      // Find current index
      const currentIndex = artboardComponents.findIndex(
        (comp) => comp.id === dragRef.current.componentId
      );
      if (currentIndex === -1) return;

      // Calculate new index based on mouse position
      let newIndex = currentIndex;
      const compHeight =
        component.height === "auto"
          ? 200
          : component.height.includes("%")
          ? (parseInt(component.height) / 100) * artboardSize.height
          : parseInt(component.height) || 200;
      const newY =
        dragRef.current.startComponentY + scaledDeltaY + compHeight / 2;
      for (let i = 0; i < artboardComponents.length; i++) {
        if (i === currentIndex) continue;
        const c = artboardComponents[i];
        const cHeight =
          c.height === "auto"
            ? 200
            : c.height.includes("%")
            ? (parseInt(c.height) / 100) * artboardSize.height
            : parseInt(c.height) || 200;
        if (newY < c.y + cHeight / 2) {
          newIndex = i;
          break;
        }
      }
      if (newIndex !== currentIndex) {
        // Reorder
        const newArr = [...artboardComponents];
        const [moved] = newArr.splice(currentIndex, 1);
        newArr.splice(newIndex, 0, moved);
        // Recalculate y for all
        let y = 0;
        for (let i = 0; i < newArr.length; i++) {
          newArr[i] = { ...newArr[i], x: 0, y };
          const h =
            newArr[i].height === "auto"
              ? 300
              : newArr[i].height.includes("%")
              ? (parseInt(newArr[i].height) / 100) * artboardSize.height
              : parseInt(newArr[i].height) || 300;
          y += h; // No gap
        }
        setArtboardComponents(newArr);
      }
    },
    [zoom, artboardComponents, artboardSize]
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
  const handleComponentClick = React.useCallback(
    (componentId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      // Only handle click if we're not in the middle of dragging
      if (!dragRef.current.isDragging) {
        setSelectedComponent(componentId);
      }
    },
    []
  );

  // Handle artboard click (deselect)
  const handleArtboardClick = React.useCallback(() => {
    setSelectedComponent(null);
  }, []);

  // Update component props with optimized re-rendering and loading state
  const updateComponentProps = React.useCallback(
    (componentId: string, propKey: string, value: unknown) => {
      // Simple single state update - no loading states
      setArtboardComponents((prev) => {
        const updated = prev.map((comp) =>
          comp.id === componentId
            ? { ...comp, props: { ...comp.props, [propKey]: value } }
            : comp
        );
        return updated;
      });
    },
    []
  );

  // Delete component
  const deleteComponent = (componentId: string) => {
    setArtboardComponents((prev) =>
      prev.filter((comp) => comp.id !== componentId)
    );
    setSelectedComponent(null);

    // Recalculate positions after deletion to close gaps
    setTimeout(() => {
      debouncedRecalculatePositions();
    }, 50); // Small delay to ensure state is updated
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

  // Memoized component wrapper to prevent cross-component re-renders
  const LayoutComponentWrapper = React.memo(
    ({
      component,
      isSelected,
      isDragging,
      dragComponentId,
      zoom,
      artboardSize,
      onComponentClick,
      onComponentMouseDown,
    }: {
      component: LayoutComponent;
      isSelected: boolean;
      isDragging: boolean;
      dragComponentId: string | null;
      zoom: number;
      artboardSize: { width: number; height: number };
      onComponentClick: (id: string, e: React.MouseEvent) => void;
      onComponentMouseDown: (id: string, e: React.MouseEvent) => void;
    }) => {
      const ComponentType =
        COMPONENT_MAP[component.componentName as keyof typeof COMPONENT_MAP];
      if (!ComponentType) return null;

      return (
        <div
          ref={(el) => {
            componentRefs.current[component.id] = el;
          }}
          onClick={(e) => onComponentClick(component.id, e)}
          onMouseDown={(e) => onComponentMouseDown(component.id, e)}
          className={`absolute transition-all select-none ${
            isSelected
              ? "ring-2 ring-blue-500 ring-opacity-50"
              : "hover:ring-1 hover:ring-gray-300"
          } ${
            isDragging && dragComponentId === component.id
              ? "cursor-grabbing shadow-lg scale-105 ring-4 ring-blue-400 ring-opacity-30"
              : isSelected
              ? "cursor-move"
              : "cursor-pointer"
          }`}
          style={{
            left: 0,
            top: `${component.y * (zoom / 100)}px`,
            width: "100%",
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
          {/* Component content */}
          <div className="w-full h-full" style={{ userSelect: "none" }}>
            <ComponentType {...component.props} />
          </div>

          {/* Selection indicators */}
          {isSelected && (
            <div className="absolute -bottom-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md">
              {component.componentName}
            </div>
          )}
        </div>
      );
    },
    (prevProps, nextProps) => {
      console.log(`🚨 MEMO COMPARISON CALLED for ${nextProps.component.id}`);

      // Compare only data props that actually matter, skip function props
      const prevComponentProps = prevProps.component.props;
      const nextComponentProps = nextProps.component.props;

      // Compare individual prop values instead of JSON.stringify (which fails on functions)
      const propsChanged =
        Object.keys(nextComponentProps).some((key) => {
          // Skip function props in comparison
          if (typeof nextComponentProps[key] === "function") return false;
          return prevComponentProps[key] !== nextComponentProps[key];
        }) ||
        Object.keys(prevComponentProps).some((key) => {
          // Check if prev props has keys that next props doesn't have
          if (typeof prevComponentProps[key] === "function") return false;
          return !(key in nextComponentProps);
        });

      const positionChanged = prevProps.component.y !== nextProps.component.y;
      const selectionChanged = prevProps.isSelected !== nextProps.isSelected;
      const dragChanged =
        prevProps.isDragging !== nextProps.isDragging ||
        prevProps.dragComponentId !== nextProps.dragComponentId;
      const zoomChanged = prevProps.zoom !== nextProps.zoom;

      const shouldUpdate =
        propsChanged ||
        positionChanged ||
        selectionChanged ||
        dragChanged ||
        zoomChanged;

      console.log(
        `🔍 MEMO COMPARISON - ${nextProps.component.componentName} (${nextProps.component.id}):`,
        {
          propsChanged,
          positionChanged,
          selectionChanged,
          dragChanged,
          zoomChanged,
          shouldUpdate,
        }
      );

      if (propsChanged) {
        console.log(`📊 PROPS DIFF - ${nextProps.component.id}:`, {
          prev: prevComponentProps,
          next: nextComponentProps,
        });
      }

      return !shouldUpdate;
    }
  );

  LayoutComponentWrapper.displayName = "LayoutComponentWrapper";

  // Render component based on type (simplified for now to fix issues)
  const renderComponent = React.useCallback((component: LayoutComponent) => {
    const ComponentType =
      COMPONENT_MAP[component.componentName as keyof typeof COMPONENT_MAP];
    if (!ComponentType) return null;

    return <ComponentType {...component.props} />;
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9ecf3] to-[#dbe6f6]">
      {/* Layout Selection Modal (always overlay, outside main layout) */}
      <LayoutSelectionModal
        show={showLayoutModal}
        layoutDefinitions={layoutDefinitions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        addComponentToArtboard={addComponentToArtboard}
        onClose={() => setShowLayoutModal(false)}
      />

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
            <div className="overflow-auto p-4 min-h-[500px] max-h-[70vh]">
              {previewMode ? (
                /* Preview Mode - Natural Flow Layout */
                <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden min-h-[400px]">
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
                  className="relative mx-auto w-full"
                  style={{
                    minHeight: "400px",
                  }}
                >
                  {artboardComponents.map((component) => {
                    // Use stable key to prevent unnecessary unmounting
                    const stableKey = `${component.componentName}-${component.id}`;

                    return (
                      <LayoutComponentWrapper
                        key={stableKey}
                        component={component}
                        isSelected={selectedComponent === component.id}
                        isDragging={isDragging}
                        dragComponentId={dragRef.current.componentId}
                        zoom={zoom}
                        artboardSize={artboardSize}
                        onComponentClick={handleComponentClick}
                        onComponentMouseDown={handleComponentMouseDown}
                      />
                    );
                  })}
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
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10"
            onClick={() => setSelectedComponent(null)}
          >
            <div
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4"
              style={{ boxShadow: "0 8px 32px 0 rgba(31,38,135,0.12)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Properties</h3>
                <div className="flex gap-2">
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
                  <button
                    onClick={() => deleteComponent(selectedComponent!)}
                    className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm font-semibold"
                  >
                    Delete Layout
                  </button>
                </div>
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
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black bg-white/90"
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
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 col-span-2 text-black bg-white/90"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white/90"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white/90"
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white/90"
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    console.log(
                                      `📁 FILE INPUT CHANGE - Component: ${component.id}, File:`,
                                      file?.name
                                    );

                                    if (file) {
                                      console.log(
                                        `🔄 READING FILE - Size: ${file.size}, Type: ${file.type}`
                                      );
                                      const tempReader = new FileReader();

                                      tempReader.onload = (event) => {
                                        const result = event.target
                                          ?.result as string;
                                        console.log(
                                          `📖 FILE READ COMPLETE - Result length: ${result?.length}, Component: ${component.id}`
                                        );

                                        if (result) {
                                          console.log(
                                            `⏰ SETTING TIMEOUT for ${component.id}.${propKey}`
                                          );
                                          // Use a timeout to ensure the DOM is stable
                                          setTimeout(() => {
                                            console.log(
                                              `🎯 CALLING updateComponentProps for ${component.id}.${propKey}`
                                            );
                                            updateComponentProps(
                                              component.id,
                                              propKey,
                                              result
                                            );
                                          }, 50);
                                        }
                                      };

                                      tempReader.onerror = () => {
                                        console.error(
                                          `❌ FILE READ ERROR for ${component.id}`
                                        );
                                      };

                                      tempReader.readAsDataURL(file);
                                    }
                                    // Clear file input to allow re-uploading same file
                                    e.target.value = "";
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
          </div>
        )}
      </div>
    </div>
  );
}
