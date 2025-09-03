import React, { useState, useCallback } from 'react';
import { generatePolicySection, answerQuery } from '../services/geminiService';
import { UI_INFO_FOLDER_URL } from '../config';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import { QuestionIcon } from './icons/QuestionIcon';

type Mode = 'generate' | 'qa';

interface AssistantPanelProps {
    documentContent: string;
    onInsertContent: (content: string) => void;
}

const InfoIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-indigo-500 flex-shrink-0"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  </svg>
);


export const AssistantPanel: React.FC<AssistantPanelProps> = ({ documentContent, onInsertContent }) => {
    const [mode, setMode] = useState<Mode>('generate');
    const [prompt, setPrompt] = useState('');
    const [question, setQuestion] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        try {
            const fullContent = await generatePolicySection(prompt, documentContent);
            setGeneratedContent(fullContent);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate content: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, documentContent, isLoading]);

    const handleAsk = useCallback(async () => {
        if (!question || isLoading) return;
        setIsLoading(true);
        setError(null);
        setAnswer('');
        try {
            const result = await answerQuery(question);
            setAnswer(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to get answer: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [question, isLoading]);

    return (
        <div className="space-y-6">
            <div className="flex items-start space-x-3">
                <InfoIcon />
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">AI Assistant</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Use the AI to draft new sections or ask questions about existing policies.
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Note:</strong> The AI uses documents from a public Google Drive folder as its knowledge base. To save your work, <a href={UI_INFO_FOLDER_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-600">sign in and use the Google Drive folder</a>.
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button
                        onClick={() => setMode('generate')}
                        className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                            mode === 'generate'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <GenerateIcon />
                        <span className="ml-2">Generate Content</span>
                    </button>
                    <button
                        onClick={() => setMode('qa')}
                        className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                            mode === 'qa'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <QuestionIcon />
                        <span className="ml-2">Ask a Question</span>
                    </button>
                </nav>
            </div>
            
            {/* Conditional Content */}
            {mode === 'generate' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
                            Your Request
                        </label>
                        <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'Draft a section on data security requirements for remote employees.'" className="w-full h-28 bg-white border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none" disabled={isLoading} />
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200">
                        {isLoading ? <SpinnerIcon /> : 'Generate'}
                    </button>
                    <div>
                        <label htmlFor="generated-content" className="block text-sm font-medium text-slate-700 mb-1">
                            AI Generated Content
                        </label>
                        <div className="relative">
                            <textarea id="generated-content" value={generatedContent} readOnly placeholder="AI response will appear here." className="w-full h-48 bg-slate-100 border border-slate-300 rounded-md p-3 text-slate-600 focus:ring-0 focus:border-slate-300 resize-none" />
                            {generatedContent && !isLoading && (
                                <button onClick={() => onInsertContent(generatedContent)} className="absolute bottom-3 right-3 px-3 py-1 text-xs font-semibold bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors">
                                    Insert into document
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {mode === 'qa' && (
                <div className="space-y-4 animate-fade-in">
                     <div>
                        <label htmlFor="question" className="block text-sm font-medium text-slate-700 mb-1">
                            Your Question
                        </label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., 'What is our policy on personal AI use?'" className="w-full h-28 bg-white border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none" disabled={isLoading} />
                    </div>
                    <button onClick={handleAsk} disabled={isLoading || !question} className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200">
                        {isLoading ? <SpinnerIcon /> : 'Ask'}
                    </button>
                    <div>
                        <label htmlFor="answer" className="block text-sm font-medium text-slate-700 mb-1">
                            Answer
                        </label>
                        <div className="relative">
                            <textarea id="answer" value={answer} readOnly placeholder="AI answer will appear here." className="w-full h-48 bg-slate-100 border border-slate-300 rounded-md p-3 text-slate-600 focus:ring-0 focus:border-slate-300 resize-none" />
                        </div>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}

        </div>
    );
};
