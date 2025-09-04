// This folder contains the documents the AI will use as its knowledge base.
export const RAG_CONTEXT_FOLDER_URL = "https://drive.google.com/drive/folders/18UgCuq25RHpsYtrCuEKbuapGnECMtWll?usp=drive_link";

// This folder is referenced in the UI for the user, e.g., for templates or examples.
export const UI_INFO_FOLDER_URL = "https://drive.google.com/drive/folders/1lPNdPKvSzlbIY6Uv0fio9PexPDhz-SO-?usp=drive_link";

// ====================================================================================
// IMPORTANT: How to create your Google Cloud Client ID for OAuth
// ====================================================================================
// 1. Go to the Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select an existing one. Make sure the Google Drive API
//    is enabled for your project (APIs & Services > Library > Google Drive API).
// 3. In the sidebar, navigate to "APIs & Services" > "Credentials".
// 4. Click "+ CREATE CREDENTIALS" at the top and select "OAuth client ID".
// 5. If you haven't configured your OAuth consent screen, you'll be prompted to do so.
//    - Select "External" for the User Type and click "Create".
//    - Fill in the required app information (App name, User support email, etc.).
//    - On the "Scopes" page, click "Add or Remove Scopes" and find the Google Drive API
//      scope `../auth/drive.file`. Check it and click "Update".
//    - On the "Test users" page, add the email addresses of the Google accounts you'll
//      use for testing.
//    - Save and continue back to the Credentials screen.
// 6. Click "+ CREATE CREDENTIALS" > "OAuth client ID" again.
//    - Set "Application type" to "Web application".
//    - Give it a name (e.g., "AI Policy App Dev").
//    - Under "Authorized JavaScript origins", add your development URL (e.g., http://localhost:8080 or your specific dev port).
//    - Under "Authorized redirect URIs", add the same URL. This is where Google will
//      redirect the user after they authorize the application.
// 7. Click "CREATE".
// 8. A pop-up will show your "Client ID". Copy it and paste it below, replacing 'YOUR_CLIENT_ID_HERE'.
// ====================================================================================
export const GOOGLE_CLIENT_ID = 'CLIENT_ID';
