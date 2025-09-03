import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface HeaderProps {
    onDownload: () => void;
    isDocumentEmpty: boolean;
    isSignedIn: boolean;
    userName: string;
    onSignIn: () => void;
    onSignOut: () => void;
    onSaveToDrive: () => void;
    isGapiReady: boolean;
}

const DocumentIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8 text-indigo-600"
  >
    <path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 01.75.75v9.75a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V4.5zM14.25 3.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" clipRule="evenodd" />
  </svg>
);

const UserMenu: React.FC<{ userName: string; onSignOut: () => void }> = ({ userName, onSignOut }) => (
    <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-slate-600">Welcome, {userName}</span>
        <button
            onClick={onSignOut}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
            Sign Out
        </button>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ 
    onDownload, 
    isDocumentEmpty,
    isSignedIn,
    userName,
    onSignIn,
    onSignOut,
    onSaveToDrive,
    isGapiReady
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <DocumentIcon />
            <h1 className="text-xl font-semibold text-slate-800">
              AI Policy Document Generator
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
                onClick={onSaveToDrive}
                disabled={!isSignedIn || isDocumentEmpty || !isGapiReady}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
                Save to Drive
            </button>

            <button
              onClick={onDownload}
              disabled={isDocumentEmpty}
              className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <DownloadIcon />
              <span className="ml-2 hidden sm:inline">Download as .txt</span>
            </button>
            
            <div className="border-l border-slate-300 h-8 mx-2"></div>

            {isSignedIn ? (
                <UserMenu userName={userName} onSignOut={onSignOut} />
            ) : (
                <button
                    onClick={onSignIn}
                    disabled={!isGapiReady}
                    className="flex items-center justify-center px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                    <GoogleIcon />
                    <span className="ml-2">{isGapiReady ? 'Sign in with Google' : 'Initializing...'}</span>
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};