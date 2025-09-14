import React from "react";
import type { LayoutDefinition } from "../page";

interface LayoutSelectionModalProps {
  show: boolean;
  layoutDefinitions: LayoutDefinition[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addComponentToArtboard: (componentName: string) => void;
  onClose: () => void;
}

const LayoutSelectionModal: React.FC<LayoutSelectionModalProps> = ({
  show,
  layoutDefinitions,
  activeTab,
  setActiveTab,
  addComponentToArtboard,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-10 relative flex flex-col"
        style={{ minHeight: "60vh", minWidth: "700px" }}
      >
        {/* Modal Header with Tabs */}
        <div className="flex gap-2 border-b mb-4">
          {Array.from(new Set(layoutDefinitions.map((ld) => ld.category))).map(
            (cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${
                  activeTab === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            )
          )}
        </div>
        {/* Modal Content: Layouts by selected tab */}
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {layoutDefinitions
            .filter((ld) => !activeTab || ld.category === activeTab)
            .map((definition) => (
              <div
                key={definition.componentName}
                className="border border-gray-200 bg-white rounded-xl p-4 hover:border-blue-400 cursor-pointer transition-colors shadow-sm"
                onClick={() => {
                  addComponentToArtboard(definition.componentName);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 drop-shadow-sm">
                    {definition.displayName}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {definition.category}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {definition.description}
                </p>
              </div>
            ))}
        </div>
        {/* Close Modal Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default LayoutSelectionModal;
