"use client";

import React from "react";

interface ShapeRendererProps {
  shapeType:
    | "rect"
    | "circle"
    | "ellipse"
    | "triangle"
    | "pentagon"
    | "hexagon"
    | "star";
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundImage?: string;
  onDoubleClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shapeType,
  width,
  height,
  backgroundColor,
  borderRadius = 0,
  strokeColor,
  strokeWidth = 0,
  backgroundImage,
  onDoubleClick,
  onMouseDown,
  className = "",
}) => {
  const getShapeClipPath = () => {
    switch (shapeType) {
      case "circle":
        return "circle(50%)";
      case "ellipse":
        return "ellipse(50% 50%)";
      case "triangle":
        return "polygon(50% 0%, 0% 100%, 100% 100%)";
      case "pentagon":
        return "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)";
      case "hexagon":
        return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
      case "star":
        return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
      case "rect":
      default:
        return "none";
    }
  };

  const shapeStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    borderRadius: shapeType === "rect" ? `${borderRadius}px` : 0,
    clipPath: getShapeClipPath(),
    border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : "none",
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    cursor: "move",
    overflow: "hidden",
  };

  return (
    <div
      className={`${className}`}
      style={shapeStyle}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    />
  );
};

export default ShapeRenderer;
