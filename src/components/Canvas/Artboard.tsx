"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ImageObject, TextObject, ArtboardSize } from "@/types/Shape";

interface ArtboardProps {
  images: ImageObject[];
  texts: TextObject[];
  artboardSize: ArtboardSize;
  onImageChange?: (images: ImageObject[]) => void;
  onTextChange?: (texts: TextObject[]) => void;
  onImageSelect?: (image: ImageObject | null) => void;
  onTextSelect?: (text: TextObject | null) => void;
  showTextPanel?: boolean;
  onShowTextPanel?: (show: boolean) => void;
  showJsonModal?: boolean;
  onShowJsonModal?: (show: boolean) => void;
  showPreviewModal?: boolean;
  onShowPreviewModal?: (show: boolean) => void;
  triggerFileUpload?: boolean;
  triggerAddText?: boolean;
}

// Create a dynamically imported component that handles Konva
const DynamicKonvaCanvas = dynamic(
  () =>
    import("@/components/Canvas/KonvaCanvas").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-4">
          <div className="w-full h-full bg-white shadow-lg rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-gray-500">Loading Canvas...</div>
          </div>
        </div>
      </div>
    ),
  }
) as React.ComponentType<ArtboardProps>;

const Artboard: React.FC<ArtboardProps> = (props) => {
  return <DynamicKonvaCanvas {...props} />;
};

export default Artboard;
