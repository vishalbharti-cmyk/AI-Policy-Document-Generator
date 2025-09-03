import React from 'react';

interface PolicyEditorProps {
  documentContent: string;
  setDocumentContent: (content: string) => void;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({
  documentContent,
  setDocumentContent,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full">
      <textarea
        value={documentContent}
        onChange={(e) => setDocumentContent(e.target.value)}
        className="w-full h-[70vh] min-h-[600px] bg-transparent border-0 rounded-md p-6 text-slate-700 focus:ring-0 resize-none font-serif text-base leading-relaxed"
        placeholder="Start writing your policy document, or use the AI Assistant to generate content."
      />
    </div>
  );
};