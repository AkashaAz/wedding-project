import { useState, useEffect } from "react";

export const useCanvasSize = () => {
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

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

  return stageSize;
};
