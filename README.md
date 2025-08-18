# Figma-Style Card Design Tool

A modern card design tool built with Next.js, TypeScript, Tailwind CSS, and Konva.js, featuring a Figma-like interface for creating custom card designs.

## Features

- **Figma-like Interface**: Clean, professional design interface with familiar layout
- **Interactive Artboard**: Canvas-based artboard powered by Konva.js for smooth rendering
- **Drag & Drop Shapes**: Add and manipulate rectangles, circles, and text elements
- **Real-time Properties Panel**: Live editing of shape properties, positioning, and styling
- **Layer Management**: Organized layer hierarchy for complex designs
- **Responsive Layout**: Adapts to different screen sizes

## Architecture

### Components Structure

```
src/components/
├── DesignStudio.tsx          # Main layout component
├── Layout/
│   ├── TopToolbar.tsx        # Top navigation and tools
│   └── SidePanel.tsx         # Properties and layers panel
└── Canvas/
    └── Artboard.tsx          # Interactive canvas with Konva.js
```

### Key Features Implemented

1. **Top Toolbar**: Contains design tools, export options, and brand identity
2. **Side Panel**: Properties editor with layers management, design controls, and positioning
3. **Artboard**: Interactive canvas with:
   - Grid system for precise alignment
   - Drag and drop functionality
   - Shape selection and manipulation
   - Visual feedback for selected elements

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Konva.js** - 2D canvas library for interactive graphics
- **React Konva** - React bindings for Konva.js

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Adding Shapes**: Use the toolbar buttons to add rectangles, circles, or text
2. **Selecting Shapes**: Click on any shape to select it
3. **Moving Shapes**: Drag selected shapes around the artboard
4. **Editing Properties**: Use the side panel to modify colors, positions, and dimensions
5. **Layer Management**: View and organize your design elements in the layers panel

## Extending the Tool

The codebase is designed to be easily extensible:

- **Add New Shape Types**: Extend the `Shape` interface and add rendering logic in `Artboard.tsx`
- **Custom Tools**: Add new tools to the `TopToolbar.tsx` component
- **Advanced Properties**: Expand the `SidePanel.tsx` with additional editing capabilities
- **Export Functionality**: Implement export features using Konva's export capabilities

## Architecture Notes

- **Separation of Concerns**: Layout, canvas, and business logic are cleanly separated
- **Type Safety**: Full TypeScript coverage for shape definitions and component props
- **Event Handling**: Proper event management for canvas interactions
- **State Management**: React state for shape management and selection tracking
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS

This project serves as a foundation for building more advanced design tools and can be extended with features like:

- Multiple artboards
- Advanced text editing
- Image import and manipulation
- Vector path tools
- Collaboration features
- Template system
