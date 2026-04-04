const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

function getServiceAccountKey(): ServiceAccountKey {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }
  return JSON.parse(raw) as ServiceAccountKey;
}

function base64url(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createJWT(serviceAccount: ServiceAccountKey): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claimSet = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/drive.file",
      aud: serviceAccount.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );

  const signInput = `${header}.${claimSet}`;
  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign
    .sign(serviceAccount.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${signInput}.${signature}`;
}

async function getAccessToken(): Promise<string> {
  const serviceAccount = getServiceAccountKey();
  const jwt = await createJWT(serviceAccount);

  const response = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = (await response.json()) as GoogleTokenResponse;
  return data.access_token;
}

export function getGoogleDriveUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${fileId}`;
}

export function getGoogleDriveThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; url: string; thumbnailUrl: string }> {
  const accessToken = await getAccessToken();

  const metadata = JSON.stringify({
    name: fileName,
    parents: [GOOGLE_DRIVE_FOLDER_ID],
  });

  const boundary = "wedding_upload_boundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = Buffer.concat([
    Buffer.from(
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`
    ),
    Buffer.from(fileBuffer.toString("base64")),
    Buffer.from(closeDelimiter),
  ]);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed: ${response.status} ${errorText}`);
  }

  const file = (await response.json()) as GoogleDriveFile;

  // Make the file publicly readable
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  return {
    fileId: file.id,
    url: getGoogleDriveUrl(file.id),
    thumbnailUrl: getGoogleDriveThumbnailUrl(file.id),
  };
}

export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Google Drive delete failed: ${response.status}`);
  }
}
