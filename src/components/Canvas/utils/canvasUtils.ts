import type { ImageObject, TextObject } from "@/types/Shape";

interface Section {
  id: string;
  y: number;
  height: number;
  remark?: string;
  backgroundImage?: string;
}

export const layerManagerUtils = {
  moveElementForward: (
    elementId: string,
    elementType: "image" | "text",
    images: ImageObject[],
    texts: TextObject[],
    onImageChange?: (images: ImageObject[]) => void,
    onTextChange?: (texts: TextObject[]) => void
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
  },

  moveElementBackward: (
    elementId: string,
    elementType: "image" | "text",
    images: ImageObject[],
    texts: TextObject[],
    onImageChange?: (images: ImageObject[]) => void,
    onTextChange?: (texts: TextObject[]) => void
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
  },

  moveElementToFront: (
    elementId: string,
    elementType: "image" | "text",
    images: ImageObject[],
    texts: TextObject[],
    onImageChange?: (images: ImageObject[]) => void,
    onTextChange?: (texts: TextObject[]) => void
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
  },

  moveElementToBack: (
    elementId: string,
    elementType: "image" | "text",
    images: ImageObject[],
    texts: TextObject[],
    onImageChange?: (images: ImageObject[]) => void,
    onTextChange?: (texts: TextObject[]) => void
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
  },
};

export const guidelineUtils = {
  calculateGuidelines: (
    draggedImage: ImageObject,
    otherImages: ImageObject[],
    artboardSize: { width: number; height: number },
    totalArtboardHeight: number
  ) => {
    const snapTolerance = 5;
    const guidelines: Array<{
      type: "vertical" | "horizontal";
      position: number;
      show: boolean;
    }> = [];

    const draggedBounds = guidelineUtils.getImageBounds(draggedImage);

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
      const bounds = guidelineUtils.getImageBounds(image);

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
  },

  getImageBounds: (image: ImageObject) => {
    return {
      left: image.x,
      right: image.x + image.width,
      top: image.y,
      bottom: image.y + image.height,
      centerX: image.x + image.width / 2,
      centerY: image.y + image.height / 2,
    };
  },
};

export const jsonUtils = {
  generateArtboardJson: (
    artboardSize: { width: number; height: number },
    totalArtboardHeight: number,
    sections: Section[],
    images: ImageObject[],
    texts: TextObject[]
  ) => {
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
  },
};
