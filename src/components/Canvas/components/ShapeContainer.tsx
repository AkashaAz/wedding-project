/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */
import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Group, Rect, Circle, Image, Path, Text } from "react-konva";
import type { ShapeContainer } from "@/types/Shape";

interface ShapeContainerComponentProps {
  shape: ShapeContainer;
  onShapeChange: (shape: ShapeContainer) => void;
  onSelect?: () => void;
}

const ShapeContainerComponent: React.FC<ShapeContainerComponentProps> = ({
  shape,
  onShapeChange,
  onSelect,
}) => {
  const groupRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image
  const imageObj = useMemo(() => {
    if (!shape.imageUrl) return null;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(false);
    img.src = shape.imageUrl;
    return img;
  }, [shape.imageUrl]);

  // Reset loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [shape.imageUrl]);

  // Handle file drop/upload
  const handleFileUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          onShapeChange({
            ...shape,
            imageUrl,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [shape, onShapeChange]);

  // Render shape based on type
  const renderShape = () => {
    const commonProps = {
      x: 0,
      y: 0,
      fill: shape.imageUrl ? "transparent" : shape.fill,
      stroke: shape.stroke || "#999",
      strokeWidth: shape.strokeWidth || 2,
    };

    switch (shape.type) {
      case "circle":
        return (
          <Circle
            {...commonProps}
            radius={Math.min(shape.width, shape.height) / 2}
            x={shape.width / 2}
            y={shape.height / 2}
          />
        );
      case "ellipse":
        return (
          <Circle
            {...commonProps}
            radiusX={shape.width / 2}
            radiusY={shape.height / 2}
            x={shape.width / 2}
            y={shape.height / 2}
          />
        );
      case "triangle":
        return (
          <Path
            {...commonProps}
            data={`M ${shape.width / 2} 0 L ${shape.width} ${
              shape.height
            } L 0 ${shape.height} Z`}
          />
        );
      case "rect":
      default:
        return (
          <Rect {...commonProps} width={shape.width} height={shape.height} />
        );
    }
  };

  // Render masked image
  const renderMaskedImage = () => {
    if (!shape.imageUrl || !imageObj || !imageLoaded) return null;

    return (
      <Group
        clipFunc={(ctx: any) => {
          ctx.save();
          ctx.beginPath();

          switch (shape.type) {
            case "circle":
              ctx.arc(
                shape.width / 2,
                shape.height / 2,
                Math.min(shape.width, shape.height) / 2,
                0,
                Math.PI * 2
              );
              break;
            case "ellipse":
              ctx.ellipse(
                shape.width / 2,
                shape.height / 2,
                shape.width / 2,
                shape.height / 2,
                0,
                0,
                Math.PI * 2
              );
              break;
            case "triangle":
              ctx.moveTo(shape.width / 2, 0);
              ctx.lineTo(shape.width, shape.height);
              ctx.lineTo(0, shape.height);
              ctx.closePath();
              break;
            case "rect":
            default:
              ctx.rect(0, 0, shape.width, shape.height);
              break;
          }

          ctx.clip();
          ctx.restore();
        }}
      >
        <Image
          ref={imageRef}
          image={imageObj}
          x={0}
          y={0}
          width={shape.width}
          height={shape.height}
        />
      </Group>
    );
  };

  return (
    <Group
      ref={groupRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      draggable={shape.draggable}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect?.();
      }}
      onDblClick={handleFileUpload}
      onDragEnd={(e) => {
        onShapeChange({
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        onShapeChange({
          ...shape,
          x: node.x(),
          y: node.y(),
          width: Math.max(5, shape.width * scaleX),
          height: Math.max(5, shape.height * scaleY),
        });

        // Reset scale
        node.scaleX(1);
        node.scaleY(1);
      }}
    >
      {/* Background shape - shows when no image */}
      {!shape.imageUrl && renderShape()}

      {/* Clipped image */}
      {shape.imageUrl && imageLoaded && renderMaskedImage()}

      {/* Shape border - always visible */}
      <Group>
        {(() => {
          const borderProps = {
            x: 0,
            y: 0,
            fill: "transparent",
            stroke: shape.stroke || "#999",
            strokeWidth: shape.strokeWidth || 2,
          };

          switch (shape.type) {
            case "circle":
              return (
                <Circle
                  {...borderProps}
                  radius={Math.min(shape.width, shape.height) / 2}
                  x={shape.width / 2}
                  y={shape.height / 2}
                />
              );
            case "ellipse":
              return (
                <Circle
                  {...borderProps}
                  radiusX={shape.width / 2}
                  radiusY={shape.height / 2}
                  x={shape.width / 2}
                  y={shape.height / 2}
                />
              );
            case "triangle":
              return (
                <Path
                  {...borderProps}
                  data={`M ${shape.width / 2} 0 L ${shape.width} ${
                    shape.height
                  } L 0 ${shape.height} Z`}
                />
              );
            case "rect":
            default:
              return (
                <Rect
                  {...borderProps}
                  width={shape.width}
                  height={shape.height}
                />
              );
          }
        })()}
      </Group>

      {/* Upload hint when no image */}
      {!shape.imageUrl && (
        <Group>
          <Rect
            x={shape.width / 2 - 40}
            y={shape.height / 2 - 8}
            width={80}
            height={16}
            fill="rgba(0,0,0,0.1)"
            cornerRadius={4}
          />
          <Text
            x={shape.width / 2}
            y={shape.height / 2 - 4}
            text="Double-click"
            fontSize={10}
            fontFamily="Arial"
            fill="#666"
            align="center"
            offsetX={35}
          />
        </Group>
      )}
    </Group>
  );
};

export default ShapeContainerComponent;
