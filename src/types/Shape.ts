export interface ImageObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  draggable: boolean;
  zIndex: number; // สำหรับจัดการ layer
  name?: string; // ชื่อของรูป
}

export interface TextObject {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle?: string; // normal, bold, italic, bold italic
  fill: string;
  draggable: boolean;
  zIndex: number; // สำหรับจัดการ layer
  width?: number;
  height?: number;
}

// เก็บไว้สำหรับ backward compatibility
export interface Shape {
  id: string;
  type: "rect" | "circle" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  text?: string;
  fontSize?: number;
  draggable: boolean;
  imageUrl?: string;
}

export interface ArtboardSize {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: string;
}

export const ARTBOARD_SIZES: ArtboardSize[] = [
  {
    id: "mobile",
    name: "Mobile",
    width: 375,
    height: 667,
    icon: "📱",
  },
  {
    id: "tablet",
    name: "Tablet",
    width: 768,
    height: 1024,
    icon: "📱",
  },
  {
    id: "desktop",
    name: "Desktop",
    width: 1200,
    height: 800,
    icon: "💻",
  },
];
