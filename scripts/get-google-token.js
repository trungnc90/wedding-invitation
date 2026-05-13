/**
 * One-time script to get a Google OAuth2 refresh token.
 * 
 * Before running:
 *   1. Go to https://console.cloud.google.com/apis/credentials
 *   2. Click your OAuth 2.0 Client ID
 *   3. Add http://localhost:3333 to "Authorized redirect URIs"
 *   4. Save
 * 
 * Usage:
 *   node scripts/get-google-token.js
 */
const http = require("http");
const { URL } = require("url");

// Set these in your environment or .env.local before running
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Error: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables first.");
  process.exit(1);
}

const REDIRECT_URI = "http://localhost:3333";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;

console.log("\n1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Log in with your Google account and allow access");
console.log("3. You'll be redirected back here automatically\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400);
    res.end("No code received");
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.refresh_token) {
      console.log("\nSuccess! Add this to your .env.local:\n");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Success!</h1><p>You can close this tab. Check the terminal for your refresh token.</p>");
    } else {
      console.error("\nFailed. Response:", JSON.stringify(tokens, null, 2));
      res.writeHead(500);
      res.end("Failed to get refresh token. Check terminal for details.");
    }
  } catch (err) {
    console.error("Error:", err);
    res.writeHead(500);
    res.end("Error exchanging code for token.");
  }

  server.close();
});

server.listen(3333, () => {
  console.log("Waiting for authorization callback on http://localhost:3333 ...\n");
});
