import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PolicyEditor } from './components/PolicyEditor';
import { AssistantPanel } from './components/AssistantPanel';
import * as driveService from './services/driveService';
import { SaveToDriveModal, DriveFile } from './components/SaveToDriveModal';

// Add type declarations for Google API objects on the window
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const App: React.FC = () => {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Google Drive State
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isGapiReady, setIsGapiReady] = useState(false);


  useEffect(() => {
    // Unregister any active service workers. This is crucial for ensuring that API
    // requests from the @google/genai SDK go directly to Google's servers and are
    // not intercepted by a potentially misconfigured or outdated service worker
    // from a previous proxy setup, which is the likely cause of the "502 Bad Gateway"
    // error.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log('Service Worker unregistered successfully.');
          }
        })
        .catch((error) => {
          console.error(`Service Worker unregistration failed: ${error}`);
        });
    }

    const initializeGoogleApis = async () => {
        try {
            await driveService.initClient((user) => {
                if (user) {
                    setIsSignedIn(true);
                    setUserName(user.given_name);
                } else {
                    setIsSignedIn(false);
                    setUserName('');
                }
            });
            setIsGapiReady(true);
        } catch (error) {
            console.error("Failed to initialize Google services:", error);
            setError("Could not initialize Google Drive integration. Please refresh the page.");
        }
    };
    
    const checkScriptsReady = () => {
        if (window.gapi && window.google) {
            initializeGoogleApis();
        } else {
            setTimeout(checkScriptsReady, 100);
        }
    };
    
    checkScriptsReady();
  }, []);

  const handleSignIn = () => {
    if (!isGapiReady) {
        console.warn("Attempted to sign in before GAPI was ready.");
        return;
    }
    driveService.signIn();
  };

  const handleSignOut = () => {
    driveService.signOut();
  };

  const handleInsert = (contentToInsert: string) => {
    if (!contentToInsert) return;
    setDocumentContent(prev => {
        const separator = prev.endsWith('\n') || prev.length === 0 ? '' : '\n\n';
        return prev + separator + contentToInsert;
    });
  };

  const handleDownload = () => {
    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-policy.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleOpenSaveModal = async () => {
    setIsSaveModalOpen(true);
    setIsLoadingDrive(true);
    setError(null);
    try {
        const files = await driveService.listFiles();
        setDriveFiles(files);
    } catch(err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to list Google Drive files: ${errorMessage}`);
    } finally {
        setIsLoadingDrive(false);
    }
  }

  const handleLoadFile = async (fileId: string) => {
    setIsLoadingDrive(true);
    setError(null);
    try {
        const content = await driveService.getFileContent(fileId);
        setDocumentContent(content);
        setIsSaveModalOpen(false);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to load file content: ${errorMessage}`);
    } finally {
        setIsLoadingDrive(false);
    }
};


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header
        onDownload={handleDownload}
        isDocumentEmpty={!documentContent}
        isSignedIn={isSignedIn}
        userName={userName}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onSaveToDrive={handleOpenSaveModal}
        isGapiReady={isGapiReady}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3">
            <PolicyEditor
              documentContent={documentContent}
              setDocumentContent={setDocumentContent}
            />
          </div>

          <aside className="lg:col-span-2">
             <AssistantPanel 
                documentContent={documentContent}
                onInsertContent={handleInsert}
             />
          </aside>
        </div>
      </main>

      {isSaveModalOpen && (
        <SaveToDriveModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            files={driveFiles}
            documentContent={documentContent}
            onSaveComplete={() => setIsSaveModalOpen(false)}
            onLoadFile={handleLoadFile}
            isLoading={isLoadingDrive}
            error={error}
            setError={setError}
        />
      )}
    </div>
  );
};

export default App;