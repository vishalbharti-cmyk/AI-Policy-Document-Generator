import { GoogleGenAI } from "@google/genai";
import { RAG_CONTEXT_FOLDER_URL } from '../config';

// Initialize the Google AI client with the API key from environment variables.
// This is more robust and standard than using a proxy for client-side applications.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const GENERATE_SYSTEM_INSTRUCTION = `You are an expert AI Policy writer for technology companies. Your task is to draft clear, comprehensive, and actionable policies for organizations using AI. 

Ground your writing in established frameworks and principles for responsible AI, such as fairness, accountability, transparency, and security. You should reference concepts from frameworks like the NIST AI Risk Management Framework, the OECD AI Principles, and GDPR where applicable.

The user will provide a topic for a policy section, and you should generate that section in well-structured markdown format.

Take into account the existing content of the policy document to ensure the new section is contextually relevant and maintains a consistent tone and structure. Do not repeat the title of the section if the user's prompt is also the title. Begin directly with the content.

You are generating content based on the information in the public Google Drive folder: ${RAG_CONTEXT_FOLDER_URL}. The documents in this folder contain key information on AI ethics and governance. Your response should reflect the principles and guidelines found in those documents.`;

const QA_SYSTEM_INSTRUCTION = `You are a helpful Q&A assistant for a company's internal policies. Your purpose is to answer employee questions based *exclusively* on the official policy documents provided.

The official policy documents are located in the public Google Drive folder: ${RAG_CONTEXT_FOLDER_URL}.

When a user asks a question, you must:
1.  Consult the information within the documents in the provided Google Drive folder.
2.  Formulate a clear and concise answer based *only* on the content of those documents.
3.  If the answer cannot be found in the documents, you must state: "I could not find an answer to that question in the provided policy documents."
4.  Do not invent, infer, or use any external knowledge. Your knowledge is strictly limited to the provided documents.`;


/**
 * Calls the Gemini API using the @google/genai SDK.
 * @param prompt The user's prompt.
 * @param systemInstruction The system instruction to guide the model.
 * @returns The generated text from the model.
 */
async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
    try {
        console.log("Sending request to Gemini API...");
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const text = response.text;

        if (text) {
            return text;
        } else {
            console.warn("API response did not contain expected text content.", response);
            return "The AI returned an empty or invalid response. Please check the console for details.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get response from AI model: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI model.");
    }
}

export async function generatePolicySection(prompt: string, existingContent: string): Promise<string> {
  const fullPrompt = `Here is the policy document so far:
<document>
${existingContent}
</document>

Now, please write the section on: "${prompt}".
`;
  return callGemini(fullPrompt, GENERATE_SYSTEM_INSTRUCTION);
}

export async function answerQuery(question: string): Promise<string> {
    return callGemini(question, QA_SYSTEM_INSTRUCTION);
}