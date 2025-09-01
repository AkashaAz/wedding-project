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
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
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
  borderTopLeftRadius,
  borderTopRightRadius,
  borderBottomLeftRadius,
  borderBottomRightRadius,
  strokeColor,
  strokeWidth = 0,
  strokeStyle = "solid",
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

  const getBorderRadius = () => {
    if (shapeType !== "rect") return "0";

    // If individual border radius values are provided, use them
    if (
      borderTopLeftRadius !== undefined ||
      borderTopRightRadius !== undefined ||
      borderBottomLeftRadius !== undefined ||
      borderBottomRightRadius !== undefined
    ) {
      const tl = borderTopLeftRadius ?? borderRadius;
      const tr = borderTopRightRadius ?? borderRadius;
      const bl = borderBottomLeftRadius ?? borderRadius;
      const br = borderBottomRightRadius ?? borderRadius;
      return `${tl}px ${tr}px ${br}px ${bl}px`;
    }

    return `${borderRadius}px`;
  };

  const getStrokeBorder = () => {
    if (strokeWidth <= 0) return "none";
    return `${strokeWidth}px ${strokeStyle} ${strokeColor}`;
  };

  const shapeStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    borderRadius: getBorderRadius(),
    clipPath: getShapeClipPath(),
    border: getStrokeBorder(),
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
