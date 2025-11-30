import React from "react";

export default function FilePreviewModal({ open, onClose, file }) {
  if (!open || !file) return null;

  const isPDF = file.mime?.includes("pdf");
  const isImage = file.mime?.includes("image");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-100">
          <h2 className="font-bold text-lg">{file.name}</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Tutup
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {isPDF ? (
            <iframe
              src={file.url}
              title="Preview PDF"
              className="w-full h-[75vh] rounded-lg border"
            />
          ) : isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-full max-h-[75vh] object-contain mx-auto"
            />
          ) : (
            <div className="text-center text-gray-700">
              <p>Format file tidak dapat dipreview.</p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download File
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
