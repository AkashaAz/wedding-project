import { useState } from "react";

export const useCanvasTransform = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return {
    scale,
    position,
    isPanning,
    lastPanPoint,
    setScale,
    setPosition,
    setIsPanning,
    setLastPanPoint,
    handleResetView,
  };
};
