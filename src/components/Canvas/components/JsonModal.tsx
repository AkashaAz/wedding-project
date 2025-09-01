import React from "react";

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: object;
}

const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose, jsonData }) => {
  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    alert("JSON copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-5xl max-h-[90vh] w-full mx-6 overflow-hidden shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3 text-3xl">📄</span>
            Artboard Configuration
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-auto max-h-[70vh] bg-gray-50 rounded-xl p-4 border">
          <pre className="text-sm text-gray-800 font-mono leading-relaxed">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center"
            onClick={handleCopyJson}
          >
            <span className="mr-2">📋</span>
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonModal;
