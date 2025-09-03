import React, { useState } from 'react';
import * as driveService from '../services/driveService';
import { SpinnerIcon } from './icons/SpinnerIcon';

export interface DriveFile {
  id: string;
  name: string;
}

interface SaveToDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
  documentContent: string;
  onSaveComplete: () => void;
  onLoadFile: (fileId: string) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export const SaveToDriveModal: React.FC<SaveToDriveModalProps> = ({
  isOpen,
  onClose,
  files,
  documentContent,
  onSaveComplete,
  onLoadFile,
  isLoading,
  error,
  setError
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [updatingFileId, setUpdatingFileId] = useState<string | null>(null);

  const handleSaveNew = async () => {
    if (!newFileName.trim()) {
        setError("Please enter a file name.");
        return;
    }
    setIsSaving(true);
    setError(null);
    try {
        await driveService.saveFile(newFileName, documentContent);
        onSaveComplete();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to save new file: ${errorMessage}`);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleUpdate = async (fileId: string) => {
    setUpdatingFileId(fileId);
    setError(null);
    try {
        await driveService.updateFile(fileId, documentContent);
        onSaveComplete();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to update file: ${errorMessage}`);
    } finally {
        setUpdatingFileId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Save to Google Drive</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>

        {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
                <strong>Error:</strong> {error}
            </div>
        )}

        <div className="border-t border-b border-slate-200 py-4 mb-4 flex-grow overflow-y-auto">
            <h3 className="text-md font-semibold text-slate-700 mb-2">Update an existing file</h3>
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <SpinnerIcon /> <span className="ml-2 text-slate-500">Loading files...</span>
                </div>
            ) : files.length === 0 ? (
                <p className="text-sm text-slate-500">No existing .txt files found in the folder.</p>
            ) : (
                <ul className="space-y-2">
                    {files.map(file => (
                        <li key={file.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-slate-50">
                            <span className="text-slate-800 truncate pr-2">{file.name}</span>
                            <div className="flex space-x-2 flex-shrink-0">
                                <button
                                    onClick={() => onLoadFile(file.id)}
                                    className="px-2 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                                >
                                    Load
                                </button>
                                <button
                                    onClick={() => handleUpdate(file.id)}
                                    disabled={updatingFileId === file.id}
                                    className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                                >
                                    {updatingFileId === file.id ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div>
            <h3 className="text-md font-semibold text-slate-700 mb-2">Or, save as a new file</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter new file name..."
                    className="flex-grow w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    onClick={handleSaveNew}
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isSaving ? 'Saving...' : 'Save New'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
