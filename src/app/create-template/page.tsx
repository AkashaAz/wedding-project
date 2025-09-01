"use client";

import React from "react";
import CreateTemplateEditor from "@/components/CreateTemplateEditor";

export default function CreateTemplatePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Create Template - DOM Artboard Editor
        </h1>
        <CreateTemplateEditor />
      </div>
    </div>
  );
}
