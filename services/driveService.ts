// Fix: Add global declarations for 'gapi' and 'google' to resolve TypeScript errors
// when type definition files are not available.
declare var gapi: any;
declare var google: any;

import { GOOGLE_CLIENT_ID, UI_INFO_FOLDER_URL } from '../config';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any | null = null;
let isInitialized = false;
let onSigninStatusUpdate: (user: any) => void = () => {}; // Store the callback for global use

// Helper to extract folder ID from public URL
const getFolderIdFromUrl = (url: string): string | null => {
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
};

const FOLDER_ID = getFolderIdFromUrl(UI_INFO_FOLDER_URL);

/**
 * Initializes the GAPI client and GIS (Google Identity Services) for authentication.
 * Returns a promise that resolves when initialization is complete.
 * @param updateSigninStatus Callback function to update the UI on sign-in status change.
 */
export function initClient(updateSigninStatus: (user: any) => void): Promise<void> {
    onSigninStatusUpdate = updateSigninStatus; // Store the callback

    return new Promise((resolve, reject) => {
        try {
            // Load the GAPI client library first.
            gapi.load('client', async () => {
                try {
                    // Initialize the GAPI client with only the discovery document.
                    // *** THE CRITICAL FIX IS HERE ***
                    // Removing the `clientId` from this init call prevents GAPI from
                    // using a deprecated, conflicting authentication flow. Authentication
                    // is now handled exclusively by the secure GIS token client.
                    await gapi.client.init({
                        discoveryDocs: [DISCOVERY_DOC],
                    });

                    // Now that GAPI is ready, initialize the Google Identity Services token client.
                    tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: SCOPES,
                        callback: async (tokenResponse: any) => {
                            if (tokenResponse.error) {
                                console.error("Token request error:", tokenResponse);
                                onSigninStatusUpdate(null);
                                return;
                            }
                            
                            // The token from GIS must be passed to the GAPI client for API calls to be authenticated.
                            gapi.client.setToken(tokenResponse);

                            try {
                                // After setting the token, fetch user info to confirm login and update the UI.
                                const userInfoResponse = await gapi.client.request({
                                    path: 'https://www.googleapis.com/oauth2/v3/userinfo'
                                });
                                onSigninStatusUpdate(JSON.parse(userInfoResponse.body));
                            } catch (error) {
                                 console.error("Error fetching user info:", error);
                                 onSigninStatusUpdate(null);
                            }
                        },
                    });

                    isInitialized = true;
                    resolve(); // Initialization is complete.
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}


/**
 * Prompts the user to sign in with their Google account.
 */
export function signIn() {
    if (!isInitialized || !tokenClient) {
        throw new Error("GAPI or GIS not initialized.");
    }
    // An empty prompt is standard for a smooth sign-in flow.
    tokenClient?.requestAccessToken({ prompt: '' });
}

/**
 * Signs the user out.
 */
export function signOut() {
    if (!isInitialized) {
        console.error("GAPI or GIS not initialized.");
        return;
    }
    const token = gapi.client.getToken();
    if (token !== null) {
        // Revoke the token to invalidate it.
        google.accounts.oauth2.revoke(token.access_token, () => {
            // Clear the GAPI client's token from memory.
            gapi.client.setToken(null);
            // Update the application's state via the callback instead of reloading the page.
            onSigninStatusUpdate(null);
        });
    }
}

/**
 * Lists all `.txt` files in the designated application folder.
 */
export async function listFiles() {
    if (!isInitialized) throw new Error("GAPI client is not ready.");
    if (!FOLDER_ID) {
        throw new Error("Could not determine Google Drive folder ID from URL.");
    }
    if (!gapi.client.getToken()) {
        throw new Error("Not signed in.");
    }

    const response = await gapi.client.drive.files.list({
        q: `'${FOLDER_ID}' in parents and mimeType='text/plain' and trashed=false`,
        fields: 'files(id, name)',
    });
    return response.result.files || [];
}

const createMultipartBody = (metadata: any, fileContent: string) => {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const body =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
        fileContent +
        close_delim;
    
    return { boundary, body };
}

/**
 * Saves a new text file to the application's Google Drive folder.
 */
export async function saveFile(fileName: string, content: string) {
    if (!isInitialized) throw new Error("GAPI client is not ready.");
    if (!FOLDER_ID) throw new Error("Folder ID not configured.");
    if (!gapi.client.getToken()) throw new Error("Not signed in.");

    const metadata = {
        name: fileName.endsWith('.txt') ? fileName : `${fileName}.txt`,
        mimeType: 'text/plain',
        parents: [FOLDER_ID],
    };
    
    const { boundary, body } = createMultipartBody(metadata, content);

    const response = await gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body: body,
    });
    return response.result;
}

/**
 * Updates an existing file in Google Drive with new content.
 */
export async function updateFile(fileId: string, content: string) {
    if (!isInitialized) throw new Error("GAPI client is not ready.");
    if (!gapi.client.getToken()) throw new Error("Not signed in.");

    const { boundary, body } = createMultipartBody({}, content);
    
    const response = await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body: body,
    });
    return response.result;
}

/**
 * Retrieves the content of a specific file from Google Drive.
 */
export async function getFileContent(fileId: string): Promise<string> {
    if (!isInitialized) throw new Error("GAPI client is not ready.");
    if (!gapi.client.getToken()) throw new Error("Not signed in.");
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
    });
    return response.body;
}